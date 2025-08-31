interface StandupSectionProps {
  header: string;
  onHeaderChange: (value: string) => void;
  content: string;
  onContentChange: (value: string) => void;
  placeholder: string;
}

export default function StandupSection({ 
  header, 
  onHeaderChange, 
  content, 
  onContentChange, 
  placeholder 
}: StandupSectionProps) {
  return (
    <div className="sketch-shadow rounded-2xl p-6 sm:p-8" style={{backgroundColor: 'var(--card-bg)', border: '1px solid var(--border-color)'}}>
      <input
        type="text"
        value={header}
        onChange={(e) => onHeaderChange(e.target.value)}
        className="sketch-text block w-full text-lg sm:text-xl font-semibold mb-4 bg-transparent border-none soft-focus rounded-lg px-3 py-3 sm:py-2"
        style={{color: 'var(--foreground)'}}
        placeholder="Enter section header..."
      />
      <textarea
        value={content}
        onChange={(e) => onContentChange(e.target.value)}
        className="w-full h-36 sm:h-36 p-4 sm:p-5 rounded-xl resize-none soft-focus text-sm sm:text-base transition-all duration-300"
        style={{
          backgroundColor: 'var(--light-gray)',
          border: '1px solid var(--border-color)',
          color: 'var(--foreground)'
        }}
        onFocus={(e) => {
          e.target.style.backgroundColor = 'var(--warm-white)';
          e.target.style.borderColor = 'var(--accent-primary)';
        }}
        onBlur={(e) => {
          e.target.style.backgroundColor = 'var(--light-gray)';
          e.target.style.borderColor = 'var(--border-color)';
        }}
        placeholder={placeholder}
      />
    </div>
  );
}
