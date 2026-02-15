import {
  Check,
  ChevronDown,
  FolderOpen,
  Loader2,
  Play,
  Settings2,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface ConversionState {
  isConverting: boolean;
  isComplete: boolean;
  convertibleCount: number;
  completedConvertibleCount: number;
  progressPercent: number;
}

interface QualitySettings {
  localQuality: number;
  defaultQuality: number;
  setLocalQuality: (value: number) => void;
  isLossless: boolean;
  setIsLossless: (value: boolean) => void;
}

interface ConversionActions {
  onStartConversion: () => void;
  onReset: () => void;
  onOpenFolder: () => void;
}

interface ConversionActionBarProps {
  conversionState: ConversionState;
  qualitySettings: QualitySettings;
  actions: ConversionActions;
  formatSettings: FormatSettings;
}

interface FormatSettings {
  targetFormat: string;
  onTargetFormatChange: (value: string) => void;
}

export const ConversionActionBar = ({
  conversionState,
  qualitySettings,
  actions,
  formatSettings,
}: ConversionActionBarProps) => {
  const {
    isConverting,
    isComplete,
    convertibleCount,
    completedConvertibleCount,
    progressPercent,
  } = conversionState;
  const {
    localQuality,
    defaultQuality,
    setLocalQuality,
    isLossless,
    setIsLossless,
  } = qualitySettings;
  const { onStartConversion, onReset, onOpenFolder } = actions;
  const { targetFormat, onTargetFormatChange } = formatSettings;
  const hasConvertibleFiles = convertibleCount > 0;
  const qualityLabel = isLossless ? "Lossless" : localQuality;
  const isLosslessDisabled = targetFormat === "jpg";
  const losslessToggle = (
    <button
      type="button"
      role="switch"
      aria-checked={isLossless}
      aria-disabled={isLosslessDisabled}
      onClick={() => !isLosslessDisabled && setIsLossless(!isLossless)}
      className={cn(
        "h-5 w-9 rounded-full border border-primary/20 transition-colors",
        isLossless ? "bg-sushi-500" : "bg-muted",
        isLosslessDisabled && "opacity-50 cursor-not-allowed",
      )}
      disabled={isLosslessDisabled}
    >
      <span
        className={cn(
          "block h-4 w-4 rounded-full bg-background transition-transform",
          isLossless ? "translate-x-4" : "translate-x-0.5",
        )}
      />
    </button>
  );

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-8 duration-500 ease-out">
      <div className="bg-background/80 backdrop-blur-xl border border-primary/20 p-2 pl-6 rounded-full shadow-2xl flex items-center gap-6 ring-1 ring-black/5">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground leading-none mb-1">
            {isComplete ? "Conversion task" : "Ready to convert"}
          </span>
          <span className="text-sm font-semibold leading-none">
            {isComplete ? "Completed" : `${convertibleCount} files`}
          </span>
          {isConverting && hasConvertibleFiles && (
            <div className="mt-2 w-36">
              <div className="h-1.5 w-full rounded-full bg-muted/60 overflow-hidden">
                <div
                  className="h-full bg-sushi-500 transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="mt-1 text-[10px] text-muted-foreground font-semibold">
                {completedConvertibleCount}/{convertibleCount} (
                {progressPercent}%)
              </div>
            </div>
          )}
        </div>

        {!isComplete && (
          <Popover>
            <PopoverTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-primary/10 hover:bg-primary/5 hover:border-primary/20 transition-all group"
              >
                <div className="bg-primary/10 p-1.5 rounded-lg group-hover:bg-primary/20 transition-colors">
                  <span className="text-[9px] font-bold text-primary uppercase tracking-wider">
                    To
                  </span>
                </div>
                <div className="flex flex-col items-start leading-tight">
                  <span className="text-[9px] uppercase tracking-wider font-bold text-muted-foreground">
                    Convert
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-bold">
                      {targetFormat.toUpperCase()}
                    </span>
                    <ChevronDown className="h-3 w-3 text-muted-foreground" />
                  </div>
                </div>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-3 shadow-xl border-primary/20 backdrop-blur-lg bg-background/95">
              <div className="space-y-3">
                <span className="text-sm font-bold">Output format</span>
                <RadioGroup
                  value={targetFormat}
                  onValueChange={onTargetFormatChange}
                  className="gap-2"
                >
                  <label
                    htmlFor="format-webp"
                    className="flex items-center gap-2 rounded-md border border-transparent px-2 py-1.5 hover:border-primary/20 hover:bg-primary/5 transition-colors"
                  >
                    <RadioGroupItem id="format-webp" value="webp" />
                    <span className="text-sm font-medium">WEBP</span>
                  </label>
                  <label
                    htmlFor="format-png"
                    className="flex items-center gap-2 rounded-md border border-transparent px-2 py-1.5 hover:border-primary/20 hover:bg-primary/5 transition-colors"
                  >
                    <RadioGroupItem id="format-png" value="png" />
                    <span className="text-sm font-medium">PNG</span>
                  </label>
                  <label
                    htmlFor="format-jpg"
                    className="flex items-center gap-2 rounded-md border border-transparent px-2 py-1.5 hover:border-primary/20 hover:bg-primary/5 transition-colors"
                  >
                    <RadioGroupItem id="format-jpg" value="jpg" />
                    <span className="text-sm font-medium">JPG</span>
                  </label>
                  <label
                    htmlFor="format-avif"
                    className="flex items-center gap-2 rounded-md border border-transparent px-2 py-1.5 hover:border-primary/20 hover:bg-primary/5 transition-colors"
                  >
                    <RadioGroupItem id="format-avif" value="avif" />
                    <span className="text-sm font-medium">AVIF</span>
                  </label>
                </RadioGroup>
              </div>
            </PopoverContent>
          </Popover>
        )}

        {!isComplete && (
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
                    <span className="text-sm font-bold">{qualityLabel}</span>
                    <ChevronDown className="h-3 w-3 text-muted-foreground" />
                  </div>
                </div>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-4 shadow-xl border-primary/20 backdrop-blur-lg bg-background/95">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold">Lossless</span>
                    {isLosslessDisabled ? (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            {losslessToggle}
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Lossless is not available for JPEG.</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ) : (
                      losslessToggle
                    )}
                  </div>
                  <span className="text-sm font-mono bg-muted px-2 py-0.5 rounded leading-none">
                    {qualityLabel}
                  </span>
                </div>
                <Slider
                  min={1}
                  max={100}
                  step={1}
                  value={[localQuality]}
                  onValueChange={(value) => setLocalQuality(value[0])}
                  className={cn("w-full", isLossless && "opacity-50")}
                  disabled={isLossless}
                />
                <p className="text-[10px] text-muted-foreground leading-tight">
                  {isLossless
                    ? "Lossless conversion ignores the quality slider for this batch."
                    : `Adjusting here applies only to this conversion batch. Default is ${defaultQuality}.`}
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
          onClick={isComplete ? onReset : onStartConversion}
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

        {isComplete && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full h-12 w-12 border-primary/20 hover:bg-primary/5 shadow-lg shrink-0"
                  onClick={onOpenFolder}
                >
                  <FolderOpen className="h-5 w-5 text-primary" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Open output folder</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    </div>
  );
};
