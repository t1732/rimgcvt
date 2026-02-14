use super::ConversionSettings;
use image::DynamicImage;
use std::io::Write;

pub fn convert_to_jpg<W: Write>(
    img: &DynamicImage,
    writer: W,
    settings: &ConversionSettings,
) -> anyhow::Result<()> {
    let mut encoder = image::codecs::jpeg::JpegEncoder::new_with_quality(writer, settings.quality);
    encoder.encode_image(img)?;
    Ok(())
}
