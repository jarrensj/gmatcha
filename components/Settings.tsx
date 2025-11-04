import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SuperModeBadge } from "@/components/SuperModeBadge";
import { ArrowLeft, GripVertical } from "lucide-react";
import { useState } from "react";

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
  sectionOrder: number[];
  onSectionOrderChange: (order: number[]) => void;
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
  sectionOrder,
  onSectionOrderChange,
  onBackToForm 
}: SettingsProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [isReorderMode, setIsReorderMode] = useState(false);
  
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === index) return;
    
    const newOrder = [...sectionOrder];
    const draggedItem = newOrder[draggedIndex];
    newOrder.splice(draggedIndex, 1);
    newOrder.splice(index, 0, draggedItem);
    
    onSectionOrderChange(newOrder);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };
  
  const resetHeaders = () => {
    onHeader1Change(process.env.NEXT_PUBLIC_SECTION1_HEADER || 'Yesterday');
    onHeader2Change(process.env.NEXT_PUBLIC_SECTION2_HEADER || 'Today');
    onHeader3Change(process.env.NEXT_PUBLIC_SECTION3_HEADER || 'Blockers');
    onDefaultHeaderFormatChange('none');
    onSuperModeChange(true);
    onSectionOrderChange([1, 2, 3]);
    // Also restore all hidden sections
    onShowSection1Change(true);
    onShowSection2Change(true);
    onShowSection3Change(true);
  };

  // Check if current values differ from defaults
  const hasChanges = 
    header1 !== (process.env.NEXT_PUBLIC_SECTION1_HEADER || 'Yesterday') ||
    header2 !== (process.env.NEXT_PUBLIC_SECTION2_HEADER || 'Today') ||
    header3 !== (process.env.NEXT_PUBLIC_SECTION3_HEADER || 'Blockers') ||
    defaultHeaderFormat !== 'none' ||
    !superMode ||
    JSON.stringify(sectionOrder) !== JSON.stringify([1, 2, 3]) ||
    !showSection1 || !showSection2 || !showSection3;

  // Check for duplicate headers among visible sections
  const getDuplicateHeaders = () => {
    const visibleHeaders: { header: string; num: number }[] = [];
    if (showSection1) visibleHeaders.push({ header: header1.trim().toLowerCase(), num: 1 });
    if (showSection2) visibleHeaders.push({ header: header2.trim().toLowerCase(), num: 2 });
    if (showSection3) visibleHeaders.push({ header: header3.trim().toLowerCase(), num: 3 });
    
    const headerCounts = new Map<string, number[]>();
    visibleHeaders.forEach(({ header, num }) => {
      if (header) { // Only count non-empty headers
        if (!headerCounts.has(header)) {
          headerCounts.set(header, []);
        }
        headerCounts.get(header)?.push(num);
      }
    });
    
    // Find headers that appear more than once
    const duplicates: { header: string; sections: number[] }[] = [];
    headerCounts.forEach((sections, header) => {
      if (sections.length > 1) {
        duplicates.push({ header, sections });
      }
    });
    
    return duplicates;
  };

  const duplicateHeaders = getDuplicateHeaders();

  return (
    <div className="space-y-6">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        <div className="text-center space-y-3 md:space-y-2">
          <div className="relative flex items-center justify-between sm:justify-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold">Settings</h1>
            <Button
              variant="outline"
              size="sm"
              onClick={onBackToForm}
              className="min-h-[44px] min-w-[44px] px-3 sm:absolute sm:right-0"
            >
              <ArrowLeft className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Back</span>
            </Button>
          </div>
          <p className="text-muted-foreground text-sm sm:text-base">
            Configure your default formatting preferences
          </p>
          <p className="text-xs text-muted-foreground">
            All changes are saved automatically
          </p>
        </div>
      </div>
      
      <div className="mx-auto max-w-2xl px-4 sm:px-6 space-y-6">

      <Card>
        <CardHeader>
          <CardTitle>Section Header Titles</CardTitle>
          <CardDescription>
            These titles will be used as the default headers for each section in your standup form.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b">
            <Label className="text-xs text-muted-foreground font-normal">
              Reorder Sections
            </Label>
            <Switch
              checked={isReorderMode}
              onCheckedChange={setIsReorderMode}
              className="scale-90 data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-gray-300"
            />
          </div>
          {sectionOrder.map((sectionNum, index) => {
            const sectionData = {
              1: {
                header: header1,
                onChange: onHeader1Change,
                show: showSection1,
                id: 'header1',
                placeholder: 'Enter first section header'
              },
              2: {
                header: header2,
                onChange: onHeader2Change,
                show: showSection2,
                id: 'header2',
                placeholder: 'Enter second section header'
              },
              3: {
                header: header3,
                onChange: onHeader3Change,
                show: showSection3,
                id: 'header3',
                placeholder: 'Enter third section header'
              }
            }[sectionNum];

            if (!sectionData) return null;

            // Check if this section's header is a duplicate
            const duplicateEntry = duplicateHeaders.find(dup => dup.sections.includes(sectionNum));
            const isDuplicate = !!duplicateEntry;
            
            // Get other section numbers that share this header
            const otherSections = duplicateEntry?.sections.filter(s => s !== sectionNum) || [];

            return (
              <div
                key={sectionNum}
                draggable={isReorderMode}
                onDragStart={() => isReorderMode && handleDragStart(index)}
                onDragOver={(e) => isReorderMode && handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className={`space-y-2 ${!sectionData.show ? 'opacity-50' : ''} ${
                  draggedIndex === index ? 'opacity-50' : ''
                } ${isReorderMode ? 'cursor-move' : ''} transition-opacity`}
              >
                <div className="flex items-center gap-2">
                  {isReorderMode && (
                    <GripVertical className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  )}
                  <Label htmlFor={sectionData.id} className="flex-grow text-sm sm:text-base">
                    Header {sectionNum} {!sectionData.show && <span className="text-xs text-muted-foreground">(Section Hidden)</span>}
                    {isDuplicate && <span className="text-xs text-yellow-600 ml-2">(Duplicate)</span>}
                  </Label>
                </div>
                <div className={`space-y-1 ${isReorderMode ? "pl-6" : "ml-0 sm:ml-6"}`}>
                  <Input
                    id={sectionData.id}
                    value={sectionData.header}
                    onChange={(e) => sectionData.onChange(e.target.value)}
                    disabled={!sectionData.show}
                    placeholder={sectionData.placeholder}
                    className={`min-h-[44px] sm:min-h-0 ${isDuplicate ? 'border-yellow-400 focus:border-yellow-500 focus:ring-yellow-500' : ''}`}
                  />
                  {isDuplicate && (
                    <div className="text-xs text-yellow-700 bg-yellow-50 px-2 py-1.5 rounded">
                      Duplicate of section {otherSections.join(' and ')}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
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
          {sectionOrder.map((sectionNum) => {
            const sectionData = {
              1: {
                header: header1,
                show: showSection1,
                onChange: onShowSection1Change
              },
              2: {
                header: header2,
                show: showSection2,
                onChange: onShowSection2Change
              },
              3: {
                header: header3,
                show: showSection3,
                onChange: onShowSection3Change
              }
            }[sectionNum];

            if (!sectionData) return null;

            const visibleCount = [showSection1, showSection2, showSection3].filter(Boolean).length;
            const isOnlyVisible = sectionData.show && visibleCount === 1;

            return (
              <div key={sectionNum} className="flex items-center justify-between gap-4">
                <div className="space-y-0.5 flex-1">
                  <Label className="text-sm sm:text-base">{sectionData.header}</Label>
                  <div className="text-xs sm:text-sm text-muted-foreground">
                    Show or hide this section in the form
                  </div>
                </div>
                <Switch
                  checked={sectionData.show}
                  onCheckedChange={() => {
                    // Prevent hiding if it's the only visible section
                    if (isOnlyVisible) return;
                    sectionData.onChange(!sectionData.show);
                  }}
                  disabled={isOnlyVisible}
                  className="scale-125 sm:scale-125 data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-gray-300 flex-shrink-0"
                />
              </div>
            );
          })}
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
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-0.5 flex-1">
              <Label className="text-sm sm:text-base">Enable Super Mode</Label>
              <div className="text-xs sm:text-sm text-muted-foreground">
                Switch to bullet-point input for each section
              </div>
            </div>
            <Switch
              checked={superMode}
              onCheckedChange={onSuperModeChange}
              className="scale-125 sm:scale-125 data-[state=checked]:bg-green-600 data-[state=unchecked]:bg-gray-300 flex-shrink-0"
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
            <Label htmlFor="format-select" className="text-sm sm:text-base">Choose the default formatting for all section headers:</Label>
            <Select value={defaultHeaderFormat} onValueChange={onDefaultHeaderFormatChange}>
              <SelectTrigger id="format-select" className="min-h-[44px] sm:min-h-0">
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

      <Card className="border-blue-200 bg-blue-50/50">
        <CardHeader>
          <CardTitle className="text-base">💾 Local Storage</CardTitle>
          <CardDescription className="text-sm">
            All your updates and settings are stored locally. We are not storing your updates in a database at default. 
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-xs sm:text-sm text-muted-foreground">
            To see the code, visit the{' '}
            <a 
              href="https://github.om/jarrensj/gmatcha" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline font-medium"
            >
              GitHub repository.
            </a>
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
    </div>
  );
}
