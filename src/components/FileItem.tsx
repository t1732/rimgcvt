import { useEffect, useState } from "react";

interface FileItemProps {
  file: File;
}

export const FileItem = ({ file }: FileItemProps) => {
  const [thumbnail, setThumbnail] = useState<string>("");

  useEffect(() => {
    const objectUrl = URL.createObjectURL(file);
    setThumbnail(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  return (
    <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
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
        <span className="text-sm truncate max-w-[200px] sm:max-w-md">
          {file.name}
        </span>
      </div>
      <span className="text-xs text-muted-foreground whitespace-nowrap">
        {(file.size / 1024).toFixed(1)} KB
      </span>
    </div>
  );
};
