use super::ConversionSettings;
use image::DynamicImage;
use std::io::{Seek, Write};

pub fn convert_to_png<W: Write + Seek>(
    img: &DynamicImage,
    mut writer: W,
    settings: &ConversionSettings,
) -> anyhow::Result<()> {
    if settings.lossless {
        img.write_to(&mut writer, image::ImageFormat::Png)?;
    } else {
        // Apply pseudo-lossy quantization using imagequant
        let rgba = img.to_rgba8();
        let (width, height) = rgba.dimensions();

        // Calculate number of colors based on quality
        let colors = (256.0 - (settings.quality as f32 / 100.0) * 200.0).max(2.0) as u32;

        // Use imagequant for color quantization
        let mut liq = imagequant::new();
        liq.set_max_colors(colors)?;

        let rgba_vec: Vec<imagequant::RGBA> = rgba
            .pixels()
            .map(|p| imagequant::RGBA {
                r: p[0],
                g: p[1],
                b: p[2],
                a: p[3],
            })
            .collect();

        let mut img_data = imagequant::Image::new(
            &liq,
            rgba_vec.into_boxed_slice(),
            width as usize,
            height as usize,
            0.0,
        )?;
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

    Ok(())
}
