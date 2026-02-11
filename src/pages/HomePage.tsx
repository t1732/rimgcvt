import { useState } from "react";
import { Play } from "lucide-react";

import { DropZone } from "@/components/DropZone";
import { FileItem } from "@/components/FileItem";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { canConvert } from "@/lib/image";

export const HomePage = () => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [targetFormat, setTargetFormat] = useState("webp");

  const handleFilesSelected = (fileList: FileList) => {
    const files = Array.from(fileList);
    setSelectedFiles((prev) => [...prev, ...files]);
    console.log("Files selected:", files);
  };

  const hasConvertibleFiles = selectedFiles.some((file) =>
    canConvert(file, targetFormat),
  );

  const handleStartConversion = () => {
    console.log("Starting conversion...");
    // TODO: Implement conversion logic
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
          <div className="mt-8 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between border-b pb-4">
              <h3 className="text-lg font-semibold">
                Selected Files ({selectedFiles.length})
              </h3>
              <div className="flex items-center gap-3 bg-muted/50 p-1.5 px-3 rounded-lg border">
                <span className="text-sm font-medium text-muted-foreground">
                  Convert to
                </span>
                <Select value={targetFormat} onValueChange={setTargetFormat}>
                  <SelectTrigger className="w-[110px] h-9 bg-background">
                    <SelectValue placeholder="Format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="webp">WEBP</SelectItem>
                    <SelectItem value="png">PNG</SelectItem>
                    <SelectItem value="jpg">JPG</SelectItem>
                    <SelectItem value="heic">HEIC</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {selectedFiles.map((file, i) => (
                <FileItem
                  key={`${file.name}-${i}`}
                  file={file}
                  targetFormat={targetFormat}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Spacer to prevent content from being hidden behind the floating bar */}
      {hasConvertibleFiles && <div className="h-32 w-full shrink-0" />}

      {/* Floating Bottom Action Bar */}
      {hasConvertibleFiles && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-8 duration-500 ease-out">
          <div className="bg-background/80 backdrop-blur-xl border border-primary/20 p-2 pl-6 rounded-full shadow-2xl flex items-center gap-6 ring-1 ring-black/5">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground leading-none mb-1">
                Ready to convert
              </span>
              <span className="text-sm font-semibold leading-none">
                {
                  selectedFiles.filter((f) => canConvert(f, targetFormat))
                    .length
                }{" "}
                files
              </span>
            </div>
            <Button
              size="lg"
              className="rounded-full px-8 gap-2 font-bold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all hover:scale-105 active:scale-95 h-12"
              onClick={handleStartConversion}
            >
              <Play className="h-4 w-4 fill-current" />
              Start Conversion
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
