interface StandupSectionProps {
  header: string;
  onHeaderChange: (value: string) => void;
  content: string;
  onContentChange: (value: string) => void;
  onHide: () => void;
  placeholder: string;
}

export default function StandupSection({ 
  header, 
  onHeaderChange, 
  content, 
  onContentChange, 
  onHide, 
  placeholder 
}: StandupSectionProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 sm:p-6 relative">
      <button
        type="button"
        onClick={onHide}
        className="absolute top-2 right-2 text-gray-400 hover:text-red-500 text-xl font-bold min-h-[44px] min-w-[44px] flex items-center justify-center sm:min-h-auto sm:min-w-auto"
        title="Hide this section"
      >
        ×
      </button>
      <input
        type="text"
        value={header}
        onChange={(e) => onHeaderChange(e.target.value)}
        className="block w-full text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-2 sm:py-1 pr-12"
        placeholder="Enter section header..."
      />
      <textarea
        value={content}
        onChange={(e) => onContentChange(e.target.value)}
        className="w-full h-32 sm:h-32 p-3 sm:p-4 border border-gray-300 dark:border-gray-600 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 text-sm sm:text-base"
        placeholder={placeholder}
      />
    </div>
  );
}
