import { useCallback, useRef } from "react";

/**
 * Custom hook to prevent duplicate drop events
 * Tauri/Wry can emit duplicate drop events on some platforms
 *
 * @param debounceMs - Time window in milliseconds to consider events as duplicates (default: 500ms)
 */
export const useDuplicateDropPrevention = (debounceMs = 500) => {
  const lastDropRef = useRef<{ key: string; at: number } | null>(null);

  const isDuplicate = useCallback(
    (paths: string[]): boolean => {
      if (paths.length === 0) return false;

      const key = paths.join("|");
      const now = Date.now();
      const lastDrop = lastDropRef.current;

      if (lastDrop && lastDrop.key === key && now - lastDrop.at < debounceMs) {
        return true;
      }

      lastDropRef.current = { key, at: now };
      return false;
    },
    [debounceMs],
  );

  return { isDuplicate };
};
