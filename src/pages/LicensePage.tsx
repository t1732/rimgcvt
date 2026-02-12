import { ExternalLink } from "lucide-react";

interface Library {
  name: string;
  version: string;
  license: string;
  url: string;
  description: string;
}

const libraries: Library[] = [
  {
    name: "React",
    version: "19.1.0",
    license: "MIT",
    url: "https://react.dev/",
    description: "The library for web and native user interfaces.",
  },
  {
    name: "Tauri",
    version: "2.0.0",
    license: "MIT / Apache-2.0",
    url: "https://tauri.app/",
    description:
      "Build an optimized, secure, and frontend-independent application for multi-platform deployment.",
  },
  {
    name: "Lucide React",
    version: "0.563.0",
    license: "ISC",
    url: "https://lucide.dev/",
    description: "Beautiful & consistent icons.",
  },
  {
    name: "Radix UI",
    version: "1.4.3",
    license: "MIT",
    url: "https://www.radix-ui.com/",
    description: "An open-source UI component library.",
  },
  {
    name: "Tailwind CSS",
    version: "4.1.18",
    license: "MIT",
    url: "https://tailwindcss.com/",
    description: "A utility-first CSS framework.",
  },
  {
    name: "image (Rust Crate)",
    version: "0.25.9",
    license: "MIT",
    url: "https://github.com/image-rs/image",
    description: "Imaging library written in Rust.",
  },
  {
    name: "anyhow (Rust Crate)",
    version: "1.0.101",
    license: "MIT / Apache-2.0",
    url: "https://github.com/dtolnay/anyhow",
    description: "Flexible concrete error type built on std::error::Error.",
  },
  {
    name: "serde (Rust Crate)",
    version: "1.0",
    license: "MIT / Apache-2.0",
    url: "https://serde.rs/",
    description: "A generic serialization/deserialization framework for Rust.",
  },
  {
    name: "Biome",
    version: "2.3.13",
    license: "MIT / Apache-2.0",
    url: "https://biomejs.dev/",
    description: "Toolchain for the web.",
  },
];

export const LicensePage = () => {
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
                    <span className="text-xs font-mono bg-muted px-2 py-0.5 rounded text-muted-foreground">
                      {lib.version}
                    </span>
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
          <p className="mt-1">© 2026 IMGCVT Contributors</p>
        </div>
      </div>
    </div>
  );
};
