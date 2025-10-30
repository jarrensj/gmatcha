'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { X, FileText } from "lucide-react";

interface PasteUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaste: (parsedData: ParsedUpdateData) => void;
  header1: string;
  header2: string;
  header3: string;
  superMode: boolean;
}

export interface ParsedUpdateData {
  section1: {
    text: string;
    bullets: string[];
  };
  section2: {
    text: string;
    bullets: string[];
  };
  section3: {
    text: string;
    bullets: string[];
  };
}

export function PasteUpdateModal({
  isOpen,
  onClose,
  onPaste,
  header1,
  header2,
  header3,
  superMode,
}: PasteUpdateModalProps) {
  const [pastedText, setPastedText] = useState('');

  if (!isOpen) return null;

  const parseUpdate = (text: string): ParsedUpdateData => {
    const result: ParsedUpdateData = {
      section1: { text: '', bullets: [] },
      section2: { text: '', bullets: [] },
      section3: { text: '', bullets: [] },
    };

    // Normalize line endings and split into lines
    const lines = text.replace(/\r\n/g, '\n').split('\n');
    
    // Create regex patterns for each header (case insensitive, with optional markdown formatting)
    const createHeaderPattern = (header: string) => {
      // Escape special regex characters in the header
      const escaped = header.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      // Match header with optional markdown formatting (**, ##, ###)
      return new RegExp(`^\\s*(\\*\\*|#{1,3}\\s*)?${escaped}(\\*\\*)?\\s*:?\\s*$`, 'i');
    };

    const header1Pattern = createHeaderPattern(header1);
    const header2Pattern = createHeaderPattern(header2);
    const header3Pattern = createHeaderPattern(header3);

    let currentSection: 'section1' | 'section2' | 'section3' | null = null;
    let sectionContent: string[] = [];

    const processSection = (section: 'section1' | 'section2' | 'section3', content: string[]) => {
      const contentText = content.join('\n').trim();
      
      // Check if content has bullet points
      const bulletLines = content.filter(line => {
        const trimmed = line.trim();
        return trimmed.startsWith('- ') || trimmed.startsWith('* ') || trimmed.startsWith('• ');
      });

      if (bulletLines.length > 0) {
        // Extract bullets
        result[section].bullets = bulletLines.map(line => {
          const trimmed = line.trim();
          return trimmed.substring(2).trim(); // Remove "- " or "* " or "• "
        });
        result[section].text = ''; // Clear text if we have bullets
      } else {
        // Store as text
        result[section].text = contentText;
        result[section].bullets = [];
      }
    };

    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Skip empty lines at the start of sections
      if (!currentSection && !trimmedLine) continue;

      // Check if this line is a section header
      if (header1Pattern.test(trimmedLine)) {
        // Save previous section if any
        if (currentSection && sectionContent.length > 0) {
          processSection(currentSection, sectionContent);
        }
        currentSection = 'section1';
        sectionContent = [];
        continue;
      } else if (header2Pattern.test(trimmedLine)) {
        if (currentSection && sectionContent.length > 0) {
          processSection(currentSection, sectionContent);
        }
        currentSection = 'section2';
        sectionContent = [];
        continue;
      } else if (header3Pattern.test(trimmedLine)) {
        if (currentSection && sectionContent.length > 0) {
          processSection(currentSection, sectionContent);
        }
        currentSection = 'section3';
        sectionContent = [];
        continue;
      }

      // Add content to current section
      if (currentSection) {
        sectionContent.push(line);
      }
    }

    // Process the last section
    if (currentSection && sectionContent.length > 0) {
      processSection(currentSection, sectionContent);
    }

    return result;
  };

  const handlePaste = () => {
    if (!pastedText.trim()) return;

    const parsedData = parseUpdate(pastedText);
    onPaste(parsedData);
    setPastedText('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <Card className="w-full max-w-2xl max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <CardHeader className="flex-shrink-0">
          <div className="flex items-start justify-between">
            <div className="space-y-1.5">
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Paste Previous Update
              </CardTitle>
              <CardDescription>
                Paste your previous standup update and it will be automatically parsed into {superMode ? 'bullet points' : 'sections'}
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-auto space-y-4">
          <div className="space-y-2">
            <Textarea
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              placeholder={`Paste your standup update here. It should include headers like:\n\n${header1}\n- Your bullet or text content\n\n${header2}\n- Your bullet or text content\n\n${header3}\n- Your bullet or text content`}
              className="min-h-[300px] font-mono text-sm"
              autoFocus
            />
          </div>

          <div className="bg-muted p-4 rounded-lg text-xs space-y-2">
            <p className="font-medium">Supported formats:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Headers with or without markdown formatting (**bold**, ##, ###)</li>
              <li>Bullet points starting with -, *, or •</li>
              <li>Plain text paragraphs</li>
              <li>Mixed bullet and text content</li>
            </ul>
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handlePaste} disabled={!pastedText.trim()}>
              Parse & Fill Sections
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

