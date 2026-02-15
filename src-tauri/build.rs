fn main() {
    // Configure libheif for Windows
    #[cfg(target_os = "windows")]
    {
        // Try VCPKG_ROOT first, then VCPKG_INSTALLATION_ROOT (set by ilammy/msvc-dev-cmd)
        let vcpkg_root = std::env::var("VCPKG_ROOT")
            .or_else(|_| std::env::var("VCPKG_INSTALLATION_ROOT"))
            .unwrap_or_default();

        if !vcpkg_root.is_empty() {
            println!(
                "cargo:rustc-link-search=native={}/installed/x64-windows/lib",
                vcpkg_root
            );
            println!(
                "cargo:rustc-link-search=native={}/installed/x64-windows-static/lib",
                vcpkg_root
            );
        } else {
            // Fallback for local development
            println!("cargo:rustc-link-search=native=C:/vcpkg/installed/x64-windows/lib");
            println!("cargo:rustc-link-search=native=C:/Program Files/libheif/lib");
        }
    }

    tauri_build::build()
}
