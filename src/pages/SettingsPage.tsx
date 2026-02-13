import { FolderOpen, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useSettings } from "@/contexts/SettingsContext";

export const SettingsPage = () => {
  const { settings, updateSettings } = useSettings();

  const handleSelectFolder = async () => {
    try {
      const { open } = await import("@tauri-apps/plugin-dialog");
      const selected = await open({
        directory: true,
        multiple: false,
        defaultPath: settings.outputPath,
      });
      if (selected) {
        updateSettings({ outputPath: selected });
      }
    } catch (error) {
      console.error("Failed to open folder dialog:", error);
    }
  };

  const handleResetPath = () => {
    updateSettings({ outputPath: "" });
  };

  return (
    <div className="container mx-auto p-8 max-w-3xl">
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
          <p className="text-muted-foreground">
            Manage your application preferences
          </p>
        </div>

        <div className="space-y-6">
          {/* Theme Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Theme</CardTitle>
              <CardDescription>
                Select your preferred color theme
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={settings.theme}
                onValueChange={(value) =>
                  updateSettings({ theme: value as typeof settings.theme })
                }
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="light" id="light" />
                  <Label htmlFor="light">Light</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="dark" id="dark" />
                  <Label htmlFor="dark">Dark</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="system" id="system" />
                  <Label htmlFor="system">System</Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Output Path */}
          <Card>
            <CardHeader>
              <CardTitle>Output Path</CardTitle>
              <CardDescription>
                Choose where converted files will be saved
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Input
                  value={settings.outputPath}
                  onChange={(e) =>
                    updateSettings({ outputPath: e.target.value })
                  }
                  placeholder="Select output folder..."
                  className="flex-1"
                />
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={handleSelectFolder}
                      >
                        <FolderOpen className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Select folder</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={handleResetPath}
                      >
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Reset to default</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </CardContent>
          </Card>

          {/* File Prefix */}
          <Card>
            <CardHeader>
              <CardTitle>File Prefix</CardTitle>
              <CardDescription>
                Add a prefix to converted file names (leave empty for no prefix)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Input
                value={settings.filePrefix}
                onChange={(e) => updateSettings({ filePrefix: e.target.value })}
                placeholder="e.g., converted_"
              />
            </CardContent>
          </Card>

          {/* Conflict Resolution */}
          <Card>
            <CardHeader>
              <CardTitle>File Conflict Resolution</CardTitle>
              <CardDescription>
                What to do when a file with the same name already exists
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={settings.conflictResolution}
                onValueChange={(value) =>
                  updateSettings({
                    conflictResolution:
                      value as typeof settings.conflictResolution,
                  })
                }
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="overwrite" id="overwrite" />
                  <Label htmlFor="overwrite">Overwrite existing files</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="numbering" id="numbering" />
                  <Label htmlFor="numbering">
                    Add numbering suffix (e.g., file_1.png, file_2.png)
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Conversion Quality */}
          <Card>
            <CardHeader>
              <CardTitle>Default Conversion Quality</CardTitle>
              <CardDescription>
                Set the default quality for lossy formats (1-100)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    Quality: {settings.defaultQuality}
                  </span>
                </div>
                <Slider
                  min={1}
                  max={100}
                  step={1}
                  value={[settings.defaultQuality]}
                  onValueChange={(value) => {
                    updateSettings({ defaultQuality: value[0] });
                  }}
                  className="w-full"
                />
                <span className="text-sm text-muted-foreground block">
                  Applied to lossy formats (JPEG, WebP)
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
