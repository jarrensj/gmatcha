'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { ProgressButton } from "@/components/ui/progress-button";
import { Input } from "@/components/ui/input";
import { Copy, Settings as SettingsIcon, RotateCcw, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toast";
import Settings from '../components/Settings';

export default function Home() {
  const [workingOn, setWorkingOn] = useState('');
  const [workedOnYesterday, setWorkedOnYesterday] = useState('');
  const [blockers, setBlockers] = useState('');
  const [markdownOutput, setMarkdownOutput] = useState('');
  const [showOutput, setShowOutput] = useState(false);
  const [currentPage, setCurrentPage] = useState('form'); // 'form' or 'settings'
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

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedData = localStorage.getItem('standupFormData');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setWorkingOn(parsed.workingOn || '');
        setWorkedOnYesterday(parsed.workedOnYesterday || '');
        setBlockers(parsed.blockers || '');
        // Use environment variables if they exist, otherwise use defaults
        setHeader1(process.env.NEXT_PUBLIC_SECTION1_HEADER || 'What are you working on today?');
        setHeader2(process.env.NEXT_PUBLIC_SECTION2_HEADER || 'What did you work on yesterday?');
        setHeader3(process.env.NEXT_PUBLIC_SECTION3_HEADER || 'What are your blockers?');
        setHeader1Format(parsed.header1Format || 'none');
        setHeader2Format(parsed.header2Format || 'none');
        setHeader3Format(parsed.header3Format || 'none');
        setShowSection1(parsed.showSection1 !== undefined ? parsed.showSection1 : true);
        setShowSection2(parsed.showSection2 !== undefined ? parsed.showSection2 : true);
        setShowSection3(parsed.showSection3 !== undefined ? parsed.showSection3 : true);
        setDefaultHeaderFormat(parsed.defaultHeaderFormat || 'none');
      } catch (error) {
        console.error('Error loading saved data:', error);
      }
    }
  }, []);

  // Save to localStorage whenever form data changes
  useEffect(() => {
    const formData = {
      workingOn,
      workedOnYesterday,
      blockers,
      header1,
      header2,
      header3,
      header1Format,
      header2Format,
      header3Format,
      showSection1,
      showSection2,
      showSection3,
      defaultHeaderFormat
    };
    localStorage.setItem('standupFormData', JSON.stringify(formData));
  }, [workingOn, workedOnYesterday, blockers, header1, header2, header3, header1Format, header2Format, header3Format, showSection1, showSection2, showSection3, defaultHeaderFormat]);

  const generateMarkdown = () => {
    const currentDate = new Date().toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

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
    
    let markdown = '';
    
    if (showSection1 && workingOn.trim()) {
      markdown += `${formatHeader(header1Format, header1)}\n${workingOn.trim()}\n\n`;
    }
    
    if (showSection2 && workedOnYesterday.trim()) {
      markdown += `${formatHeader(header2Format, header2)}\n${workedOnYesterday.trim()}\n\n`;
    }
    
    if (showSection3 && blockers.trim()) {
      markdown += `${formatHeader(header3Format, header3)}\n${blockers.trim()}\n\n`;
    }
    
    if (!workingOn.trim() && !workedOnYesterday.trim() && !blockers.trim()) {
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
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };



  const resetForm = () => {
    setWorkingOn('');
    setWorkedOnYesterday('');
    setBlockers('');
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
      { visible: showSection1, filled: workingOn.trim() !== '' },
      { visible: showSection2, filled: workedOnYesterday.trim() !== '' },
      { visible: showSection3, filled: blockers.trim() !== '' }
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
          Generate formatted markdown for your daily standup meetings
        </p>
      </div>

      {!showOutput ? (
        /* Input Form */
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>Standup Details</CardTitle>
            <CardDescription>Fill in your standup information below. Go to Settings to customize section headers.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {showSection1 && (
              <div className="space-y-2">
                <Label htmlFor="workingOn">{header1}</Label>
                <Textarea
                  id="workingOn"
                  placeholder={`${header1.toLowerCase().replace(/\?$/, '')}`}
                  value={workingOn}
                  onChange={(e) => setWorkingOn(e.target.value)}
                  rows={3}
                />
              </div>
            )}

            {showSection2 && (
              <div className="space-y-2">
                <Label htmlFor="workedOnYesterday">{header2}</Label>
                <Textarea
                  id="workedOnYesterday"
                  placeholder={`${header2.toLowerCase().replace(/\?$/, '')}`}
                  value={workedOnYesterday}
                  onChange={(e) => setWorkedOnYesterday(e.target.value)}
                  rows={3}
                />
              </div>
            )}

            {showSection3 && (
              <div className="space-y-2">
                <Label htmlFor="blockers">{header3}</Label>
                <Textarea
                  id="blockers"
                  placeholder={`${header3.toLowerCase().replace(/\?$/, '')}`}
                  value={blockers}
                  onChange={(e) => setBlockers(e.target.value)}
                  rows={3}
                />
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
                <Button variant="outline" onClick={() => setShowOutput(false)} className="flex-1">
                  Edit
                </Button>
              </div>
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
            onBackToForm={() => setCurrentPage('form')}
          />
        ) : (
          renderFormPage()
        )}
      </div>
      <Toaster toasts={toasts} onDismiss={dismiss} />
    </>
  );
}
