'use client';

import { useState, useEffect } from 'react';

export default function Home() {
  const [workingOn, setWorkingOn] = useState('');
  const [workedOnYesterday, setWorkedOnYesterday] = useState('');
  const [blockers, setBlockers] = useState('');
  const [markdownOutput, setMarkdownOutput] = useState('');
  const [showOutput, setShowOutput] = useState(false);

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedData = localStorage.getItem('standupFormData');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setWorkingOn(parsed.workingOn || '');
        setWorkedOnYesterday(parsed.workedOnYesterday || '');
        setBlockers(parsed.blockers || '');
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
      blockers
    };
    localStorage.setItem('standupFormData', JSON.stringify(formData));
  }, [workingOn, workedOnYesterday, blockers]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const markdown = `## Daily Standup Update

### 🎯 What I'm working on today:
${workingOn || 'No updates provided'}

### ✅ What I worked on yesterday:
${workedOnYesterday || 'No updates provided'}

### 🚧 Blockers:
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
    setMarkdownOutput('');
    setShowOutput(false);
    localStorage.removeItem('standupFormData');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Daily Standup Update
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Share your progress and blockers with your team
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <label htmlFor="working-on" className="block text-lg font-semibold text-gray-900 dark:text-white mb-3">
              What are you working on today?
            </label>
            <textarea
              id="working-on"
              value={workingOn}
              onChange={(e) => setWorkingOn(e.target.value)}
              className="w-full h-32 p-4 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              placeholder="Describe what you're planning to work on today..."
            />
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <label htmlFor="worked-yesterday" className="block text-lg font-semibold text-gray-900 dark:text-white mb-3">
              What did you work on yesterday?
            </label>
            <textarea
              id="worked-yesterday"
              value={workedOnYesterday}
              onChange={(e) => setWorkedOnYesterday(e.target.value)}
              className="w-full h-32 p-4 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              placeholder="Share what you accomplished yesterday..."
            />
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <label htmlFor="blockers" className="block text-lg font-semibold text-gray-900 dark:text-white mb-3">
              What are your blockers?
            </label>
            <textarea
              id="blockers"
              value={blockers}
              onChange={(e) => setBlockers(e.target.value)}
              className="w-full h-32 p-4 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              placeholder="List any blockers or challenges you're facing..."
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
