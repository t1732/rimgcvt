import { useCallback, useState } from "react";
import { Upload } from "lucide-react";

import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface DropZoneProps {
  onFilesSelected: (files: FileList) => void;
}

const filterImageFiles = (files: FileList | null): File[] => {
  if (!files) return [];
  return Array.from(files).filter((file) => file.type.startsWith("image/"));
};

const handleFiles = (
  files: FileList | null,
  onFilesSelected: (files: FileList) => void,
) => {
  const imageFiles = filterImageFiles(files);
  if (imageFiles.length > 0) {
    const dt = new DataTransfer();
    for (const file of imageFiles) {
      dt.items.add(file);
    }
    onFilesSelected(dt.files);
  }
};

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
      handleFiles(e.dataTransfer.files, onFilesSelected);
    },
    [onFilesSelected],
  );

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files, onFilesSelected);
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
            <p className="text-xl font-semibold">
              Drop images here or click to select
            </p>
            <p className="text-sm text-muted-foreground">
              PNG, JPG, WEBP, GIF, etc.
            </p>
          </div>
        </div>
      </Card>

      <input
        id="file-input"
        type="file"
        className="hidden"
        multiple
        accept="image/*"
        onChange={handleFileSelect}
      />
    </div>
  );
};
