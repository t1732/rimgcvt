use super::ConversionSettings;
use image::DynamicImage;
use std::io::Write;
use webpx::{Encoder, EncoderConfig, Unstoppable};

pub fn convert_to_webp<W: Write>(
    img: &DynamicImage,
    writer: W,
    settings: &ConversionSettings,
) -> anyhow::Result<()> {
    let rgba = img.to_rgba8();
    let (width, height) = rgba.dimensions();
    let webp_data = if settings.lossless {
        EncoderConfig::new_lossless().encode_rgba(&rgba, width, height, Unstoppable)?
    } else {
        Encoder::new_rgba(&rgba, width, height)
            .quality(settings.quality as f32)
            .encode(Unstoppable)?
    };

    let mut writer = writer;
    writer.write_all(&webp_data)?;
    Ok(())
}
