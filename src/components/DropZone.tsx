import { useCallback, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import { Upload } from "lucide-react";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface SelectedFile {
  path: string;
  name: string;
  size: number;
}

interface DropZoneProps {
  onFilesSelected: (files: SelectedFile[]) => void;
}

const SUPPORTED_IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "webp"];

export const DropZone = ({ onFilesSelected }: DropZoneProps) => {
  const [isDragging, setIsDragging] = useState(false);

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

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    // Note: Tauri's drag-drop-enabled is false in tauri.conf.json
    // If we want to support browser-based drop but get paths,
    // it's tricky since browser File objects don't have paths.
    // However, we can use the dialog to select instead.
    console.log("Drop event detected, but we need paths. Encouraging click.");
  }, []);

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
        const files: SelectedFile[] = await Promise.all(
          selected.map(async (path) => {
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
        onFilesSelected(files);
      }
    } catch (error) {
      console.error("Failed to open dialog:", error);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      <Card
        className={cn(
          "relative flex flex-col items-center justify-center p-12 border-2 border-dashed transition-colors duration-200 ease-in-out cursor-pointer",
          isDragging
            ? "border-sushi-500 bg-sushi-50/50"
            : "border-muted-foreground/25 hover:border-sushi-400 hover:bg-muted/50",
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
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
