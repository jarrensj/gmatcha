interface SettingsProps {
  defaultHeaderFormat: string;
  onDefaultHeaderFormatChange: (format: string) => void;
  onBackToForm: () => void;
}

export default function Settings({ 
  defaultHeaderFormat, 
  onDefaultHeaderFormatChange, 
  onBackToForm 
}: SettingsProps) {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="relative text-center mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Settings
        </h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 px-4">
          Configure your default formatting preferences
        </p>
        <button
          onClick={onBackToForm}
          className="absolute top-0 right-0 bg-blue-500 hover:bg-blue-600 text-white py-2 px-3 sm:py-1 sm:px-3 rounded text-sm min-h-[44px] sm:min-h-auto flex items-center justify-center"
        >
          <span className="hidden sm:inline">Back to Form</span>
          <span className="sm:hidden">Back</span>
        </button>
      </div>

      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Default Header Format
          </h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Choose the default formatting for all section headers:
            </label>
            <select
              value={defaultHeaderFormat}
              onChange={(e) => onDefaultHeaderFormatChange(e.target.value)}
              className="w-full bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 min-h-[44px] text-base"
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
}
