import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export type ThemeMode = "light" | "dark" | "system";
export type ConflictResolution = "overwrite" | "numbering";

export interface Settings {
  theme: ThemeMode;
  outputPath: string;
  filePrefix: string;
  conflictResolution: ConflictResolution;
  defaultQuality: number;
}

interface SettingsContextType {
  settings: Settings;
  updateSettings: (updates: Partial<Settings>) => void;
}

const defaultSettings: Settings = {
  theme: "system",
  outputPath: "",
  filePrefix: "",
  conflictResolution: "numbering",
  defaultQuality: 85,
};

const STORAGE_KEY = "rimgcvt-settings";

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined,
);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<Settings>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return { ...defaultSettings, ...JSON.parse(stored) };
      }
    } catch (error) {
      console.error("Failed to load settings:", error);
    }
    return defaultSettings;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error("Failed to save settings:", error);
    }
  }, [settings]);

  const updateSettings = useCallback((updates: Partial<Settings>) => {
    setSettings((prev) => ({ ...prev, ...updates }));
  }, []);

  useEffect(() => {
    const initializeDefaultPath = async () => {
      if (settings.outputPath === "") {
        try {
          const { pictureDir, join } = await import("@tauri-apps/api/path");
          const picDir = await pictureDir();
          const defaultPath = await join(picDir, "imgcvt");
          updateSettings({ outputPath: defaultPath });
        } catch (error) {
          console.error("Failed to get picture directory:", error);
        }
      }
    };

    initializeDefaultPath();
  }, [settings.outputPath, updateSettings]);

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};
