mod converter;

use converter::{convert_image, ConversionResult, ConversionSettings};
use std::io::Read;

#[tauri::command]
async fn convert_images(
    paths: Vec<String>,
    target_format: String,
    settings: ConversionSettings,
) -> Vec<ConversionResult> {
    let mut results = Vec::new();

    for path in paths {
        match convert_image(&path, &target_format, &settings) {
            Ok(output_path) => results.push(ConversionResult {
                source_path: path,
                output_path: Some(output_path),
                success: true,
                error: None,
            }),
            Err(e) => results.push(ConversionResult {
                source_path: path,
                output_path: None,
                success: false,
                error: Some(e.to_string()),
            }),
        }
    }

    results
}

#[derive(Debug, serde::Serialize)]
struct FileMetadata {
    size: u64,
    mime_type: String,
}

#[tauri::command]
fn get_file_metadata(path: String) -> Result<FileMetadata, String> {
    let metadata = std::fs::metadata(&path).map_err(|e| e.to_string())?;
    let mut file = std::fs::File::open(&path).map_err(|e| e.to_string())?;
    let mut buffer = [0u8; 8192];
    let bytes_read = file.read(&mut buffer).map_err(|e| e.to_string())?;
    let mime_type = infer::get(&buffer[..bytes_read])
        .map(|kind| kind.mime_type().to_string())
        .unwrap_or_else(|| "application/octet-stream".to_string());

    Ok(FileMetadata {
        size: metadata.len(),
        mime_type,
    })
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![convert_images, get_file_metadata])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
