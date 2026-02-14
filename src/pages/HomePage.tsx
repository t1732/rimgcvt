import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";

import { ConversionActionBar } from "@/components/ConversionActionBar";
import { DropZone, type SelectedFile } from "@/components/DropZone";
import { FileItem } from "@/components/FileItem";
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
  const { updateFileStatus, initializeConvertibleFiles } =
    useFileStatusManager(setSelectedFiles);

  // Sync local quality with settings when default changes
  useEffect(() => {
    setLocalQuality(settings.defaultQuality);
  }, [settings.defaultQuality]);

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
    </div>
  );
};
