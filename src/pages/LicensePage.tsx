import { useEffect, useState } from "react";
import { getVersion } from "@tauri-apps/api/app";
import { ExternalLink } from "lucide-react";

interface Library {
  name: string;
  license: string;
  url: string;
  description: string;
}

const libraries: Library[] = [
  {
    name: "React",
    license: "MIT",
    url: "https://react.dev/",
    description: "The library for web and native user interfaces.",
  },
  {
    name: "React DOM",
    license: "MIT",
    url: "https://react.dev/",
    description: "React renderer for the web.",
  },
  {
    name: "Tauri",
    license: "MIT / Apache-2.0",
    url: "https://tauri.app/",
    description:
      "Build an optimized, secure, and frontend-independent application for multi-platform deployment.",
  },
  {
    name: "Tauri API",
    license: "MIT / Apache-2.0",
    url: "https://tauri.app/",
    description: "Tauri JavaScript API bindings.",
  },
  {
    name: "Vite",
    license: "MIT",
    url: "https://vite.dev/",
    description: "Next generation frontend tooling.",
  },
  {
    name: "@tailwindcss/vite",
    license: "MIT",
    url: "https://tailwindcss.com/",
    description: "Tailwind CSS integration for Vite.",
  },
  {
    name: "Tauri Plugin Dialog",
    license: "MIT / Apache-2.0",
    url: "https://github.com/tauri-apps/plugins-workspace",
    description: "Native system dialogs for Tauri.",
  },
  {
    name: "Tauri Plugin Opener",
    license: "MIT / Apache-2.0",
    url: "https://github.com/tauri-apps/plugins-workspace",
    description: "Open files and URLs with the default system application.",
  },
  {
    name: "@radix-ui/react-slot",
    license: "MIT",
    url: "https://www.radix-ui.com/",
    description: "Composable slot component for Radix UI.",
  },
  {
    name: "Lucide React",
    license: "ISC",
    url: "https://lucide.dev/",
    description: "Beautiful & consistent icons.",
  },
  {
    name: "Radix UI",
    license: "MIT",
    url: "https://www.radix-ui.com/",
    description: "An open-source UI component library.",
  },
  {
    name: "class-variance-authority",
    license: "MIT",
    url: "https://cva.style/",
    description: "Utility for defining variant-based class names.",
  },
  {
    name: "clsx",
    license: "MIT",
    url: "https://github.com/lukeed/clsx",
    description: "A tiny utility for constructing className strings.",
  },
  {
    name: "Tailwind CSS",
    license: "MIT",
    url: "https://tailwindcss.com/",
    description: "A utility-first CSS framework.",
  },
  {
    name: "tailwind-merge",
    license: "MIT",
    url: "https://github.com/dcastil/tailwind-merge",
    description: "Utility to merge Tailwind CSS classes without conflicts.",
  },
  {
    name: "tailwindcss-animate",
    license: "MIT",
    url: "https://github.com/jamiebuilds/tailwindcss-animate",
    description: "Animation utilities for Tailwind CSS.",
  },
  {
    name: "image (Rust Crate)",
    license: "MIT",
    url: "https://github.com/image-rs/image",
    description: "Imaging library written in Rust.",
  },
  {
    name: "webpx (Rust Crate)",
    license: "MIT / Apache-2.0",
    url: "https://github.com/jaredforth/webpx",
    description: "WEBP encoder/decoder bindings for Rust.",
  },
  {
    name: "imagequant (Rust Crate)",
    license: "MIT / Apache-2.0",
    url: "https://github.com/ImageOptim/imagequant",
    description: "High-quality color quantization.",
  },
  {
    name: "infer (Rust Crate)",
    license: "MIT",
    url: "https://github.com/bojand/infer",
    description: "Infer file type by checking magic bytes.",
  },
  {
    name: "libheif-rs (Rust Crate)",
    license: "MIT",
    url: "https://github.com/Cykooz/libheif-rs",
    description:
      "Safe Rust wrapper for libheif, supporting HEIC/HEIF image format.",
  },
  {
    name: "libavif-image (Rust Crate)",
    license: "MIT / Apache-2.0",
    url: "https://github.com/kornelski/libavif-image",
    description:
      "Safe Rust wrapper for libavif, supporting AVIF image decoding.",
  },
  {
    name: "anyhow (Rust Crate)",
    license: "MIT / Apache-2.0",
    url: "https://github.com/dtolnay/anyhow",
    description: "Flexible concrete error type built on std::error::Error.",
  },
  {
    name: "serde (Rust Crate)",
    license: "MIT / Apache-2.0",
    url: "https://serde.rs/",
    description: "A generic serialization/deserialization framework for Rust.",
  },
  {
    name: "serde_json (Rust Crate)",
    license: "MIT / Apache-2.0",
    url: "https://github.com/serde-rs/json",
    description: "JSON support for Serde.",
  },
  {
    name: "Biome",
    license: "MIT / Apache-2.0",
    url: "https://biomejs.dev/",
    description: "Toolchain for the web.",
  },
  {
    name: "@tauri-apps/cli",
    license: "MIT / Apache-2.0",
    url: "https://tauri.app/",
    description: "Tauri command-line interface.",
  },
  {
    name: "tauri-build (Rust Crate)",
    license: "MIT / Apache-2.0",
    url: "https://tauri.app/",
    description: "Build-time support for Tauri apps.",
  },
  {
    name: "@vitejs/plugin-react",
    license: "MIT",
    url: "https://vitejs.dev/",
    description: "Vite plugin for React and JSX.",
  },
  {
    name: "TypeScript",
    license: "Apache-2.0",
    url: "https://www.typescriptlang.org/",
    description: "Type-safe JavaScript with static typing.",
  },
  {
    name: "@types/node",
    license: "MIT",
    url: "https://github.com/DefinitelyTyped/DefinitelyTyped",
    description: "Type definitions for Node.js.",
  },
  {
    name: "@types/react",
    license: "MIT",
    url: "https://github.com/DefinitelyTyped/DefinitelyTyped",
    description: "Type definitions for React.",
  },
  {
    name: "@types/react-dom",
    license: "MIT",
    url: "https://github.com/DefinitelyTyped/DefinitelyTyped",
    description: "Type definitions for React DOM.",
  },
  {
    name: "PostCSS",
    license: "MIT",
    url: "https://postcss.org/",
    description: "Tool for transforming CSS with JavaScript.",
  },
  {
    name: "Autoprefixer",
    license: "MIT",
    url: "https://github.com/postcss/autoprefixer",
    description: "Adds vendor prefixes to CSS rules.",
  },
  {
    name: "tailwindcss",
    license: "MIT",
    url: "https://tailwindcss.com/",
    description: "Utility-first CSS framework core package.",
  },
];

export const LicensePage = () => {
  const [version, setVersion] = useState<string>("");

  useEffect(() => {
    getVersion().then(setVersion);
  }, []);

  return (
    <div className="container mx-auto p-8 flex flex-col items-center">
      <div className="w-full max-w-4xl space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">
            Open Source Licenses
          </h2>
          <p className="text-muted-foreground">
            We are grateful to the open source community for the following
            libraries.
          </p>
        </div>

        <div className="grid gap-6">
          {libraries.map((lib) => (
            <div
              key={lib.name}
              className="group relative p-6 bg-card border rounded-2xl transition-all hover:shadow-lg hover:border-primary/20"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-lg">{lib.name}</h3>
                    <span className="text-xs font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded uppercase">
                      {lib.license}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {lib.description}
                  </p>
                </div>
                <a
                  href={lib.url}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-primary"
                >
                  <ExternalLink className="h-5 w-5" />
                </a>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-8 text-center text-xs text-muted-foreground">
          <p>This application also uses many other open source libraries.</p>
          <p className="mt-1">© 2026 RIMGCVT Contributors</p>
          {version && <p className="mt-1">Version {version}</p>}
        </div>
      </div>
    </div>
  );
};
