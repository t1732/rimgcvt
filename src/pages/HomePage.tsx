import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Trash2 } from "lucide-react";

import { ConversionActionBar } from "@/components/ConversionActionBar";
import { DropZone, type SelectedFile } from "@/components/DropZone";
import { FileItem } from "@/components/FileItem";
import { Button } from "@/components/ui/button";
import { useSettings } from "@/contexts/SettingsContext";
import { useFileStatusManager } from "@/hooks/use-file-status";
import { canConvert } from "@/lib/image";

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
  const [isLossless, setIsLossless] = useState(false);
  const { updateFileStatus, initializeConvertibleFiles } =
    useFileStatusManager(setSelectedFiles);

  // Sync local quality with settings when default changes
  useEffect(() => {
    setLocalQuality(settings.defaultQuality);
  }, [settings.defaultQuality]);

  useEffect(() => {
    if (targetFormat === "jpg") {
      setIsLossless(false);
    }
  }, [targetFormat]);

  const handleFilesSelected = (files: SelectedFile[]) => {
    setSelectedFiles((prev) => {
      const base = isComplete ? [] : prev;
      const seen = new Set(base.map((file) => file.path));
      const next = [...base];

      for (const file of files) {
        if (!seen.has(file.path)) {
          seen.add(file.path);
          next.push(file);
        }
      }

      return next;
    });
    setIsComplete(false);
  };

  const handleReset = () => {
    setSelectedFiles([]);
    setIsComplete(false);
  };

  const handleRemoveFile = (filePath: string) => {
    setSelectedFiles((prev) => prev.filter((file) => file.path !== filePath));
  };

  const handleClearAll = () => {
    setSelectedFiles([]);
    setIsComplete(false);
  };

  const handleOpenFolder = async () => {
    const { openPath } = await import("@tauri-apps/plugin-opener");
    console.log("Opening folder:", settings.outputPath);
    if (!settings.outputPath) {
      console.warn("Output path is empty");
      return;
    }
    try {
      await openPath(settings.outputPath);
    } catch (error) {
      console.error("Failed to open output folder:", error);
    }
  };

  const hasConvertibleFiles = selectedFiles.some((file) =>
    canConvert(file, targetFormat),
  );

  const handleStartConversion = async () => {
    if (isConverting) return;

    setIsConverting(true);
    setIsComplete(false);

    // Initialize status for all convertible files
    initializeConvertibleFiles(targetFormat, canConvert);

    try {
      const convertibleFiles = selectedFiles.filter((f) =>
        canConvert(f, targetFormat),
      );

      for (let i = 0; i < convertibleFiles.length; i++) {
        const file = convertibleFiles[i];

        // Update status to converting
        updateFileStatus(file.path, "converting");

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
              lossless: isLossless,
            },
          })) as ConversionResult[];

          const result = results[0];

          // Update status based on result
          updateFileStatus(
            file.path,
            result.success ? "success" : "error",
            result.error,
          );
        } catch (error) {
          console.error(`Failed to convert ${file.name}:`, error);
          updateFileStatus(file.path, "error", String(error));
        }
      }

      setIsComplete(true);
    } catch (error) {
      console.error("Conversion batch failed:", error);
    } finally {
      setIsConverting(false);
    }
  };

  const convertibleCount = selectedFiles.filter((f) =>
    canConvert(f, targetFormat),
  ).length;

  const hasFiles = selectedFiles.length > 0;

  return (
    <div className="container mx-auto p-8 flex flex-col items-center min-h-[calc(100vh-4rem)]">
      <div className="w-full max-w-4xl space-y-8">
        {!hasFiles && (
          <div className="text-center space-y-2 animate-in fade-in slide-in-from-top-4 duration-500">
            <h2 className="text-3xl font-bold tracking-tight">
              Convert your images
            </h2>
            <p className="text-muted-foreground">
              Easy, fast and secure image conversion.
            </p>
          </div>
        )}

        <div
          className={`transition-all duration-500 ${hasFiles ? "scale-90 mb-0" : "scale-100"}`}
        >
          <DropZone
            onFilesSelected={handleFilesSelected}
            disabled={isConverting}
            hasFiles={hasFiles}
          />
        </div>

        {selectedFiles.length > 0 && (
          <div className="mt-8 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between border-b pb-4">
              <h3 className="text-lg font-semibold">
                Selected Files ({selectedFiles.length})
              </h3>
              {!isConverting && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearAll}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear All
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 gap-2">
              {selectedFiles.map((file, i) => (
                <FileItem
                  key={`${file.path}-${i}`}
                  file={file}
                  targetFormat={targetFormat}
                  onRemove={
                    !isConverting
                      ? () => handleRemoveFile(file.path)
                      : undefined
                  }
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {selectedFiles.length > 0 && (
        <>
          {/* Spacer to prevent content from being hidden behind the floating bar */}
          {(hasConvertibleFiles || isComplete) && (
            <div className="h-32 w-full shrink-0" />
          )}

          {/* Floating Bottom Action Bar Component */}
          <ConversionActionBar
            conversionState={{
              isConverting,
              isComplete,
              convertibleCount,
            }}
            qualitySettings={{
              localQuality,
              defaultQuality: settings.defaultQuality,
              setLocalQuality,
              isLossless,
              setIsLossless,
            }}
            formatSettings={{
              targetFormat,
              onTargetFormatChange: setTargetFormat,
            }}
            actions={{
              onStartConversion: handleStartConversion,
              onReset: handleReset,
              onOpenFolder: handleOpenFolder,
            }}
          />
        </>
      )}
    </div>
  );
};
