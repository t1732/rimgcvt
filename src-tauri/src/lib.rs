mod converter;

use converter::{convert_image, ConversionResult, ConversionSettings};

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
}

#[tauri::command]
fn get_file_metadata(path: String) -> Result<FileMetadata, String> {
    std::fs::metadata(path)
        .map(|m| FileMetadata { size: m.len() })
        .map_err(|e| e.to_string())
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
