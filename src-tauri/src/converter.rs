use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use std::fs;
use webpx::{Encoder, Unstoppable};
use std::io::Write;

#[derive(Debug, Serialize, Deserialize)]
pub enum ConflictResolution {
    #[serde(rename = "overwrite")]
    Overwrite,
    #[serde(rename = "numbering")]
    Numbering,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ConversionSettings {
    pub output_path: String,
    pub file_prefix: String,
    pub conflict_resolution: ConflictResolution,
    pub quality: u8,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ConversionResult {
    pub source_path: String,
    pub output_path: Option<String>,
    pub success: bool,
    pub error: Option<String>,
}

pub fn convert_image(
    source_path: &str,
    target_format: &str,
    settings: &ConversionSettings,
) -> anyhow::Result<String> {
    let source_path_buf = PathBuf::from(source_path);
    let img = image::open(&source_path_buf)?;

    let stem = source_path_buf
        .file_stem()
        .and_then(|s| s.to_str())
        .unwrap_or("image");

    let format_ext = match target_format.to_lowercase().as_str() {
        "jpg" | "jpeg" => "jpg",
        "png" => "png",
        "webp" => "webp",
        _ => return Err(anyhow::anyhow!("Unsupported format: {}", target_format)),
    };

    let filename = format!("{}{}.{}", settings.file_prefix, stem, format_ext);
    let mut output_path = PathBuf::from(&settings.output_path).join(&filename);

    if let ConflictResolution::Numbering = settings.conflict_resolution {
        let mut count = 1;
        while output_path.exists() {
            let numbered_filename = format!(
                "{}{}_{}.{}",
                settings.file_prefix, stem, count, format_ext
            );
            output_path = PathBuf::from(&settings.output_path).join(&numbered_filename);
            count += 1;
        }
    }

    // Ensure output directory exists
    if let Some(parent) = output_path.parent() {
        fs::create_dir_all(parent)?;
    }

    let file = fs::File::create(&output_path)?;
    let mut writer = std::io::BufWriter::new(file);

    match format_ext {
        "jpg" => {
            let mut encoder = image::codecs::jpeg::JpegEncoder::new_with_quality(&mut writer, settings.quality);
            encoder.encode_image(&img)?;
        }
        "webp" => {
            let rgba = img.to_rgba8();
            let (width, height) = rgba.dimensions();
            let encoder = Encoder::new_rgba(&rgba, width, height)
                .quality(settings.quality as f32);

            let webp_data = encoder.encode(Unstoppable)?;
            writer.write_all(&webp_data)?;
        }
        "png" => {
            // Apply pseudo-lossy quantization using imagequant
            let rgba = img.to_rgba8();
            let (width, height) = rgba.dimensions();

            // Calculate number of colors based on quality
            let colors = (256.0 - (settings.quality as f32 / 100.0) * 200.0).max(2.0) as u32;

            // Use imagequant for color quantization
            let mut liq = imagequant::new();
            liq.set_max_colors(colors)?;

            let rgba_vec: Vec<imagequant::RGBA> = rgba.pixels()
                .map(|p| imagequant::RGBA {
                    r: p[0],
                    g: p[1],
                    b: p[2],
                    a: p[3],
                })
                .collect();

            let mut img_data = imagequant::Image::new(&liq, rgba_vec.into_boxed_slice(), width as usize, height as usize, 0.0)?;
            let mut res = liq.quantize(&mut img_data)?;
            res.set_dithering_level(0.5)?;

            let (palette, pixels) = res.remapped(&mut img_data)?;

            // Convert back to RGB and save as PNG
            let mut rgb_data = Vec::with_capacity(width as usize * height as usize * 3);
            for &idx in &pixels {
                let color = palette[idx as usize];
                rgb_data.push(color.r);
                rgb_data.push(color.g);
                rgb_data.push(color.b);
            }

            let quantized_img = image::RgbImage::from_raw(width, height, rgb_data)
                .ok_or_else(|| anyhow::anyhow!("Failed to create quantized image"))?;

            quantized_img.write_to(&mut writer, image::ImageFormat::Png)?;
        }
        _ => unreachable!(),
    }

    Ok(output_path.to_string_lossy().to_string())
}
