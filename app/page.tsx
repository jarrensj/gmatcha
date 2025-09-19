'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ProgressButton } from "@/components/ui/progress-button";
import { Copy, Settings as SettingsIcon, RotateCcw, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toast";
import Settings from '../components/Settings';
import { StandupImageCard } from '../components/StandupImageCard';
import { BulletInput } from '../components/BulletInput';
import html2canvas from 'html2canvas';

export default function Home() {
  const [section1Text, setSection1Text] = useState('');
  const [section2Text, setSection2Text] = useState('');
  const [section3Text, setSection3Text] = useState('');
  const [markdownOutput, setMarkdownOutput] = useState('');
  const [showOutput, setShowOutput] = useState(false);
  const [currentPage, setCurrentPage] = useState('form'); // 'form' or 'settings'
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const { toast, toasts, dismiss } = useToast();

  // Custom headers for each section - using environment variables with fallbacks
  const [header1, setHeader1] = useState(process.env.NEXT_PUBLIC_SECTION1_HEADER || 'What are you working on today?');
  const [header2, setHeader2] = useState(process.env.NEXT_PUBLIC_SECTION2_HEADER || 'What did you work on yesterday?');
  const [header3, setHeader3] = useState(process.env.NEXT_PUBLIC_SECTION3_HEADER || 'What are your blockers?');
  
  // Header formatting options
  const [header1Format, setHeader1Format] = useState('none');
  const [header2Format, setHeader2Format] = useState('none');
  const [header3Format, setHeader3Format] = useState('none');
  
  // Section visibility
  const [showSection1, setShowSection1] = useState(true);
  const [showSection2, setShowSection2] = useState(true);
  const [showSection3, setShowSection3] = useState(true);
  
  // Default formatting setting (applies to all sections)
  const [defaultHeaderFormat, setDefaultHeaderFormat] = useState('none');
  
  // Super mode toggle
  const [superMode, setSuperMode] = useState(false);
  
  // Bullet point storage for super mode
  const [section1Bullets, setSection1Bullets] = useState<string[]>([]);
  const [section2Bullets, setSection2Bullets] = useState<string[]>([]);
  const [section3Bullets, setSection3Bullets] = useState<string[]>([]);

  // Modal state for mode switch warning
  const [showModeWarning, setShowModeWarning] = useState(false);
  const [pendingModeChange, setPendingModeChange] = useState<boolean | null>(null);

  // Handle super mode toggle with warning
  const handleSuperModeChange = (enabled: boolean) => {
    // Check if user has data that would be lost
    const hasTextData = section1Text.trim() || section2Text.trim() || section3Text.trim();
    const hasBulletData = section1Bullets.length > 0 || section2Bullets.length > 0 || section3Bullets.length > 0;
    
    const hasDataToLose = enabled ? hasTextData : hasBulletData;
    
    if (hasDataToLose) {
      // Show modal and store the pending change
      setPendingModeChange(enabled);
      setShowModeWarning(true);
    } else {
      // No data to lose, switch immediately
      setSuperMode(enabled);
    }
  };

  // Handle modal confirmation
  const handleConfirmModeChange = () => {
    if (pendingModeChange !== null) {
      // Clear all data when switching modes
      setSection1Text('');
      setSection2Text('');
      setSection3Text('');
      setSection1Bullets([]);
      setSection2Bullets([]);
      setSection3Bullets([]);
      
      // Reset to input form (not generated output page)
      setShowOutput(false);
      setMarkdownOutput('');
      
      // Switch the mode
      setSuperMode(pendingModeChange);
    }
    
    // Close modal and reset pending change
    setShowModeWarning(false);
    setPendingModeChange(null);
  };

  // Handle modal cancellation
  const handleCancelModeChange = () => {
    setShowModeWarning(false);
    setPendingModeChange(null);
  };

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedData = localStorage.getItem('standupFormData');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setSection1Text(parsed.section1Text || parsed.workingOn || '');
        setSection2Text(parsed.section2Text || parsed.workedOnYesterday || '');
        setSection3Text(parsed.section3Text || parsed.blockers || '');
        // Use saved headers if they exist, otherwise use environment variables or defaults
        setHeader1(parsed.header1 || process.env.NEXT_PUBLIC_SECTION1_HEADER || 'What are you working on today?');
        setHeader2(parsed.header2 || process.env.NEXT_PUBLIC_SECTION2_HEADER || 'What did you work on yesterday?');
        setHeader3(parsed.header3 || process.env.NEXT_PUBLIC_SECTION3_HEADER || 'What are your blockers?');
        setHeader1Format(parsed.header1Format || 'none');
        setHeader2Format(parsed.header2Format || 'none');
        setHeader3Format(parsed.header3Format || 'none');
        setShowSection1(parsed.showSection1 !== undefined ? parsed.showSection1 : true);
        setShowSection2(parsed.showSection2 !== undefined ? parsed.showSection2 : true);
        setShowSection3(parsed.showSection3 !== undefined ? parsed.showSection3 : true);
        setDefaultHeaderFormat(parsed.defaultHeaderFormat || 'none');
        setSuperMode(parsed.superMode || false);
        setSection1Bullets(parsed.section1Bullets || parsed.workingOnBullets || []);
        setSection2Bullets(parsed.section2Bullets || parsed.workedOnYesterdayBullets || []);
        setSection3Bullets(parsed.section3Bullets || parsed.blockersBullets || []);
      } catch (error) {
        console.error('Error loading saved data:', error);
      }
    }
  }, []);

  // Save to localStorage whenever form data changes
  useEffect(() => {
    const formData = {
      section1Text,
      section2Text,
      section3Text,
      header1,
      header2,
      header3,
      header1Format,
      header2Format,
      header3Format,
      showSection1,
      showSection2,
      showSection3,
      defaultHeaderFormat,
      superMode,
      section1Bullets,
      section2Bullets,
      section3Bullets
    };
    localStorage.setItem('standupFormData', JSON.stringify(formData));
  }, [section1Text, section2Text, section3Text, header1, header2, header3, header1Format, header2Format, header3Format, showSection1, showSection2, showSection3, defaultHeaderFormat, superMode, section1Bullets, section2Bullets, section3Bullets]);

  const generateMarkdown = () => {

    const formatHeader = (format: string, header: string) => {
      switch (format) {
        case 'bold':
          return `**${header}**`;
        case '##':
          return `## ${header}`;
        case '###':
          return `### ${header}`;
        case 'none':
        default:
          return header;
      }
    };

    const formatContent = (content: string, bullets: string[]) => {
      if (superMode && bullets.length > 0) {
        return bullets.map(bullet => `- ${bullet}`).join('\n');
      }
      return content.trim();
    };
    
    let markdown = '';
    
    const section1Content = formatContent(section1Text, section1Bullets);
    const section2Content = formatContent(section2Text, section2Bullets);
    const section3Content = formatContent(section3Text, section3Bullets);
    
    if (showSection1 && section1Content) {
      markdown += `${formatHeader(header1Format, header1)}\n${section1Content}\n\n`;
    }
    
    if (showSection2 && section2Content) {
      markdown += `${formatHeader(header2Format, header2)}\n${section2Content}\n\n`;
    }
    
    if (showSection3 && section3Content) {
      markdown += `${formatHeader(header3Format, header3)}\n${section3Content}\n\n`;
    }
    
    if (!section1Content && !section2Content && !section3Content) {
      markdown = "# Daily Standup\n\nPlease fill in at least one field to generate your standup.";
    }

    setMarkdownOutput(markdown);
    setShowOutput(true);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(markdownOutput);
      toast({
        title: "Copied!",
        description: "Standup markdown copied to clipboard",
      });
    } catch {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const generateImage = async () => {
    setIsGeneratingImage(true);
    try {
      const imageElement = document.getElementById('standup-image-card');
      if (!imageElement) {
        throw new Error('Image card element not found');
      }

      // Temporarily make the element visible for capturing
      const originalStyle = imageElement.style.cssText;
      imageElement.style.cssText = 'position: fixed; top: -9999px; left: 0; opacity: 1; pointer-events: none; z-index: -1;';
      
      // Wait a moment for styles to apply
      await new Promise(resolve => setTimeout(resolve, 100));

      const canvas = await html2canvas(imageElement, {
        backgroundColor: '#ffffff',
        useCORS: true,
        allowTaint: false,
        scale: 2,
        logging: false,
      });

      // Restore original styling
      imageElement.style.cssText = originalStyle;

      // Convert canvas to blob
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          const today = new Date();
          const dateStr = today.getFullYear() + '-' + 
            String(today.getMonth() + 1).padStart(2, '0') + '-' + 
            String(today.getDate()).padStart(2, '0');
          link.download = `standup-${dateStr}.png`;
          link.href = url;
          link.click();
          URL.revokeObjectURL(url);
          
          toast({
            title: "Image Generated!",
            description: "Your standup image has been downloaded",
          });
        }
      }, 'image/png');
    } catch (err) {
      console.error('Error generating image:', err);
      toast({
        title: "Error",
        description: "Failed to generate image",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingImage(false);
    }
  };



  const resetForm = () => {
    setSection1Text('');
    setSection2Text('');
    setSection3Text('');
    setSection1Bullets([]);
    setSection2Bullets([]);
    setSection3Bullets([]);
    setMarkdownOutput('');
    setShowOutput(false);
  };

  const handleDefaultHeaderFormatChange = (newFormat: string) => {
    setDefaultHeaderFormat(newFormat);
    // Apply the new format to all current sections immediately
    setHeader1Format(newFormat);
    setHeader2Format(newFormat);
    setHeader3Format(newFormat);
  };

  // Calculate progress based on visible sections and their completion
  const calculateProgress = () => {
    const visibleSections = [
      { 
        visible: showSection1, 
        filled: superMode ? section1Bullets.length > 0 : section1Text.trim() !== '' 
      },
      { 
        visible: showSection2, 
        filled: superMode ? section2Bullets.length > 0 : section2Text.trim() !== '' 
      },
      { 
        visible: showSection3, 
        filled: superMode ? section3Bullets.length > 0 : section3Text.trim() !== '' 
      }
    ].filter(section => section.visible);

    if (visibleSections.length === 0) return 0;
    
    const filledCount = visibleSections.filter(section => section.filled).length;
    return filledCount / visibleSections.length;
  };

  const renderFormPage = () => (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="text-center space-y-2">
        <div className="relative">
          <h1 className="text-3xl font-bold text-balance">Standup Formatter</h1>
          <div className="absolute top-0 right-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage('settings')}
            >
              <SettingsIcon className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>
        <p className="text-muted-foreground text-pretty">
          Write out your standup for easy copy and paste
        </p>
      </div>

      {!showOutput ? (
        /* Input Form */
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Standup Details
              {superMode && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Super Mode
                </span>
              )}
            </CardTitle>
            <CardDescription>
              Fill in your standup information below.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {showSection1 && (
              <div className="space-y-2">
                <Label htmlFor="section1Text">{header1}</Label>
                {superMode ? (
                  <BulletInput
                    bullets={section1Bullets}
                    onBulletsChange={setSection1Bullets}
                    placeholder={`Add a bullet point for ${header1.toLowerCase().replace(/\?$/, '')}`}
                  />
                ) : (
                  <Textarea
                    id="section1Text"
                    placeholder={`${header1.toLowerCase().replace(/\?$/, '')}`}
                    value={section1Text}
                    onChange={(e) => setSection1Text(e.target.value)}
                    rows={3}
                  />
                )}
              </div>
            )}

            {showSection2 && (
              <div className="space-y-2">
                <Label htmlFor="section2Text">{header2}</Label>
                {superMode ? (
                  <BulletInput
                    bullets={section2Bullets}
                    onBulletsChange={setSection2Bullets}
                    placeholder={`Add a bullet point for ${header2.toLowerCase().replace(/\?$/, '')}`}
                  />
                ) : (
                  <Textarea
                    id="section2Text"
                    placeholder={`${header2.toLowerCase().replace(/\?$/, '')}`}
                    value={section2Text}
                    onChange={(e) => setSection2Text(e.target.value)}
                    rows={3}
                  />
                )}
              </div>
            )}

            {showSection3 && (
              <div className="space-y-2">
                <Label htmlFor="section3Text">{header3}</Label>
                {superMode ? (
                  <BulletInput
                    bullets={section3Bullets}
                    onBulletsChange={setSection3Bullets}
                    placeholder={`Add a bullet point for ${header3.toLowerCase().replace(/\?$/, '')}`}
                  />
                ) : (
                  <Textarea
                    id="section3Text"
                    placeholder={`${header3.toLowerCase().replace(/\?$/, '')}`}
                    value={section3Text}
                    onChange={(e) => setSection3Text(e.target.value)}
                    rows={3}
                  />
                )}
              </div>
            )}

            <ProgressButton 
              onClick={generateMarkdown} 
              progress={calculateProgress()}
              disabled={calculateProgress() === 0}
            >
              Generate Standup Markdown
            </ProgressButton>
          </CardContent>
        </Card>
      ) : (
        /* Output */
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Generated Markdown</CardTitle>
            <CardDescription>Your formatted standup ready to copy</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <pre className="bg-muted p-4 rounded-md text-sm overflow-auto max-h-96 whitespace-pre-wrap">
                {markdownOutput}
              </pre>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex gap-2">
                <Button variant="outline" onClick={copyToClipboard} className="flex-1">
                  <Copy className="w-4 h-4 mr-2" />
                  Copy to Clipboard
                </Button>
                <Button 
                  variant="outline" 
                  onClick={generateImage} 
                  disabled={isGeneratingImage}
                  className="flex-1"
                >
                  {isGeneratingImage ? (
                    <>
                      <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 mr-2" />
                      Generate Image
                    </>
                  )}
                </Button>
              </div>
              <Button variant="outline" onClick={() => setShowOutput(false)} className="w-full">
                Edit
              </Button>
              <Button 
                variant="outline" 
                onClick={resetForm}
                className="w-full"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Create New Update
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {showOutput && (
        <p className="text-xs text-center text-muted-foreground max-w-2xl mx-auto mt-4">
          Advanced image styling and formatting options for Generate Image are coming soon
        </p>
      )}

      {/* Hidden component for image generation */}
      <div 
        id="standup-image-card" 
        style={{ 
          position: 'fixed', 
          left: '-9999px', 
          top: '-9999px', 
          opacity: 0, 
          pointerEvents: 'none',
          zIndex: -1
        }}
      >
        <StandupImageCard
          markdownOutput={markdownOutput}
          header1={header1}
          header2={header2}
          header3={header3}
          header1Format={header1Format}
          header2Format={header2Format}
          header3Format={header3Format}
          showSection1={showSection1}
          showSection2={showSection2}
          showSection3={showSection3}
          workingOn={section1Text}
          workedOnYesterday={section2Text}
          blockers={section3Text}
          superMode={superMode}
          section1Bullets={section1Bullets}
          section2Bullets={section2Bullets}
          section3Bullets={section3Bullets}
        />
      </div>
    </div>
  );

  return (
    <>
      <div className="min-h-screen bg-background p-4">
        {currentPage === 'settings' ? (
          <Settings 
            defaultHeaderFormat={defaultHeaderFormat}
            onDefaultHeaderFormatChange={handleDefaultHeaderFormatChange}
            header1={header1}
            onHeader1Change={setHeader1}
            header2={header2}
            onHeader2Change={setHeader2}
            header3={header3}
            onHeader3Change={setHeader3}
            showSection1={showSection1}
            onShowSection1Change={setShowSection1}
            showSection2={showSection2}
            onShowSection2Change={setShowSection2}
            showSection3={showSection3}
            onShowSection3Change={setShowSection3}
            superMode={superMode}
            onSuperModeChange={handleSuperModeChange}
            onBackToForm={() => setCurrentPage('form')}
          />
        ) : (
          renderFormPage()
        )}
      </div>
      <Toaster toasts={toasts} onDismiss={dismiss} />
      
      {/* Mode Switch Warning Modal */}
      {showModeWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4 shadow-xl">
            <h3 className="text-lg font-semibold mb-4">Switch Mode?</h3>
            <p className="text-gray-600 mb-6">
              Switching from modes will clear your current standup update. Are you sure you want to continue?
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={handleCancelModeChange}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleConfirmModeChange}
              >
                Yes, Clear Data
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
