'use client';

import { useState, useEffect } from 'react';
import StandupSection from '../components/StandupSection';

export default function Home() {
  const [workingOn, setWorkingOn] = useState('');
  const [workedOnYesterday, setWorkedOnYesterday] = useState('');
  const [blockers, setBlockers] = useState('');
  const [markdownOutput, setMarkdownOutput] = useState('');
  const [showOutput, setShowOutput] = useState(false);
  const [currentPage, setCurrentPage] = useState('form'); // 'form' or 'settings'
  
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
      alert('Copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy: ', err);
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

  const renderSettingsPage = () => (
    <div className="max-w-2xl mx-auto">
      <div className="relative text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Configure your default formatting preferences
        </p>
        <button
          onClick={() => setCurrentPage('form')}
          className="absolute top-0 right-0 bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded"
        >
          Back to Form
        </button>
      </div>

      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Default Header Format
          </h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Choose the default formatting for all section headers:
            </label>
            <select
              value={defaultHeaderFormat}
              onChange={(e) => {
                const newFormat = e.target.value;
                setDefaultHeaderFormat(newFormat);
                // Apply the new format to all current sections immediately
                setTodayFormat(newFormat);
                setYesterdayFormat(newFormat);
                setBlockersFormat(newFormat);
              }}
              className="w-full bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500"
            >
              <option value="none">Plain text</option>
              <option value="bold">**Bold**</option>
              <option value="##">## Header 2</option>
              <option value="###">### Header 3</option>
            </select>
          </div>
          
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
            This setting applies to all sections immediately and will be used for new updates.
          </p>
        </div>
      </div>
    </div>
  );

  const renderFormPage = () => (
    <div className="max-w-4xl mx-auto">
      <div className="relative text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Standup Update Formatter
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Create formatted updates for your team
        </p>
        <div className="absolute top-0 right-0 flex gap-2">
          <button
            onClick={() => setCurrentPage('settings')}
            className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded"
          >
            Settings
          </button>
          <button
            onClick={resetForm}
            className="bg-gray-500 hover:bg-gray-600 text-white py-1 px-3 rounded"
          >
            Reset
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

          <div className="flex justify-center">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
            >
              Generate Markdown
            </button>
          </div>
        </form>

        {showOutput && (
          <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Your Standup Update (Markdown)
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={copyToClipboard}
                  className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                >
                  Copy to Clipboard
                </button>
                <button
                  onClick={resetForm}
                  className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                >
                  New Update
                </button>
              </div>
            </div>
            <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
              <pre className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap font-mono overflow-x-auto">
                {markdownOutput}
              </pre>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Click &quot;Copy to Clipboard&quot; to copy this formatted text, then paste it into Slack, Discord, or any other platform.
            </p>
          </div>
        )}
    </div>
  );

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 p-4 sm:p-8">
      {currentPage === 'settings' ? renderSettingsPage() : renderFormPage()}
    </div>
  );
}
