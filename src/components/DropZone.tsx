import { useCallback, useEffect, useRef, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { open } from "@tauri-apps/plugin-dialog";
import { Upload } from "lucide-react";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type FileStatus = "idle" | "converting" | "success" | "error";

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
}

const SUPPORTED_IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "webp"];

export const DropZone = ({ onFilesSelected, disabled }: DropZoneProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const disabledRef = useRef(disabled ?? false);
  const onFilesSelectedRef = useRef(onFilesSelected);
  const lastDropRef = useRef<{ key: string; at: number } | null>(null);

  useEffect(() => {
    disabledRef.current = disabled ?? false;
  }, [disabled]);

  useEffect(() => {
    onFilesSelectedRef.current = onFilesSelected;
  }, [onFilesSelected]);

  const resolvePathsToFiles = useCallback(async (paths: string[]) => {
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
  }, []);

  useEffect(() => {
    let unlistenDragDrop: (() => void) | undefined;

    const setupListeners = async () => {
      unlistenDragDrop = await getCurrentWindow().onDragDropEvent(
        async (event) => {
          const normalized = ((
            event as { payload?: { type?: string; paths?: string[] } }
          ).payload ?? (event as { type?: string; paths?: string[] })) as {
            type?: string;
            paths?: string[];
          };

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
            if (paths.length === 0) return;

            // Wry/Tauri can emit duplicate drop events on some platforms.
            const key = paths.join("|");
            const now = Date.now();
            const lastDrop = lastDropRef.current;
            if (lastDrop && lastDrop.key === key && now - lastDrop.at < 500) {
              return;
            }
            lastDropRef.current = { key, at: now };

            const files = await resolvePathsToFiles(paths);
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
  }, [resolvePathsToFiles]);

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
        const files = await resolvePathsToFiles(selected);
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
          "relative flex flex-col items-center justify-center p-12 border-2 border-dashed transition-colors duration-200 ease-in-out",
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
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="p-4 rounded-full bg-sushi-100 text-sushi-600">
            <Upload className="h-8 w-8" />
          </div>
          <div className="space-y-1">
            <p className="text-xl font-semibold">Click to select images</p>
            <p className="text-sm text-muted-foreground">JPG, PNG, WEBP</p>
          </div>
        </div>
      </Card>
    </div>
  );
};
