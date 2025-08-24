'use client';

import { useState, useEffect } from 'react';

export default function Home() {
  const [workingOn, setWorkingOn] = useState('');
  const [workedOnYesterday, setWorkedOnYesterday] = useState('');
  const [blockers, setBlockers] = useState('');
  const [markdownOutput, setMarkdownOutput] = useState('');
  const [showOutput, setShowOutput] = useState(false);
  
  // Custom headers for each section
  const [todayHeader, setTodayHeader] = useState('What are you working on today?');
  const [yesterdayHeader, setYesterdayHeader] = useState('What did you work on yesterday?');
  const [blockersHeader, setBlockersHeader] = useState('What are your blockers?');

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
      blockersHeader
    };
    localStorage.setItem('standupFormData', JSON.stringify(formData));
  }, [workingOn, workedOnYesterday, blockers, todayHeader, yesterdayHeader, blockersHeader]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const markdown = `## Daily Standup Update

### ${todayHeader}
${workingOn || 'No updates provided'}

### ${yesterdayHeader}
${workedOnYesterday || 'No updates provided'}

### ${blockersHeader}
${blockers || 'No blockers'}`;

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
    setMarkdownOutput('');
    setShowOutput(false);
    localStorage.removeItem('standupFormData');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="relative text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Daily Standup Update
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Share your progress and blockers with your team
          </p>
          <button
            onClick={resetForm}
            className="absolute top-0 right-0 bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
          >
            Reset Form
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <input
              type="text"
              value={todayHeader}
              onChange={(e) => setTodayHeader(e.target.value)}
              className="block w-full text-lg font-semibold text-gray-900 dark:text-white mb-3 bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1"
              placeholder="Enter section header..."
            />
            <textarea
              id="working-on"
              value={workingOn}
              onChange={(e) => setWorkingOn(e.target.value)}
              className="w-full h-32 p-4 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              placeholder={`${todayHeader.toLowerCase().replace(/\?$/, '')}`}
            />
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <input
              type="text"
              value={yesterdayHeader}
              onChange={(e) => setYesterdayHeader(e.target.value)}
              className="block w-full text-lg font-semibold text-gray-900 dark:text-white mb-3 bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1"
              placeholder="Enter section header..."
            />
            <textarea
              id="worked-yesterday"
              value={workedOnYesterday}
              onChange={(e) => setWorkedOnYesterday(e.target.value)}
              className="w-full h-32 p-4 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              placeholder={`${yesterdayHeader.toLowerCase().replace(/\?$/, '')}`}
            />
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <input
              type="text"
              value={blockersHeader}
              onChange={(e) => setBlockersHeader(e.target.value)}
              className="block w-full text-lg font-semibold text-gray-900 dark:text-white mb-3 bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1"
              placeholder="Enter section header..."
            />
            <textarea
              id="blockers"
              value={blockers}
              onChange={(e) => setBlockers(e.target.value)}
              className="w-full h-32 p-4 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              placeholder={`${blockersHeader.toLowerCase().replace(/\?$/, '')}`}
            />
          </div>

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
    </div>
  );
}
