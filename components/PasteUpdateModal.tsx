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
  onParseAndRollover: (parsedData: ParsedUpdateData) => void;
  header1: string;
  header2: string;
  header3: string;
}

export interface ParsedUpdateData {
  section1: {
    text: string;
    bullets: string[];
    detectedHeader?: string;
  };
  section2: {
    text: string;
    bullets: string[];
    detectedHeader?: string;
  };
  section3: {
    text: string;
    bullets: string[];
    detectedHeader?: string;
  };
}

export function PasteUpdateModal({
  isOpen,
  onClose,
  onPaste,
  onParseAndRollover,
  header1,
  header2,
  header3,
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

    // Common standup header patterns for fallback detection
    const yesterdayPatterns = [
      /^\s*(\*\*|#{1,3}\s*)?(yesterday|what\s+i\s+did|completed?|finished?|worked\s+on|accomplished?|last\s+(week|sprint|day|time)|previous(ly)?)(\*\*)?\s*:?\s*$/i,
    ];
    
    const todayPatterns = [
      /^\s*(\*\*|#{1,3}\s*)?(today|what\s+i'?m\s+(doing|working\s+on)|working\s+on|current(ly)?|this\s+(week|sprint|day)|planning\s+to|going\s+to)(\*\*)?\s*:?\s*$/i,
    ];
    
    const blockersPatterns = [
      /^\s*(\*\*|#{1,3}\s*)?(blockers?|issues?|challenges?|impediments?|problems?|roadblocks?|stuck\s+on|needs?\s+help)(\*\*)?\s*:?\s*$/i,
    ];

    // Generic header detection - any line that looks like a header (short, not a bullet, possibly with markdown)
    const isGenericHeader = (line: string): boolean => {
      const trimmed = line.trim();
      // Not a bullet point
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ') || trimmed.startsWith('• ')) return false;
      // Remove markdown formatting
      const cleaned = trimmed.replace(/^\s*(\*\*|#{1,3}\s*)?/, '').replace(/(\*\*)?\s*:?\s*$/, '').trim();
      // Short enough to be a header (not a sentence)
      return cleaned.length > 0 && cleaned.length < 100 && !cleaned.includes('.');
    };

    const header1Pattern = createHeaderPattern(header1);
    const header2Pattern = createHeaderPattern(header2);
    const header3Pattern = createHeaderPattern(header3);

    let currentSection: 'section1' | 'section2' | 'section3' | null = null;
    let sectionContent: string[] = [];
    const detectedHeaders: Record<string, string> = {};
    const sectionsUsed = new Set<string>(); // Track which sections have been assigned

    const extractHeaderText = (line: string): string => {
      // Remove markdown formatting and colons
      return line.replace(/^\s*(\*\*|#{1,3}\s*)?/, '')
                 .replace(/(\*\*)?\s*:?\s*$/, '')
                 .trim();
    };

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

      // Store detected header if different from current
      if (detectedHeaders[section]) {
        result[section].detectedHeader = detectedHeaders[section];
      }
    };

    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Skip empty lines at the start of sections
      if (!currentSection && !trimmedLine) continue;

      let matchedSection: 'section1' | 'section2' | 'section3' | null = null;
      let matchedHeader: string | null = null;

      // First, try to match against current headers exactly
      if (header1Pattern.test(trimmedLine)) {
        matchedSection = 'section1';
        matchedHeader = extractHeaderText(trimmedLine);
      } else if (header2Pattern.test(trimmedLine)) {
        matchedSection = 'section2';
        matchedHeader = extractHeaderText(trimmedLine);
      } else if (header3Pattern.test(trimmedLine)) {
        matchedSection = 'section3';
        matchedHeader = extractHeaderText(trimmedLine);
      } 
      // Try to detect common standup headers
      else if (yesterdayPatterns.some(p => p.test(trimmedLine))) {
        matchedSection = 'section1';
        matchedHeader = extractHeaderText(trimmedLine);
      } else if (todayPatterns.some(p => p.test(trimmedLine))) {
        matchedSection = 'section2';
        matchedHeader = extractHeaderText(trimmedLine);
      } else if (blockersPatterns.some(p => p.test(trimmedLine))) {
        matchedSection = 'section3';
        matchedHeader = extractHeaderText(trimmedLine);
      }
      // Fallback: if it looks like a generic header, treat it as the next available section
      else if (isGenericHeader(trimmedLine)) {
        // Assign to the next unused section
        if (!sectionsUsed.has('section1')) {
          matchedSection = 'section1';
        } else if (!sectionsUsed.has('section2')) {
          matchedSection = 'section2';
        } else if (!sectionsUsed.has('section3')) {
          matchedSection = 'section3';
        }
        if (matchedSection) {
          matchedHeader = extractHeaderText(trimmedLine);
        }
      }

      if (matchedSection) {
        // Save previous section if any
        if (currentSection && sectionContent.length > 0) {
          processSection(currentSection, sectionContent);
        }
        currentSection = matchedSection;
        sectionContent = [];
        sectionsUsed.add(matchedSection); // Mark this section as used
        
        // Store the detected header if it's different from the current one
        const currentHeader = matchedSection === 'section1' ? header1 : 
                             matchedSection === 'section2' ? header2 : header3;
        if (matchedHeader && matchedHeader.toLowerCase() !== currentHeader.toLowerCase()) {
          detectedHeaders[matchedSection] = matchedHeader;
        }
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

  const handleParseAndRollover = () => {
    if (!pastedText.trim()) return;

    const parsedData = parseUpdate(pastedText);
    onParseAndRollover(parsedData);
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
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-amber-100 text-amber-800">
                  WIP
                </span>
              </CardTitle>
              <CardDescription>
                Paste your previous standup update and it will be automatically parsed into bullet points
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
              <li>Automatically detects section headers (even if named differently)</li>
              <li>Headers with or without markdown formatting (**bold**, ##, ###)</li>
              <li>Bullet points starting with -, *, or •</li>
              <li>Plain text paragraphs</li>
              <li>Will update your section headers if different ones are detected</li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
            <Button variant="outline" onClick={onClose} className="min-h-[44px] sm:min-h-0">
              Cancel
            </Button>
            <Button 
              variant="outline"
              onClick={handleParseAndRollover} 
              disabled={!pastedText.trim()}
              className="min-h-[44px] sm:min-h-0"
            >
              Parse & Rollover
            </Button>
            <Button onClick={handlePaste} disabled={!pastedText.trim()} className="min-h-[44px] sm:min-h-0">
              Parse & Fill Sections
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

