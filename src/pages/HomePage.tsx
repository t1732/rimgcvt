import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Check, Loader2, Play } from "lucide-react";

import { DropZone, type SelectedFile } from "@/components/DropZone";
import { FileItem } from "@/components/FileItem";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSettings } from "@/contexts/SettingsContext";
import { canConvert } from "@/lib/image";
import { cn } from "@/lib/utils";

export const HomePage = () => {
  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);
  const [targetFormat, setTargetFormat] = useState("webp");
  const [isConverting, setIsConverting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const { settings } = useSettings();

  const handleFilesSelected = (files: SelectedFile[]) => {
    setSelectedFiles((prev) => [...prev, ...files]);
    setIsComplete(false);
  };

  const hasConvertibleFiles = selectedFiles.some((file) =>
    canConvert(file, targetFormat),
  );

  const handleStartConversion = async () => {
    if (isConverting) return;

    setIsConverting(true);
    setIsComplete(false);

    try {
      const convertibleFiles = selectedFiles.filter((f) =>
        canConvert(f, targetFormat),
      );
      const paths = convertibleFiles.map((f) => f.path);

      const results = await invoke("convert_images", {
        paths,
        targetFormat,
        settings: {
          output_path: settings.outputPath,
          file_prefix: settings.filePrefix,
          conflict_resolution: settings.conflictResolution,
        },
      });

      console.log("Conversion results:", results);
      setIsComplete(true);
      // Optional: Clear selection or show results
    } catch (error) {
      console.error("Conversion failed:", error);
    } finally {
      setIsConverting(false);
    }
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
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2">
              {selectedFiles.map((file, i) => (
                <FileItem
                  key={`${file.path}-${i}`}
                  file={file}
                  targetFormat={targetFormat}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Spacer to prevent content from being hidden behind the floating bar */}
      {(hasConvertibleFiles || isComplete) && (
        <div className="h-32 w-full shrink-0" />
      )}

      {/* Floating Bottom Action Bar */}
      {(hasConvertibleFiles || isComplete) && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-8 duration-500 ease-out">
          <div className="bg-background/80 backdrop-blur-xl border border-primary/20 p-2 pl-6 rounded-full shadow-2xl flex items-center gap-6 ring-1 ring-black/5">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground leading-none mb-1">
                {isComplete ? "Conversion task" : "Ready to convert"}
              </span>
              <span className="text-sm font-semibold leading-none">
                {isComplete
                  ? "Completed"
                  : `${
                      selectedFiles.filter((f) => canConvert(f, targetFormat))
                        .length
                    } files`}
              </span>
            </div>
            <Button
              size="lg"
              className={cn(
                "rounded-full px-8 gap-2 font-bold shadow-lg transition-all hover:scale-105 active:scale-95 h-12",
                isComplete
                  ? "bg-sushi-500 hover:bg-sushi-600 shadow-sushi-500/25 hover:shadow-sushi-500/40"
                  : "shadow-primary/25 hover:shadow-primary/40",
              )}
              onClick={handleStartConversion}
              disabled={isConverting || (isComplete && !hasConvertibleFiles)}
            >
              {isConverting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : isComplete ? (
                <Check className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4 fill-current" />
              )}
              {isConverting
                ? "Converting..."
                : isComplete
                  ? "Done!"
                  : "Start Conversion"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
