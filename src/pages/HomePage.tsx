import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Check, ChevronDown, Loader2, Play, Settings2 } from "lucide-react";

import { DropZone, type SelectedFile } from "@/components/DropZone";
import { FileItem } from "@/components/FileItem";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useSettings } from "@/contexts/SettingsContext";
import { canConvert } from "@/lib/image";
import { cn } from "@/lib/utils";

interface ConversionResult {
  source_path: string;
  output_path: string | null;
  success: boolean;
  error: string | null;
}

export const HomePage = () => {
  const [selectedFiles, setSelectedFiles] = useState<SelectedFile[]>([]);
  const [targetFormat, setTargetFormat] = useState("webp");
  const [isConverting, setIsConverting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const { settings } = useSettings();
  const [localQuality, setLocalQuality] = useState(settings.defaultQuality);

  // Sync local quality with settings initially or when format changes to help user
  useState(() => {
    setLocalQuality(settings.defaultQuality);
  });

  const handleFilesSelected = (files: SelectedFile[]) => {
    setSelectedFiles((prev) => [...prev, ...files]);
    setIsComplete(false);
  };

  const handleReset = () => {
    setSelectedFiles([]);
    setIsComplete(false);
  };

  const hasConvertibleFiles = selectedFiles.some((file) =>
    canConvert(file, targetFormat),
  );

  const handleStartConversion = async () => {
    if (isConverting) return;

    setIsConverting(true);
    setIsComplete(false);

    // Initialize status for all convertible files
    setSelectedFiles((prev) =>
      prev.map((f) =>
        canConvert(f, targetFormat) ? { ...f, status: "idle" } : f,
      ),
    );

    try {
      const convertibleFiles = selectedFiles.filter((f) =>
        canConvert(f, targetFormat),
      );

      for (let i = 0; i < convertibleFiles.length; i++) {
        const file = convertibleFiles[i];

        // Update status to converting
        setSelectedFiles((prev) =>
          prev.map((f) =>
            f.path === file.path ? { ...f, status: "converting" } : f,
          ),
        );

        try {
          // We use the same 'convert_images' but with a single path to reuse the backend
          // and get per-file feedback easily on the frontend.
          const results = (await invoke("convert_images", {
            paths: [file.path],
            targetFormat,
            settings: {
              output_path: settings.outputPath,
              file_prefix: settings.filePrefix,
              conflict_resolution: settings.conflictResolution,
              quality: localQuality,
            },
          })) as ConversionResult[];

          const result = results[0];

          // Update status based on result
          setSelectedFiles((prev) =>
            prev.map((f) =>
              f.path === file.path
                ? {
                    ...f,
                    status: result.success ? "success" : "error",
                    error: result.error,
                  }
                : f,
            ),
          );
        } catch (error) {
          console.error(`Failed to convert ${file.name}:`, error);
          setSelectedFiles((prev) =>
            prev.map((f) =>
              f.path === file.path
                ? { ...f, status: "error", error: String(error) }
                : f,
            ),
          );
        }
      }

      setIsComplete(true);
    } catch (error) {
      console.error("Conversion batch failed:", error);
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

        <DropZone
          onFilesSelected={handleFilesSelected}
          disabled={isConverting}
        />

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

            {!isComplete && targetFormat === "jpg" && (
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-primary/10 hover:bg-primary/5 hover:border-primary/20 transition-all group"
                  >
                    <div className="bg-primary/10 p-1.5 rounded-lg group-hover:bg-primary/20 transition-colors">
                      <Settings2 className="h-3.5 w-3.5 text-primary" />
                    </div>
                    <div className="flex flex-col items-start leading-tight">
                      <span className="text-[9px] uppercase tracking-wider font-bold text-muted-foreground">
                        Quality
                      </span>
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-bold">
                          {localQuality}
                        </span>
                        <ChevronDown className="h-3 w-3 text-muted-foreground" />
                      </div>
                    </div>
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-4 shadow-xl border-primary/20 backdrop-blur-lg bg-background/95">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold">
                        Conversion Quality
                      </span>
                      <span className="text-sm font-mono bg-muted px-2 py-0.5 rounded leading-none">
                        {localQuality}
                      </span>
                    </div>
                    <Slider
                      min={1}
                      max={100}
                      step={1}
                      value={[localQuality]}
                      onValueChange={(value) => setLocalQuality(value[0])}
                      className="w-full"
                    />
                    <p className="text-[10px] text-muted-foreground leading-tight">
                      Adjusting here applies only to this conversion batch.
                      Default is {settings.defaultQuality}.
                    </p>
                  </div>
                </PopoverContent>
              </Popover>
            )}

            <Button
              size="lg"
              className={cn(
                "rounded-full px-8 gap-2 font-bold shadow-lg transition-all hover:scale-105 active:scale-95 h-12",
                isComplete
                  ? "bg-sushi-500 hover:bg-sushi-600 shadow-sushi-500/25 hover:shadow-sushi-500/40"
                  : "shadow-primary/25 hover:shadow-primary/40",
              )}
              onClick={isComplete ? handleReset : handleStartConversion}
              disabled={isConverting || (!isComplete && !hasConvertibleFiles)}
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
