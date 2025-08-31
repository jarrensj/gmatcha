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
  onBackToForm 
}: SettingsProps) {
  
  const resetHeaders = () => {
    onHeader1Change(process.env.NEXT_PUBLIC_SECTION1_HEADER || 'What are you working on today?');
    onHeader2Change(process.env.NEXT_PUBLIC_SECTION2_HEADER || 'What did you work on yesterday?');
    onHeader3Change(process.env.NEXT_PUBLIC_SECTION3_HEADER || 'What are your blockers?');
    onDefaultHeaderFormatChange('none');
    // Also restore all hidden sections
    onShowSection1Change(true);
    onShowSection2Change(true);
    onShowSection3Change(true);
  };

  // Check if current values differ from defaults
  const hasChanges = 
    header1 !== (process.env.NEXT_PUBLIC_SECTION1_HEADER || 'What are you working on today?') ||
    header2 !== (process.env.NEXT_PUBLIC_SECTION2_HEADER || 'What did you work on yesterday?') ||
    header3 !== (process.env.NEXT_PUBLIC_SECTION3_HEADER || 'What are your blockers?') ||
    defaultHeaderFormat !== 'none' ||
    !showSection1 || !showSection2 || !showSection3;
  return (
    <div className="max-w-2xl mx-auto">
      <div className="relative text-center mb-6 sm:mb-8">
        <h1 className="sketch-text text-2xl sm:text-3xl font-bold mb-2" style={{color: 'var(--foreground)'}}>
          Settings
        </h1>
        <p className="text-sm sm:text-base px-4" style={{color: 'var(--text-muted)'}}>
          Configure your default formatting preferences
        </p>
        <button
          onClick={onBackToForm}
          className="absolute top-0 right-0 sketch-shadow soft-focus py-2 px-3 sm:py-1 sm:px-3 rounded-lg text-sm min-h-[44px] sm:min-h-auto flex items-center justify-center transition-all duration-300 hover:scale-105"
          style={{backgroundColor: 'var(--accent-primary)', color: 'white', border: '1px solid var(--accent-primary)'}}
        >
          <span className="hidden sm:inline">Back to Form</span>
          <span className="sm:hidden">Back</span>
        </button>
      </div>

      <div className="space-y-6">
        <div className="sketch-shadow rounded-2xl p-4 sm:p-6" style={{backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)'}}>
          <h3 className="sketch-text text-xl font-semibold mb-4" style={{color: 'var(--foreground)'}}>
            Section Header Titles
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{color: 'var(--foreground)'}}>
                Header 1:
              </label>
              <input
                type="text"
                value={header1}
                onChange={(e) => onHeader1Change(e.target.value)}
                className="w-full soft-focus rounded-lg px-3 py-2 min-h-[44px] text-base transition-all duration-300"
                style={{
                  backgroundColor: 'var(--light-gray)',
                  color: 'var(--foreground)',
                  border: '1px solid var(--border-color)'
                }}
                placeholder="Enter first section header"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2" style={{color: 'var(--foreground)'}}>
                Header 2:
              </label>
              <input
                type="text"
                value={header2}
                onChange={(e) => onHeader2Change(e.target.value)}
                className="w-full soft-focus rounded-lg px-3 py-2 min-h-[44px] text-base transition-all duration-300"
                style={{
                  backgroundColor: 'var(--light-gray)',
                  color: 'var(--foreground)',
                  border: '1px solid var(--border-color)'
                }}
                placeholder="Enter second section header"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2" style={{color: 'var(--foreground)'}}>
                Header 3:
              </label>
              <input
                type="text"
                value={header3}
                onChange={(e) => onHeader3Change(e.target.value)}
                className="w-full soft-focus rounded-lg px-3 py-2 min-h-[44px] text-base transition-all duration-300"
                style={{
                  backgroundColor: 'var(--light-gray)',
                  color: 'var(--foreground)',
                  border: '1px solid var(--border-color)'
                }}
                placeholder="Enter third section header"
              />
            </div>
          </div>
          
          <p className="text-sm mt-4" style={{color: 'var(--text-muted)'}}>
            These titles will be used as the default headers for each section in your standup form.
          </p>
        </div>

        <div className="sketch-shadow rounded-2xl p-4 sm:p-6" style={{backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)'}}>
          <h3 className="sketch-text text-xl font-semibold mb-4" style={{color: 'var(--foreground)'}}>
            Section Visibility
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium" style={{color: 'var(--foreground)'}}>
                  {header1}
                </span>
                <p className="text-xs mt-1" style={{color: 'var(--text-muted)'}}>
                  Show or hide this section in the form
                </p>
              </div>
              <button
                onClick={() => {
                  // Prevent hiding if it's the only visible section
                  if (showSection1 && !showSection2 && !showSection3) return;
                  onShowSection1Change(!showSection1);
                }}
                disabled={showSection1 && !showSection2 && !showSection3}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  showSection1 
                    ? 'bg-green-600 focus:ring-green-500' 
                    : 'bg-gray-200 focus:ring-gray-500'
                } ${(showSection1 && !showSection2 && !showSection3) ? 'opacity-50 cursor-not-allowed' : ''}`}
                style={{
                  backgroundColor: showSection1 ? 'var(--accent-primary)' : 'var(--accent-disabled)'
                }}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    showSection1 ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium" style={{color: 'var(--foreground)'}}>
                  {header2}
                </span>
                <p className="text-xs mt-1" style={{color: 'var(--text-muted)'}}>
                  Show or hide this section in the form
                </p>
              </div>
              <button
                onClick={() => {
                  // Prevent hiding if it's the only visible section
                  if (showSection2 && !showSection1 && !showSection3) return;
                  onShowSection2Change(!showSection2);
                }}
                disabled={showSection2 && !showSection1 && !showSection3}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  showSection2 
                    ? 'bg-green-600 focus:ring-green-500' 
                    : 'bg-gray-200 focus:ring-gray-500'
                } ${(showSection2 && !showSection1 && !showSection3) ? 'opacity-50 cursor-not-allowed' : ''}`}
                style={{
                  backgroundColor: showSection2 ? 'var(--accent-primary)' : 'var(--accent-disabled)'
                }}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    showSection2 ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium" style={{color: 'var(--foreground)'}}>
                  {header3}
                </span>
                <p className="text-xs mt-1" style={{color: 'var(--text-muted)'}}>
                  Show or hide this section in the form
                </p>
              </div>
              <button
                onClick={() => {
                  // Prevent hiding if it's the only visible section
                  if (showSection3 && !showSection1 && !showSection2) return;
                  onShowSection3Change(!showSection3);
                }}
                disabled={showSection3 && !showSection1 && !showSection2}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  showSection3 
                    ? 'bg-green-600 focus:ring-green-500' 
                    : 'bg-gray-200 focus:ring-gray-500'
                } ${(showSection3 && !showSection1 && !showSection2) ? 'opacity-50 cursor-not-allowed' : ''}`}
                style={{
                  backgroundColor: showSection3 ? 'var(--accent-primary)' : 'var(--accent-disabled)'
                }}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                    showSection3 ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
          
          <p className="text-sm mt-4" style={{color: 'var(--text-muted)'}}>
            Toggle sections on or off. Hidden sections won&apos;t appear in your standup form or final output. At least one section must remain visible.
          </p>
        </div>

        <div className="sketch-shadow rounded-2xl p-4 sm:p-6" style={{backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)'}}>
          <h3 className="sketch-text text-xl font-semibold mb-4" style={{color: 'var(--foreground)'}}>
            Default Header Format
          </h3>
          
          <div>
            <label className="block text-sm font-medium mb-2" style={{color: 'var(--foreground)'}}>
              Choose the default formatting for all section headers:
            </label>
            <select
              value={defaultHeaderFormat}
              onChange={(e) => onDefaultHeaderFormatChange(e.target.value)}
              className="w-full soft-focus rounded-lg px-3 py-2 min-h-[44px] text-base transition-all duration-300"
              style={{
                backgroundColor: 'var(--light-gray)',
                color: 'var(--foreground)',
                border: '1px solid var(--border-color)'
              }}
            >
              <option value="none">Plain text</option>
              <option value="bold">**Bold**</option>
              <option value="##">## Header 2</option>
              <option value="###">### Header 3</option>
            </select>
          </div>
          
          <p className="text-sm mt-4" style={{color: 'var(--text-muted)'}}>
            This setting applies to all sections immediately and will be used for new updates.
          </p>
        </div>

        <div className="flex justify-center pt-4">
          <button
            onClick={resetHeaders}
            disabled={!hasChanges}
            className={`sketch-shadow soft-focus font-medium py-3 px-6 rounded-xl transition-all duration-300 text-base ${
              hasChanges 
                ? 'hover:scale-105 cursor-pointer' 
                : 'cursor-not-allowed opacity-50'
            }`}
            style={{
              backgroundColor: hasChanges ? 'var(--accent-secondary)' : 'var(--accent-disabled)',
              color: hasChanges ? 'white' : '#888', 
              border: `1px solid ${hasChanges ? 'var(--accent-secondary)' : 'var(--accent-disabled)'}`
            }}
          >
            Reset App Settings to Default
          </button>
        </div>
      </div>
    </div>
  );
}
