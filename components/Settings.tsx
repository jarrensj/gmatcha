import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SuperModeBadge } from "@/components/SuperModeBadge";
import { ArrowLeft, RotateCcw } from "lucide-react";

interface SettingsProps {
  defaultHeaderFormat: string;
  onDefaultHeaderFormatChange: (format: string) => void;
  header1: string;
  onHeader1Change: (header: string) => void;
  header2: string;
  onHeader2Change: (header: string) => void;
  header3: string;
  onHeader3Change: (header: string) => void;
  showSection1: boolean;
  onShowSection1Change: (show: boolean) => void;
  showSection2: boolean;
  onShowSection2Change: (show: boolean) => void;
  showSection3: boolean;
  onShowSection3Change: (show: boolean) => void;
  superMode: boolean;
  onSuperModeChange: (enabled: boolean) => void;
  onBackToForm: () => void;
}

export default function Settings({ 
  defaultHeaderFormat, 
  onDefaultHeaderFormatChange, 
  header1,
  onHeader1Change,
  header2,
  onHeader2Change,
  header3,
  onHeader3Change,
  showSection1,
  onShowSection1Change,
  showSection2,
  onShowSection2Change,
  showSection3,
  onShowSection3Change,
  superMode,
  onSuperModeChange,
  onBackToForm 
}: SettingsProps) {
  
  const resetHeaders = () => {
    onHeader1Change(process.env.NEXT_PUBLIC_SECTION1_HEADER || 'Yesterday:');
    onHeader2Change(process.env.NEXT_PUBLIC_SECTION2_HEADER || 'Today:');
    onHeader3Change(process.env.NEXT_PUBLIC_SECTION3_HEADER || 'Blockers:');
    onDefaultHeaderFormatChange('none');
    onSuperModeChange(false);
    // Also restore all hidden sections
    onShowSection1Change(true);
    onShowSection2Change(true);
    onShowSection3Change(true);
  };

  // Check if current values differ from defaults
  const hasChanges = 
    header1 !== (process.env.NEXT_PUBLIC_SECTION1_HEADER || 'Yesterday:') ||
    header2 !== (process.env.NEXT_PUBLIC_SECTION2_HEADER || 'Today:') ||
    header3 !== (process.env.NEXT_PUBLIC_SECTION3_HEADER || 'Blockers:') ||
    defaultHeaderFormat !== 'none' ||
    superMode ||
    !showSection1 || !showSection2 || !showSection3;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="text-center space-y-2">
        <div className="relative">
          <h1 className="text-3xl font-bold">Settings</h1>
          <Button
            variant="outline"
            size="sm"
            onClick={onBackToForm}
            className="absolute top-0 right-0"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Form
          </Button>
        </div>
        <p className="text-muted-foreground">
          Configure your default formatting preferences
        </p>
        <p className="text-xs text-muted-foreground">
          All changes are saved automatically
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Section Header Titles</CardTitle>
          <CardDescription>
            These titles will be used as the default headers for each section in your standup form.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className={`space-y-2 ${!showSection1 ? 'opacity-50' : ''}`}>
            <Label htmlFor="header1">
              Header 1 {!showSection1 && <span className="text-xs text-muted-foreground">(Section Hidden)</span>}
            </Label>
            <Input
              id="header1"
              value={header1}
              onChange={(e) => onHeader1Change(e.target.value)}
              disabled={!showSection1}
              placeholder="Enter first section header"
            />
          </div>
          
          <div className={`space-y-2 ${!showSection2 ? 'opacity-50' : ''}`}>
            <Label htmlFor="header2">
              Header 2 {!showSection2 && <span className="text-xs text-muted-foreground">(Section Hidden)</span>}
            </Label>
            <Input
              id="header2"
              value={header2}
              onChange={(e) => onHeader2Change(e.target.value)}
              disabled={!showSection2}
              placeholder="Enter second section header"
            />
          </div>
          
          <div className={`space-y-2 ${!showSection3 ? 'opacity-50' : ''}`}>
            <Label htmlFor="header3">
              Header 3 {!showSection3 && <span className="text-xs text-muted-foreground">(Section Hidden)</span>}
            </Label>
            <Input
              id="header3"
              value={header3}
              onChange={(e) => onHeader3Change(e.target.value)}
              disabled={!showSection3}
              placeholder="Enter third section header"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Section Visibility</CardTitle>
          <CardDescription>
            Toggle sections on or off. Hidden sections won&apos;t appear in your standup form or final output. At least one section must remain visible.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">{header1}</Label>
              <div className="text-sm text-muted-foreground">
                Show or hide this section in the form
              </div>
            </div>
            <Switch
              checked={showSection1}
              onCheckedChange={() => {
                // Prevent hiding if it's the only visible section
                if (showSection1 && !showSection2 && !showSection3) return;
                onShowSection1Change(!showSection1);
              }}
              disabled={showSection1 && !showSection2 && !showSection3}
              className="scale-125 data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-gray-300"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">{header2}</Label>
              <div className="text-sm text-muted-foreground">
                Show or hide this section in the form
              </div>
            </div>
            <Switch
              checked={showSection2}
              onCheckedChange={() => {
                // Prevent hiding if it's the only visible section
                if (showSection2 && !showSection1 && !showSection3) return;
                onShowSection2Change(!showSection2);
              }}
              disabled={showSection2 && !showSection1 && !showSection3}
              className="scale-125 data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-gray-300"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">{header3}</Label>
              <div className="text-sm text-muted-foreground">
                Show or hide this section in the form
              </div>
            </div>
            <Switch
              checked={showSection3}
              onCheckedChange={() => {
                // Prevent hiding if it's the only visible section
                if (showSection3 && !showSection1 && !showSection2) return;
                onShowSection3Change(!showSection3);
              }}
              disabled={showSection3 && !showSection1 && !showSection2}
              className="scale-125 data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-gray-300"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Super Mode
            <SuperModeBadge />
          </CardTitle>
          <CardDescription>
            Enable streamlined bullet-point input for faster standup creation. In Super Mode, you can quickly add bullet points by typing and pressing Enter.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Enable Super Mode</Label>
              <div className="text-sm text-muted-foreground">
                Switch to bullet-point input for each section
              </div>
            </div>
            <Switch
              checked={superMode}
              onCheckedChange={onSuperModeChange}
              className="scale-125 data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-gray-300"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Default Header Format</CardTitle>
          <CardDescription>
            This setting applies to all sections immediately and will be used for new updates.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="format-select">Choose the default formatting for all section headers:</Label>
            <Select value={defaultHeaderFormat} onValueChange={onDefaultHeaderFormatChange}>
              <SelectTrigger id="format-select">
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Plain text</SelectItem>
                <SelectItem value="bold">**Bold**</SelectItem>
                <SelectItem value="##">## Header 2</SelectItem>
                <SelectItem value="###">### Header 3</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {hasChanges && (
        <div className="flex justify-center pt-8">
          <button
            onClick={resetHeaders}
            className="text-xs text-muted-foreground hover:text-foreground underline hover:no-underline transition-colors duration-200"
          >
            Reset all settings to defaults
          </button>
        </div>
      )}
    </div>
  );
}
