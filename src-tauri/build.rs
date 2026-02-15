fn main() {
    // Configure libheif for static linking on Windows
    #[cfg(target_os = "windows")]
    {
        println!("cargo:rustc-env=LIBHEIF_STATIC=1");

        // Windows native build paths (vcpkg, msys2, etc.)
        if let Ok(vcpkg_root) = std::env::var("VCPKG_ROOT") {
            println!("cargo:rustc-link-search=native={}/lib", vcpkg_root);
        }

        // Fallback paths for common Windows build environments
        println!("cargo:rustc-link-search=native=C:/vcpkg/installed/x64-windows/lib");
        println!("cargo:rustc-link-search=native=C:/Program Files/libheif/lib");
    }

    tauri_build::build()
}
