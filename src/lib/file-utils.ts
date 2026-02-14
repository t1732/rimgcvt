import { invoke } from "@tauri-apps/api/core";

import type { SelectedFile } from "@/components/DropZone";

/**
 * Resolve file paths to SelectedFile objects with metadata
 */
export const resolvePathsToFiles = async (
  paths: string[],
): Promise<SelectedFile[]> => {
  const files: SelectedFile[] = await Promise.all(
    paths.map(async (path) => {
      const metadata = (await invoke("get_file_metadata", {
        path,
      }).catch(() => ({ size: 0 }))) as { size: number };
      return {
        path,
        name: path.split(/[/\\]/).pop() || "",
        size: metadata.size,
      };
    }),
  );

  return files;
};
