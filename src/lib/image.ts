export const isSameFormat = (filename: string, targetFormat: string) => {
  const extension = filename.split(".").pop()?.toLowerCase();
  if (!extension) return false;

  const normalizedTarget = targetFormat.toLowerCase();

  if (normalizedTarget === "jpg") {
    return extension === "jpg" || extension === "jpeg";
  }

  return extension === normalizedTarget;
};

export const canConvert = (file: File, targetFormat: string) => {
  return !isSameFormat(file.name, targetFormat);
};
