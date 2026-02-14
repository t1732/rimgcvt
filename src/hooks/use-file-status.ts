import { useCallback } from "react";

import type { FileStatus, SelectedFile } from "@/components/DropZone";

/**
 * Custom hook to manage file status updates with centralized logic
 */
export const useFileStatusManager = (
  setSelectedFiles: React.Dispatch<React.SetStateAction<SelectedFile[]>>,
) => {
  const updateFileStatus = useCallback(
    (path: string, status: FileStatus, error?: string | null) => {
      setSelectedFiles((prev) =>
        prev.map((f) =>
          f.path === path
            ? {
                ...f,
                status,
                error: error ?? undefined,
              }
            : f,
        ),
      );
    },
    [setSelectedFiles],
  );

  const initializeConvertibleFiles = useCallback(
    (targetFormat: string, canConvert: (file: SelectedFile, format: string) => boolean) => {
      setSelectedFiles((prev) =>
        prev.map((f) =>
          canConvert(f, targetFormat) ? { ...f, status: "idle" } : f,
        ),
      );
    },
    [setSelectedFiles],
  );

  return {
    updateFileStatus,
    initializeConvertibleFiles,
  };
};
