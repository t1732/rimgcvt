use super::ConversionSettings;
use image::DynamicImage;
use std::io::Write;
use std::path::Path;

pub fn avif_to_dynamic_image(path: impl AsRef<Path>) -> anyhow::Result<DynamicImage> {
    let data = std::fs::read(path)?;
    let img = libavif_image::read(&data)?;
    Ok(img)
}

pub fn convert_to_avif<W: Write>(
    img: &DynamicImage,
    mut writer: W,
    settings: &ConversionSettings,
) -> anyhow::Result<()> {
    // Use libavif-image for encoding with quality/lossless control
    // libavif-image wraps ravif and provides more control over encoding parameters

    // Configure encoder based on settings
    let quality = if settings.lossless {
        // For lossless, use maximum quality (100)
        100
    } else {
        // Map quality from 1-100 to ravif's expected range
        settings.quality.max(1).min(100)
    };

    // Encode using libavif-image
    // The quality parameter controls the encoding quality
    // Higher values = better quality but larger file size
    let encoded = libavif_image::write(img, quality as i32)?;

    writer.write_all(&encoded)?;
    Ok(())
}
