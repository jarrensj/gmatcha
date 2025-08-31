'use client';

import { useState, useEffect } from 'react';
import StandupSection from '../components/StandupSection';
import Settings from '../components/Settings';

export default function Home() {
  const [workingOn, setWorkingOn] = useState('');
  const [workedOnYesterday, setWorkedOnYesterday] = useState('');
  const [blockers, setBlockers] = useState('');
  const [markdownOutput, setMarkdownOutput] = useState('');
  const [showOutput, setShowOutput] = useState(false);
  const [currentPage, setCurrentPage] = useState('form'); // 'form' or 'settings'
  const [copyStatus, setCopyStatus] = useState('idle'); // 'idle', 'copying', 'copied'

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
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
    
    const markdownSections = [];
    
    if (showSection1) {
      markdownSections.push(formatHeader(header1Format, header1), workingOn || 'No updates provided');
    }
    
    if (showSection2) {
      if (markdownSections.length > 0) markdownSections.push('');
      markdownSections.push(formatHeader(header2Format, header2), workedOnYesterday || 'No updates provided');
    }
    
    if (showSection3) {
      if (markdownSections.length > 0) markdownSections.push('');
      markdownSections.push(formatHeader(header3Format, header3), blockers || 'No blockers');
    }
    
    const markdown = markdownSections.join('\n');

    setMarkdownOutput(markdown);
    setShowOutput(true);
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(markdownOutput);
      setCopyStatus('copied');
      
      // Reset to idle after 2 seconds
      setTimeout(() => {
        setCopyStatus('idle');
      }, 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
      setCopyStatus('idle');
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

  const renderFormPage = () => (
    <div className="max-w-4xl mx-auto">
      <div className="relative text-center mb-6 sm:mb-8">
        <h1 className="sketch-text text-2xl sm:text-3xl font-bold mb-2 pr-4" style={{color: 'var(--foreground)'}}>
          standup formatter
        </h1>
        <p className="text-sm sm:text-base px-4" style={{color: 'var(--text-muted)'}}>
          format and formulate your daily updates
        </p>
        <div className="absolute top-0 right-0 flex gap-1 sm:gap-2">
          <button
            onClick={() => setCurrentPage('settings')}
            className="sketch-shadow soft-focus py-2 px-2 sm:py-1 sm:px-3 rounded-lg text-xs sm:text-sm min-h-[44px] sm:min-h-auto flex items-center justify-center transition-all duration-300 hover:scale-105"
            style={{backgroundColor: 'var(--accent-primary)', color: 'white', border: '1px solid var(--accent-primary)'}}
          >
            <span className="hidden sm:inline">Settings</span>
            <span className="sm:hidden">⚙️</span>
          </button>
          <button
            onClick={resetForm}
            className="sketch-shadow soft-focus py-2 px-2 sm:py-1 sm:px-3 rounded-lg text-xs sm:text-sm min-h-[44px] sm:min-h-auto flex items-center justify-center transition-all duration-300 hover:scale-105"
            style={{backgroundColor: 'var(--accent-secondary)', color: 'white', border: '1px solid var(--accent-secondary)'}}
          >
            <span className="hidden sm:inline">Reset</span>
            <span className="sm:hidden">🔄</span>
          </button>
        </div>
      </div>



        {!showOutput && (
          <form onSubmit={handleSubmit} className="space-y-8">
            {showSection1 && (
              <StandupSection
                header={header1}
                onHeaderChange={setHeader1}
                content={workingOn}
                onContentChange={setWorkingOn}
                placeholder={`${header1.toLowerCase().replace(/\?$/, '')}`}
              />
            )}

            {showSection2 && (
              <StandupSection
                header={header2}
                onHeaderChange={setHeader2}
                content={workedOnYesterday}
                onContentChange={setWorkedOnYesterday}
                placeholder={`${header2.toLowerCase().replace(/\?$/, '')}`}
              />
            )}

            {showSection3 && (
              <StandupSection
                header={header3}
                onHeaderChange={setHeader3}
                content={blockers}
                onContentChange={setBlockers}
                placeholder={`${header3.toLowerCase().replace(/\?$/, '')}`}
              />
            )}

            <div className="flex justify-center px-4 pt-4">
              <button
                type="submit"
                className="w-full sm:w-auto sketch-shadow soft-focus font-semibold py-5 sm:py-4 px-10 rounded-xl transition-all duration-300 hover:scale-105 text-base sm:text-base min-h-[48px]"
                style={{backgroundColor: 'var(--accent-primary)', color: 'white', border: '1px solid var(--accent-primary)'}}
              >
                Generate Markdown
              </button>
            </div>
          </form>
        )}

        {showOutput && (
          <div className="mt-8 sm:mt-10 sketch-shadow rounded-2xl p-6 sm:p-8" style={{backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)'}}>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4 sm:gap-0">
              <h2 className="sketch-text text-xl sm:text-2xl font-semibold" style={{color: 'var(--foreground)'}}>
                Your Standup Update (Markdown)
              </h2>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <button
                  onClick={copyToClipboard}
                  className={`font-medium py-3 sm:py-2 px-4 rounded-xl transition-all duration-300 soft-focus transform min-h-[48px] sm:min-h-auto text-sm sm:text-base sketch-shadow ${
                    copyStatus === 'copied' 
                      ? 'scale-105 shadow-lg' 
                      : 'hover:scale-105'
                  }`}
                  style={{
                    backgroundColor: copyStatus === 'copied' ? 'var(--accent-disabled)' : 'var(--accent-primary)',
                    color: copyStatus === 'copied' ? '#888' : 'white',
                    border: `1px solid ${copyStatus === 'copied' ? 'var(--accent-disabled)' : 'var(--accent-primary)'}`
                  }}
                >
                  {copyStatus === 'copied' ? '✓ Copied!' : 'Copy'}
                </button>
                <button
                  onClick={() => setShowOutput(false)}
                  className="sketch-shadow soft-focus font-medium py-3 sm:py-2 px-4 rounded-xl transition-all duration-300 hover:scale-105 min-h-[48px] sm:min-h-auto text-sm sm:text-base"
                  style={{backgroundColor: 'var(--accent-primary)', color: 'white', border: '1px solid var(--accent-primary)'}}
                >
                  Edit
                </button>
                <button
                  onClick={resetForm}
                  className="sketch-shadow soft-focus font-medium py-3 sm:py-2 px-4 rounded-xl transition-all duration-300 hover:scale-105 min-h-[48px] sm:min-h-auto text-sm sm:text-base"
                  style={{backgroundColor: 'var(--accent-secondary)', color: 'white', border: '1px solid var(--accent-secondary)'}}
                >
                  New Update
                </button>
              </div>
            </div>
            <div className="rounded-xl p-3 sm:p-4" style={{backgroundColor: 'var(--light-gray)', border: '1px solid var(--border-color)'}}>
              <pre className="text-xs sm:text-sm whitespace-pre-wrap font-mono overflow-x-auto" style={{color: 'var(--soft-charcoal)'}}>
                {markdownOutput}
              </pre>
            </div>
          </div>
        )}
    </div>
  );

  return (
    <div className="min-h-screen textured-bg p-3 sm:p-4 lg:p-8" style={{backgroundColor: 'var(--background)'}}>
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
  );
}
