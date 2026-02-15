import { useCallback, useEffect, useRef, useState } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { open } from "@tauri-apps/plugin-dialog";
import { Upload } from "lucide-react";

import { Card } from "@/components/ui/card";
import { useDuplicateDropPrevention } from "@/hooks/use-duplicate-drop-prevention";
import { resolvePathsToFiles } from "@/lib/file-utils";
import { cn } from "@/lib/utils";

export type FileStatus = "idle" | "converting" | "success" | "error";

interface DragDropPayload {
  type: "over" | "drop" | "cancel";
  paths?: string[];
}

/**
 * Normalize Tauri drag-drop event structure across different versions/platforms
 */
const normalizeDragDropEvent = (event: unknown): DragDropPayload => {
  const eventObj = event as {
    payload?: { type?: string; paths?: string[] };
    type?: string;
    paths?: string[];
  };

  const payload = eventObj.payload ?? eventObj;

  return {
    type: (payload.type as DragDropPayload["type"]) || "cancel",
    paths: payload.paths,
  };
};

export interface SelectedFile {
  path: string;
  name: string;
  size: number;
  status?: FileStatus;
  error?: string | null;
}

interface DropZoneProps {
  onFilesSelected: (files: SelectedFile[]) => void;
  disabled?: boolean;
  hasFiles?: boolean;
}

const SUPPORTED_IMAGE_EXTENSIONS = [
  "jpg",
  "jpeg",
  "png",
  "webp",
  "avif",
  "heic",
  "heif",
];

const isSupportedImagePath = (path: string) => {
  const extension = path.split(".").pop()?.toLowerCase();
  if (!extension) return false;
  return SUPPORTED_IMAGE_EXTENSIONS.includes(extension);
};

export const DropZone = ({
  onFilesSelected,
  disabled,
  hasFiles,
}: DropZoneProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const disabledRef = useRef(disabled ?? false);
  const onFilesSelectedRef = useRef(onFilesSelected);
  const { isDuplicate } = useDuplicateDropPrevention();

  useEffect(() => {
    disabledRef.current = disabled ?? false;
  }, [disabled]);

  useEffect(() => {
    onFilesSelectedRef.current = onFilesSelected;
  }, [onFilesSelected]);

  useEffect(() => {
    let unlistenDragDrop: (() => void) | undefined;

    const setupListeners = async () => {
      unlistenDragDrop = await getCurrentWindow().onDragDropEvent(
        async (event) => {
          const normalized = normalizeDragDropEvent(event);

          if (normalized.type === "over") {
            if (!disabledRef.current) {
              setIsDragging(true);
            }
            return;
          }

          if (normalized.type === "cancel") {
            setIsDragging(false);
            return;
          }

          if (normalized.type === "drop") {
            setIsDragging(false);
            if (disabledRef.current) return;

            const paths = Array.isArray(normalized.paths)
              ? normalized.paths
              : [];
            const imagePaths = paths.filter(isSupportedImagePath);
            if (imagePaths.length === 0) return;

            // Prevent duplicate drop events
            if (isDuplicate(imagePaths)) {
              return;
            }

            const files = await resolvePathsToFiles(imagePaths);
            if (files.length > 0) {
              onFilesSelectedRef.current(files);
            }
          }
        },
      );
    };

    setupListeners();

    return () => {
      unlistenDragDrop?.();
    };
  }, [isDuplicate]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      if (disabled) return;
    },
    [disabled],
  );

  const handleClick = async () => {
    try {
      const selected = await open({
        multiple: true,
        filters: [
          {
            name: "Images",
            extensions: SUPPORTED_IMAGE_EXTENSIONS,
          },
        ],
      });

      if (Array.isArray(selected)) {
        const imagePaths = selected.filter(isSupportedImagePath);
        const files = await resolvePathsToFiles(imagePaths);
        onFilesSelected(files);
      }
    } catch (error) {
      console.error("Failed to open dialog:", error);
    }
  };

  return (
    <div
      className={cn(
        "w-full max-w-2xl mx-auto space-y-4",
        disabled && "opacity-50 cursor-not-allowed",
      )}
    >
      <Card
        className={cn(
          "relative flex flex-col items-center justify-center border-2 border-dashed transition-all duration-500 ease-in-out",
          hasFiles ? "p-6" : "p-12",
          !disabled && "cursor-pointer",
          isDragging && !disabled
            ? "border-sushi-500 bg-sushi-50/50"
            : "border-muted-foreground/25 hover:border-sushi-400 hover:bg-muted/50",
        )}
        onDragOver={!disabled ? handleDragOver : undefined}
        onDragLeave={!disabled ? handleDragLeave : undefined}
        onDrop={!disabled ? handleDrop : undefined}
        onClick={!disabled ? handleClick : undefined}
      >
        <div
          className={cn(
            "flex flex-col items-center justify-center text-center transition-all duration-500",
            hasFiles ? "space-y-2" : "space-y-4",
          )}
        >
          <div
            className={cn(
              "rounded-full bg-sushi-100 text-sushi-600 transition-all duration-500",
              hasFiles ? "p-2" : "p-4",
            )}
          >
            <Upload
              className={cn(
                "transition-all duration-500",
                hasFiles ? "h-5 w-5" : "h-8 w-8",
              )}
            />
          </div>
          <div className="space-y-1">
            <p
              className={cn(
                "font-semibold transition-all duration-500",
                hasFiles ? "text-base" : "text-xl",
              )}
            >
              Click to select images
            </p>
            <p className="text-sm text-muted-foreground">JPG, PNG, WEBP</p>
          </div>
        </div>
      </Card>
    </div>
  );
};
