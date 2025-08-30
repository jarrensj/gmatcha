interface SettingsProps {
  defaultHeaderFormat: string;
  onDefaultHeaderFormatChange: (format: string) => void;
  header1: string;
  onHeader1Change: (header: string) => void;
  header2: string;
  onHeader2Change: (header: string) => void;
  header3: string;
  onHeader3Change: (header: string) => void;
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
  onBackToForm 
}: SettingsProps) {
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
          style={{backgroundColor: 'var(--accent-primary)', color: 'white', border: '1px solid var(--accent-secondary)'}}
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
      </div>
    </div>
  );
}
