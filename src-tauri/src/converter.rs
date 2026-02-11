use image::ImageFormat;
use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use std::fs;

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

    let format = match format_ext {
        "jpg" => ImageFormat::Jpeg,
        "png" => ImageFormat::Png,
        "webp" => ImageFormat::WebP,
        _ => unreachable!(),
    };

    img.save_with_format(&output_path, format)?;

    Ok(output_path.to_string_lossy().to_string())
}
