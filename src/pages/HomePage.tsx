import { useState } from "react";

import { DropZone } from "@/components/DropZone";
import { FileItem } from "@/components/FileItem";

export function HomePage() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const handleFilesSelected = (fileList: FileList) => {
    const files = Array.from(fileList);
    setSelectedFiles((prev) => [...prev, ...files]);
    console.log("Files selected:", files);
  };

  return (
    <div className="container mx-auto p-8 flex flex-col items-center min-h-[calc(100vh-4rem)]">
      <div className="w-full max-w-4xl space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">
            Convert your images
          </h2>
          <p className="text-muted-foreground">
            Easy, fast and secure image conversion.
          </p>
        </div>

        <DropZone onFilesSelected={handleFilesSelected} />

        {selectedFiles.length > 0 && (
          <div className="mt-8 space-y-4">
            <h3 className="text-lg font-semibold">
              Selected Files ({selectedFiles.length})
            </h3>
            <div className="grid grid-cols-1 gap-2">
              {selectedFiles.map((file, i) => (
                <FileItem key={`${file.name}-${i}`} file={file} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
