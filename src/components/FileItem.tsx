import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

interface FileItemProps {
  file: File;
  targetFormat: string;
}

export const FileItem = ({ file, targetFormat }: FileItemProps) => {
  const [thumbnail, setThumbnail] = useState<string>("");

  useEffect(() => {
    const objectUrl = URL.createObjectURL(file);
    setThumbnail(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  const extension = file.name.split(".").pop()?.toLowerCase();
  const isSameFormat =
    (targetFormat === "jpg" && (extension === "jpg" || extension === "jpeg")) ||
    targetFormat === extension;

  return (
    <div
      className={cn(
        "flex items-center justify-between p-3 rounded-lg border transition-all duration-200",
        isSameFormat
          ? "bg-destructive/10 border-destructive/30 opacity-80"
          : "bg-muted/30 border-border opacity-100",
      )}
    >
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded border overflow-hidden bg-background shrink-0">
          {thumbnail ? (
            <img
              src={thumbnail}
              alt={file.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full bg-muted" />
          )}
        </div>
        <div className="flex flex-col">
          <span
            className={cn(
              "text-sm font-medium truncate max-w-[200px] sm:max-w-md",
              isSameFormat && "line-through text-muted-foreground",
            )}
          >
            {file.name}
          </span>
          {isSameFormat && (
            <span className="text-[10px] text-destructive font-medium">
              Same format as target
            </span>
          )}
        </div>
      </div>
      <span className="text-xs text-muted-foreground whitespace-nowrap ml-4">
        {(file.size / 1024).toFixed(1)} KB
      </span>
    </div>
  );
};
