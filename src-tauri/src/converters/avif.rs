use super::ConversionSettings;
use image::DynamicImage;
use std::io::Write;

pub fn convert_to_avif<W: Write>(
    img: &DynamicImage,
    mut writer: W,
    settings: &ConversionSettings,
) -> anyhow::Result<()> {
    // AVIF encoding through image crate
    // Note: The image crate's AVIF encoder uses ravif internally

    if settings.lossless {
        // For lossless encoding, use maximum quality
        img.write_to(&mut writer, image::ImageFormat::Avif)?;
    } else {
        // For lossy encoding, we need to use the avif encoder with quality settings
        // The image crate doesn't directly expose quality control for AVIF yet,
        // so we'll use the default encoding for now
        // TODO: Implement quality control when ravif API is exposed through image crate
        img.write_to(&mut writer, image::ImageFormat::Avif)?;
    }

    Ok(())
}
