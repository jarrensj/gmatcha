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
  
  // Custom headers for each section
  const [todayHeader, setTodayHeader] = useState('What are you working on today?');
  const [yesterdayHeader, setYesterdayHeader] = useState('What did you work on yesterday?');
  const [blockersHeader, setBlockersHeader] = useState('What are your blockers?');
  
  // Header formatting options
  const [todayFormat, setTodayFormat] = useState('none');
  const [yesterdayFormat, setYesterdayFormat] = useState('none');
  const [blockersFormat, setBlockersFormat] = useState('none');
  
  // Section visibility
  const [showTodaySection, setShowTodaySection] = useState(true);
  const [showYesterdaySection, setShowYesterdaySection] = useState(true);
  const [showBlockersSection, setShowBlockersSection] = useState(true);
  
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
        setTodayHeader(parsed.todayHeader || 'What are you working on today?');
        setYesterdayHeader(parsed.yesterdayHeader || 'What did you work on yesterday?');
        setBlockersHeader(parsed.blockersHeader || 'What are your blockers?');
        setTodayFormat(parsed.todayFormat || 'none');
        setYesterdayFormat(parsed.yesterdayFormat || 'none');
        setBlockersFormat(parsed.blockersFormat || 'none');
        setShowTodaySection(parsed.showTodaySection !== undefined ? parsed.showTodaySection : true);
        setShowYesterdaySection(parsed.showYesterdaySection !== undefined ? parsed.showYesterdaySection : true);
        setShowBlockersSection(parsed.showBlockersSection !== undefined ? parsed.showBlockersSection : true);
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
      todayHeader,
      yesterdayHeader,
      blockersHeader,
      todayFormat,
      yesterdayFormat,
      blockersFormat,
      showTodaySection,
      showYesterdaySection,
      showBlockersSection,
      defaultHeaderFormat
    };
    localStorage.setItem('standupFormData', JSON.stringify(formData));
  }, [workingOn, workedOnYesterday, blockers, todayHeader, yesterdayHeader, blockersHeader, todayFormat, yesterdayFormat, blockersFormat, showTodaySection, showYesterdaySection, showBlockersSection, defaultHeaderFormat]);

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
    
    if (showTodaySection) {
      markdownSections.push(formatHeader(todayFormat, todayHeader), workingOn || 'No updates provided');
    }
    
    if (showYesterdaySection) {
      if (markdownSections.length > 0) markdownSections.push('');
      markdownSections.push(formatHeader(yesterdayFormat, yesterdayHeader), workedOnYesterday || 'No updates provided');
    }
    
    if (showBlockersSection) {
      if (markdownSections.length > 0) markdownSections.push('');
      markdownSections.push(formatHeader(blockersFormat, blockersHeader), blockers || 'No blockers');
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
    setTodayHeader('What are you working on today?');
    setYesterdayHeader('What did you work on yesterday?');
    setBlockersHeader('What are your blockers?');
    setTodayFormat(defaultHeaderFormat);
    setYesterdayFormat(defaultHeaderFormat);
    setBlockersFormat(defaultHeaderFormat);
    setShowTodaySection(true);
    setShowYesterdaySection(true);
    setShowBlockersSection(true);
    setMarkdownOutput('');
    setShowOutput(false);
    localStorage.removeItem('standupFormData');
  };

  const handleDefaultHeaderFormatChange = (newFormat: string) => {
    setDefaultHeaderFormat(newFormat);
    // Apply the new format to all current sections immediately
    setTodayFormat(newFormat);
    setYesterdayFormat(newFormat);
    setBlockersFormat(newFormat);
  };

  const renderFormPage = () => (
    <div className="max-w-4xl mx-auto">
      <div className="relative text-center mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2 pr-4">
          standup formatter
        </h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 px-4">
          Standup Update Formatter
        </p>
        <div className="absolute top-0 right-0 flex gap-1 sm:gap-2">
          <button
            onClick={() => setCurrentPage('settings')}
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-2 sm:py-1 sm:px-3 rounded text-xs sm:text-sm min-h-[44px] sm:min-h-auto flex items-center justify-center"
          >
            <span className="hidden sm:inline">Settings</span>
            <span className="sm:hidden">⚙️</span>
          </button>
          <button
            onClick={resetForm}
            className="bg-gray-500 hover:bg-gray-600 text-white py-2 px-2 sm:py-1 sm:px-3 rounded text-xs sm:text-sm min-h-[44px] sm:min-h-auto flex items-center justify-center"
          >
            <span className="hidden sm:inline">Reset</span>
            <span className="sm:hidden">🔄</span>
          </button>
        </div>
      </div>



        <form onSubmit={handleSubmit} className="space-y-6">
          {showTodaySection && (
            <StandupSection
              header={todayHeader}
              onHeaderChange={setTodayHeader}
              content={workingOn}
              onContentChange={setWorkingOn}
              onHide={() => setShowTodaySection(false)}
              placeholder={`${todayHeader.toLowerCase().replace(/\?$/, '')}`}
            />
          )}

          {showYesterdaySection && (
            <StandupSection
              header={yesterdayHeader}
              onHeaderChange={setYesterdayHeader}
              content={workedOnYesterday}
              onContentChange={setWorkedOnYesterday}
              onHide={() => setShowYesterdaySection(false)}
              placeholder={`${yesterdayHeader.toLowerCase().replace(/\?$/, '')}`}
            />
          )}

          {showBlockersSection && (
            <StandupSection
              header={blockersHeader}
              onHeaderChange={setBlockersHeader}
              content={blockers}
              onContentChange={setBlockers}
              onHide={() => setShowBlockersSection(false)}
              placeholder={`${blockersHeader.toLowerCase().replace(/\?$/, '')}`}
            />
          )}

          <div className="flex justify-center px-4">
            <button
              type="submit"
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 sm:py-3 px-8 rounded-lg transition-colors duration-200 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 text-base sm:text-base min-h-[48px]"
            >
              Generate Markdown
            </button>
          </div>
        </form>

        {showOutput && (
          <div className="mt-6 sm:mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-3 sm:gap-0">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
                Your Standup Update (Markdown)
              </h2>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <button
                  onClick={copyToClipboard}
                  className={`font-medium py-3 sm:py-2 px-4 rounded-lg transition-all duration-300 focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transform min-h-[48px] sm:min-h-auto text-sm sm:text-base ${
                    copyStatus === 'copied' 
                      ? 'bg-emerald-600 text-white focus:ring-emerald-500 scale-105 shadow-lg' 
                      : 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500 hover:scale-105'
                  }`}
                >
                  {copyStatus === 'copied' ? '✓ Copied!' : 'Copy to Clipboard'}
                </button>
                <button
                  onClick={resetForm}
                  className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 sm:py-2 px-4 rounded-lg transition-colors duration-200 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 min-h-[48px] sm:min-h-auto text-sm sm:text-base"
                >
                  New Update
                </button>
              </div>
            </div>
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3 sm:p-4 border border-gray-200 dark:border-gray-600">
              <pre className="text-xs sm:text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap font-mono overflow-x-auto">
                {markdownOutput}
              </pre>
            </div>
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-2 px-1">
              Click &quot;Copy to Clipboard&quot; to copy this formatted text, then paste it into Slack, Discord, or any other platform.
            </p>
          </div>
        )}
    </div>
  );

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 p-3 sm:p-4 lg:p-8">
      {currentPage === 'settings' ? (
        <Settings 
          defaultHeaderFormat={defaultHeaderFormat}
          onDefaultHeaderFormatChange={handleDefaultHeaderFormatChange}
          onBackToForm={() => setCurrentPage('form')}
        />
      ) : (
        renderFormPage()
      )}
    </div>
  );
}
