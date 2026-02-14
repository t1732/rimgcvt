import type { SelectedFile } from "@/components/DropZone";

export const isSameFormat = (filename: string, targetFormat: string) => {
  const extension = filename.split(".").pop()?.toLowerCase();
  if (!extension) return false;

  const normalizedTarget = targetFormat.toLowerCase();

  if (normalizedTarget === "jpg") {
    return extension === "jpg" || extension === "jpeg";
  }

  return extension === normalizedTarget;
};

// Allow conversion even for same format files (for lossy compression adjustment)
export const canConvert = (_file: SelectedFile, _targetFormat: string) => {
  return true;
};
