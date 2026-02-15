use serde::{Deserialize, Serialize};

pub mod avif;
pub mod jpg;
pub mod png;
pub mod webp;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum ConflictResolution {
    #[serde(rename = "overwrite")]
    Overwrite,
    #[serde(rename = "numbering")]
    Numbering,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ConversionSettings {
    pub output_path: String,
    pub file_prefix: String,
    pub conflict_resolution: ConflictResolution,
    pub quality: u8,
    pub lossless: bool,
}
