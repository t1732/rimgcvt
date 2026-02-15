use super::ConversionSettings;
use image::DynamicImage;
use std::io::Write;

/// Decode HEIC/HEIF file to DynamicImage
pub fn heic_to_dynamic_image(source_path: &str) -> anyhow::Result<DynamicImage> {
    // Read and parse HEIC file
    let ctx = libheif_rs::HeifContext::read_from_file(source_path)
        .map_err(|e| anyhow::anyhow!("Failed to read HEIC file: {:?}", e))?;

    // Get the primary image handle
    let handle = ctx
        .primary_image_handle()
        .map_err(|e| anyhow::anyhow!("Failed to get primary image handle: {:?}", e))?;

    // Create LibHeif instance for decoding
    let lib_heif = libheif_rs::LibHeif::new();

    // Decode image to RGB color space
    let image = lib_heif
        .decode(
            &handle,
            libheif_rs::ColorSpace::Rgb(libheif_rs::RgbChroma::Rgb),
            None,
        )
        .map_err(|e| anyhow::anyhow!("Failed to decode HEIC image: {:?}", e))?;

    let width = image.width() as u32;
    let height = image.height() as u32;

    // Extract pixel data from interleaved plane
    let planes = image.planes();
    let interleaved_plane = planes
        .interleaved
        .ok_or_else(|| anyhow::anyhow!("Failed to get interleaved plane from HEIC"))?;

    let data = interleaved_plane.data.to_vec();

    // Create RgbImage from raw interleaved RGB data
    let rgb_image = image::RgbImage::from_raw(width, height, data)
        .ok_or_else(|| anyhow::anyhow!("Failed to create RGB image from HEIC data"))?;

    // Convert to DynamicImage
    Ok(DynamicImage::ImageRgb8(rgb_image))
}

/// Convert DynamicImage to HEIC format and write to writer
pub fn convert_to_heic<W: Write>(
    img: &DynamicImage,
    writer: W,
    settings: &ConversionSettings,
) -> anyhow::Result<()> {
    // Convert input to RGB8 if needed
    let rgb_image = img.to_rgb8();
    let (width, height) = rgb_image.dimensions();

    // Create a new HEIC image (requires u32)
    let mut heif_img = libheif_rs::Image::new(
        width,
        height,
        libheif_rs::ColorSpace::Rgb(libheif_rs::RgbChroma::C444),
    )
    .map_err(|e| anyhow::anyhow!("Failed to create HEIC image: {:?}", e))?;

    // Create RGB planes (requires u32)
    heif_img
        .create_plane(libheif_rs::Channel::R, width, height, 8)
        .map_err(|e| anyhow::anyhow!("Failed to create R plane: {:?}", e))?;
    heif_img
        .create_plane(libheif_rs::Channel::G, width, height, 8)
        .map_err(|e| anyhow::anyhow!("Failed to create G plane: {:?}", e))?;
    heif_img
        .create_plane(libheif_rs::Channel::B, width, height, 8)
        .map_err(|e| anyhow::anyhow!("Failed to create B plane: {:?}", e))?;

    // Get mutable references to planes and fill with data
    {
        let mut planes = heif_img.planes_mut();
        let plane_r = planes
            .r
            .as_mut()
            .ok_or_else(|| anyhow::anyhow!("Failed to get R plane data"))?;
        let plane_g = planes
            .g
            .as_mut()
            .ok_or_else(|| anyhow::anyhow!("Failed to get G plane data"))?;
        let plane_b = planes
            .b
            .as_mut()
            .ok_or_else(|| anyhow::anyhow!("Failed to get B plane data"))?;

        // Fill planes from RGB data
        let rgb_data = rgb_image.as_raw();
        let stride_r = plane_r.stride;
        let stride_g = plane_g.stride;
        let stride_b = plane_b.stride;

        let mut pixel_index = 0;
        for y in 0..height {
            let mut row_offset_r = (y as usize) * stride_r;
            let mut row_offset_g = (y as usize) * stride_g;
            let mut row_offset_b = (y as usize) * stride_b;

            for _x in 0..width {
                let r = rgb_data[pixel_index];
                let g = rgb_data[pixel_index + 1];
                let b = rgb_data[pixel_index + 2];

                plane_r.data[row_offset_r] = r;
                plane_g.data[row_offset_g] = g;
                plane_b.data[row_offset_b] = b;

                row_offset_r += 1;
                row_offset_g += 1;
                row_offset_b += 1;
                pixel_index += 3;
            }
        }
    }

    // Create encoder and encode
    let lib_heif = libheif_rs::LibHeif::new();

    // Choose encoder based on quality and lossless settings
    let compression_format = if settings.lossless {
        libheif_rs::CompressionFormat::Hevc
    } else {
        libheif_rs::CompressionFormat::Av1
    };

    let mut encoder = lib_heif
        .encoder_for_format(compression_format)
        .map_err(|e| anyhow::anyhow!("Failed to create encoder: {:?}", e))?;

    // Set quality based on settings
    if settings.lossless {
        encoder
            .set_quality(libheif_rs::EncoderQuality::LossLess)
            .map_err(|e| anyhow::anyhow!("Failed to set lossless: {:?}", e))?;
    } else {
        encoder
            .set_quality(libheif_rs::EncoderQuality::Lossy(settings.quality))
            .map_err(|e| anyhow::anyhow!("Failed to set lossy quality: {:?}", e))?;
    }

    // Encode to context
    let mut context = libheif_rs::HeifContext::new()
        .map_err(|e| anyhow::anyhow!("Failed to create HEIC context: {:?}", e))?;

    context
        .encode_image(&heif_img, &mut encoder, None)
        .map_err(|e| anyhow::anyhow!("Failed to encode image: {:?}", e))?;

    // Write to temporary file first, then transfer to writer
    // (libheif-rs requires file paths, not arbitrary writers)
    let temp_path = std::env::temp_dir().join(format!(
        "rimgcvt_heic_{}.heic",
        std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap_or_default()
            .as_nanos()
    ));

    context
        .write_to_file(
            temp_path
                .to_str()
                .ok_or_else(|| anyhow::anyhow!("Failed to convert temp path to string"))?,
        )
        .map_err(|e| anyhow::anyhow!("Failed to write HEIC file: {:?}", e))?;

    // Read temp file and write to provided writer
    let temp_data = std::fs::read(&temp_path)
        .map_err(|e| anyhow::anyhow!("Failed to read temp HEIC file: {:?}", e))?;

    // Clean up temp file
    let _ = std::fs::remove_file(&temp_path);

    // Write data to output writer
    let mut w = writer;
    w.write_all(&temp_data)
        .map_err(|e| anyhow::anyhow!("Failed to write HEIC data to output: {:?}", e))?;

    Ok(())
}
