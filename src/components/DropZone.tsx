import { useCallback, useState } from "react";
import { FileCode, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface DropZoneProps {
  onFilesSelected: (files: FileList) => void;
}

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

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        // Filter to keep only image files
        const imageFiles = Array.from(e.dataTransfer.files).filter((file) =>
          file.type.startsWith("image/"),
        );

        if (imageFiles.length > 0) {
          const dt = new DataTransfer();
          for (const file of imageFiles) {
            dt.items.add(file);
          }
          onFilesSelected(dt.files);
        }
      }
    },
    [onFilesSelected],
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesSelected(e.target.files);
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
        onClick={() => document.getElementById("file-input")?.click()}
      >
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="p-4 rounded-full bg-sushi-100 text-sushi-600">
            <Upload className="h-8 w-8" />
          </div>
          <div className="space-y-1">
            <p className="text-xl font-semibold">Drop images here</p>
            <p className="text-sm text-muted-foreground">
              PNG, JPG, WEBP, GIF, etc.
            </p>
          </div>
        </div>
      </Card>

      <div className="flex justify-center">
        <input
          id="file-input"
          type="file"
          className="hidden"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
        />
        <Button
          variant="outline"
          className="gap-2"
          onClick={() => document.getElementById("file-input")?.click()}
        >
          <FileCode className="h-4 w-4" />
          Select Images
        </Button>
      </div>
    </div>
  );
};
