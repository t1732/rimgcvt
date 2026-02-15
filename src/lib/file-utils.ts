import { invoke } from "@tauri-apps/api/core";

import type { SelectedFile } from "@/components/DropZone";

/**
 * Resolve file paths to SelectedFile objects with metadata
 */
const SUPPORTED_IMAGE_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);

export const resolvePathsToFiles = async (
  paths: string[],
): Promise<SelectedFile[]> => {
  const files = await Promise.all(
    paths.map(async (path) => {
      const metadata = (await invoke("get_file_metadata", {
        path,
      }).catch(() => ({ size: 0, mime_type: "" }))) as {
        size: number;
        mime_type: string;
      };
      if (!SUPPORTED_IMAGE_MIME_TYPES.has(metadata.mime_type)) {
        return null;
      }
      return {
        path,
        name: path.split(/[/\\]/).pop() || "",
        size: metadata.size,
      };
    }),
  );

  return files.filter((file): file is SelectedFile => file !== null);
};

const isWindowsDrivePath = (path: string) => /^\/[A-Za-z]:\//.test(path);

/**
 * Normalize file paths so convertFileSrc can load them on Windows (WebView2).
 */
export const normalizeFilePathForAsset = (path: string) => {
  let normalized = path;

  if (normalized.startsWith("file://")) {
    try {
      const parsed = new URL(normalized);
      normalized = decodeURIComponent(parsed.pathname);
      if (isWindowsDrivePath(normalized)) {
        normalized = normalized.slice(1);
      }
    } catch {
      normalized = normalized.replace(/^file:\/+/i, "");
    }
  }

  if (normalized.startsWith("\\\\?\\")) {
    if (normalized.startsWith("\\\\?\\UNC\\")) {
      normalized = `\\\\${normalized.slice(8)}`;
    } else {
      normalized = normalized.slice(4);
    }
  }

  return normalized.replace(/\\/g, "/");
};
