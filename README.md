# rimgcvt

A modern, fast, and lightweight image converter application built with [Tauri](https://tauri.app/), [React](https://react.dev/), and Rust.

<p align="center">
  <img src="screenshot.png" width="600" alt="App Screenshot">
</p>

## Features

- **High-Performance Conversion**: Powered by Rust for blazing fast image processing.
- **Drag & Drop Interface**: Intuitive drag-and-drop area for easy file selection.
- **Format Support**:
  - **Input**: JPG, PNG, WEBP, AVIF, HEIC/HEIF
  - **Output**: JPG, PNG, WEBP, AVIF, HEIC
- **Quality Control**:
  - Adjustable compression quality (1-100) for supported formats.
  - Lossless compression support for PNG, WEBP, and AVIF.
- **Customizable Settings**:
  - Set default output directory.
  - File naming customization (prefix, conflict resolution).
  - Theme switching (Light / Dark / System).
- **Modern UI**: Built with Tailwind CSS and Shadcn/ui for a clean and responsive user experience.

## Tech Stack

- **Frontend**:
    - [React](https://react.dev/) (TypeScript)
    - [Tailwind CSS](https://tailwindcss.com/)
    - [Radix UI](https://www.radix-ui.com/) / [Shadcn/ui](https://ui.shadcn.com/)
    - [Lucide React](https://lucide.dev/) (Icons)
- **Backend / Core**:
    - [Tauri](https://tauri.app/) (v2)
    - [Rust](https://www.rust-lang.org/)
    - [image](https://github.com/image-rs/image) crate (with AVIF support)
    - [libheif-rs](https://github.com/Cykooz/libheif-rs) (HEIC/HEIF support)
    - [webpx](https://crates.io/crates/webpx) (WebP encoding)
    - [imagequant](https://crates.io/crates/imagequant) (Lossy PNG compression)
- **Build Tools**:
    - [Vite](https://vitejs.dev/)
    - [Bun](https://bun.sh/) (Package Manager)

## Getting Started

### Prerequisites

Ensure you have the following installed on your machine:

- **Node.js** (or [Bun](https://bun.sh/))
- **Rust** & Cargo (Install via [rustup](https://rustup.rs/))
- **System Dependencies** for Tauri (see [Tauri Prerequisites](https://tauri.app/v1/guides/getting-started/prerequisites))
- **Image Format Libraries** (required for HEIC/HEIF and AVIF support):
  - **macOS**:
    ```bash
    brew install libheif libavif meson ninja cmake
    ```
  - **Ubuntu/Debian**:
    ```bash
    sudo apt install libheif-dev libavif-dev meson ninja-build cmake
    ```
  - **Windows**: Automatically handled via vcpkg in GitHub Actions CI/CD

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/t1732/rimgcvt.git
   cd rimgcvt
   ```

2. **Install dependencies:**

   Using Bun (recommended):
   ```bash
   bun install
   ```
   Or using npm:
   ```bash
   npm install
   ```

3. **Run the development server:**

   ```bash
   bun tauri dev
   # or
   npm run tauri dev
   ```

This will start the Vite dev server and launch the Tauri application window.

## Usage

1. **Select Images**: Drag and drop images onto the window or click to select files.
2. **Choose Format**: Select the desired output format (JPG, PNG, WEBP, AVIF, HEIC).
3. **Adjust Quality**: Use the quality slider to control compression (applies to lossy formats).
4. **Convert**: Click the "Convert" button to process the images.
5. **Settings**: Use the settings menu to configure output paths, filename prefixes, conflict resolution, and themes.

## Building for Production

To build the application for distribution:

```bash
bun tauri build
# or
npm run tauri build
```

The build artifacts will be available in `src-tauri/target/release/bundle`.

### Cross-building from macOS to Windows (x86_64-pc-windows-msvc)

If you build for Windows from macOS (using `cargo-xwin` / `cargo-xwin` runner), some C sources (e.g. `libwebp-sys`) require SIMD features (SSSE3 / SSE4.1 / AVX / AVX2). When those target features are not passed to the compiler you may see errors like "requires target feature 'ssse3'".

A working approach is to set `TARGET_CFLAGS` to enable the CPU features before running the build. Example (zsh/bash):

```bash
export TARGET_CFLAGS="-mssse3 -msse4.1 -mavx -mavx2"
tauri build --runner cargo-xwin --target "x86_64-pc-windows-msvc"
```

If `clang-cl` rejects those flags, try using `clang` as the cross-compiler wrapper:

```bash
export CC_x86_64_pc_windows_msvc=clang
export TARGET_CFLAGS="-mssse3 -msse4.1 -mavx -mavx2"
tauri build --runner cargo-xwin --target "x86_64-pc-windows-msvc"
```

These commands were verified on macOS for this repository to address "always_inline ... requires target feature" compile errors when cross-compiling to `x86_64-pc-windows-msvc`.

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/)
- [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode)
- [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)
