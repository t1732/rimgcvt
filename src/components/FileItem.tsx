import { useEffect, useRef } from "react";
import { convertFileSrc } from "@tauri-apps/api/core";
import { CheckCircle2, Loader2, Trash2, XCircle } from "lucide-react";

import { normalizeFilePathForAsset } from "@/lib/file-utils";
import { isSameFormat as checkIsSameFormat } from "@/lib/image";
import { cn } from "@/lib/utils";

import type { FileStatus, SelectedFile } from "./DropZone";

/**
 * Calculate container styles based on file state
 */
const getFileItemStyles = (
  isSameFormat: boolean,
  status?: FileStatus,
): string => {
  if (isSameFormat) {
    return "bg-destructive/10 border-destructive/30 opacity-80";
  }
  if (status === "converting") {
    return "bg-sushi-50 border-sushi-200 ring-1 ring-sushi-500/20";
  }
  if (status === "success") {
    return "bg-sushi-50/30 border-sushi-200/50";
  }
  return "bg-muted/30 border-border opacity-100";
};

interface FileItemProps {
  file: SelectedFile;
  targetFormat: string;
  onRemove?: () => void;
}

export const FileItem = ({ file, targetFormat, onRemove }: FileItemProps) => {
  const itemRef = useRef<HTMLDivElement>(null);
  const thumbnail = convertFileSrc(normalizeFilePathForAsset(file.path));
  const isSameFormat = checkIsSameFormat(file.name, targetFormat);

  useEffect(() => {
    if (file.status === "converting") {
      itemRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [file.status]);

  return (
    <div
      ref={itemRef}
      className={cn(
        "flex items-center justify-between p-3 rounded-lg border transition-all duration-200",
        getFileItemStyles(isSameFormat, file.status),
      )}
    >
      <div className="flex items-center gap-3">
        <div className="relative h-12 w-12 rounded-lg border overflow-hidden bg-background shrink-0 shadow-sm">
          <img
            src={thumbnail}
            alt={file.name}
            className={cn(
              "h-full w-full object-cover transition-opacity duration-300",
              file.status === "converting" && "opacity-40",
            )}
          />
          {file.status === "converting" && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/5">
              <Loader2 className="h-5 w-5 animate-spin text-sushi-600" />
            </div>
          )}
          {file.status === "success" && (
            <div className="absolute inset-0 flex items-center justify-center bg-sushi-500/10 backdrop-blur-[1px]">
              <CheckCircle2 className="h-7 w-7 text-sushi-600 fill-white" />
            </div>
          )}
          {file.status === "error" && (
            <div className="absolute inset-0 flex items-center justify-center bg-destructive/10 backdrop-blur-[1px]">
              <XCircle className="h-7 w-7 text-destructive fill-white" />
            </div>
          )}
        </div>
        <div className="flex flex-col min-w-0">
          <span
            className={cn(
              "text-sm font-semibold truncate max-w-[200px] sm:max-w-md",
              isSameFormat && "line-through text-muted-foreground font-normal",
              file.status === "success" && "text-sushi-700",
            )}
          >
            {file.name}
          </span>
          <div className="flex items-center gap-2">
            {isSameFormat ? (
              <span className="text-[10px] text-destructive font-bold uppercase tracking-tight">
                Same format as target
              </span>
            ) : (
              <span className="text-[10px] text-muted-foreground font-medium flex items-center gap-1.5">
                {file.size > 0 && `${(file.size / 1024).toFixed(1)} KB`}
                {file.status === "success" && (
                  <>
                    <span className="h-1 w-1 rounded-full bg-muted-foreground/30" />
                    <span className="text-sushi-600 font-bold uppercase">
                      Converted
                    </span>
                  </>
                )}
                {file.status === "error" && (
                  <>
                    <span className="h-1 w-1 rounded-full bg-muted-foreground/30" />
                    <span className="text-destructive font-bold uppercase">
                      Failed
                    </span>
                  </>
                )}
              </span>
            )}
          </div>
          {file.error && (
            <span className="text-[10px] text-destructive mt-1 line-clamp-1 font-medium">
              {file.error}
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3 ml-4">
        {file.status === "converting" && (
          <span className="text-[10px] font-bold text-sushi-600 animate-pulse uppercase tracking-wider">
            Processing...
          </span>
        )}
        {onRemove && !file.status && (
          <button
            type="button"
            onClick={onRemove}
            className="p-1.5 rounded-md hover:bg-destructive/10 transition-colors group"
            aria-label="Remove file"
          >
            <Trash2 className="h-4 w-4 text-muted-foreground group-hover:text-destructive transition-colors" />
          </button>
        )}
      </div>
    </div>
  );
};
