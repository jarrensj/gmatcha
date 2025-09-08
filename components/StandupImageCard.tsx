import React from 'react';

interface StandupImageCardProps {
  markdownOutput: string;
  header1: string;
  header2: string;
  header3: string;
  header1Format: string;
  header2Format: string;
  header3Format: string;
  showSection1: boolean;
  showSection2: boolean;
  showSection3: boolean;
  workingOn: string;
  workedOnYesterday: string;
  blockers: string;
  superMode: boolean;
  section1Bullets: string[];
  section2Bullets: string[];
  section3Bullets: string[];
}

export const StandupImageCard: React.FC<StandupImageCardProps> = ({
  header1,
  header2,
  header3,
  header1Format,
  header2Format,
  header3Format,
  showSection1,
  showSection2,
  showSection3,
  workingOn,
  workedOnYesterday,
  blockers,
  superMode,
  section1Bullets,
  section2Bullets,
  section3Bullets,
}) => {
  const formatHeader = (format: string, header: string) => {
    // For image generation, we'll handle formatting with CSS classes instead of markdown
    return header;
  };

  const getHeaderClassName = (format: string) => {
    switch (format) {
      case 'bold':
        return 'font-bold text-gray-900';
      case '##':
        return 'text-2xl font-bold text-gray-900 mb-2';
      case '###':
        return 'text-xl font-bold text-gray-900 mb-1';
      case 'none':
      default:
        return 'font-semibold text-gray-800';
    }
  };

  const getContentToDisplay = (textContent: string, bullets: string[]) => {
    if (superMode && bullets.length > 0) {
      return { type: 'bullets', content: bullets };
    }
    return { type: 'text', content: textContent.trim() };
  };

  const renderContent = (contentData: { type: string; content: string | string[] }) => {
    if (contentData.type === 'bullets' && Array.isArray(contentData.content)) {
      return (
        <div className="space-y-2">
          {contentData.content.map((bullet, index) => (
            <div 
              key={index} 
              className="flex items-start gap-3"
              style={{ 
                color: '#4a4a4a',
                fontSize: '16px',
                lineHeight: '1.7',
                fontWeight: 400,
                letterSpacing: '0.1px'
              }}
            >
              <div 
                className="flex-shrink-0 mt-3"
                style={{
                  width: '4px',
                  height: '4px',
                  backgroundColor: '#8a8a8a',
                  borderRadius: '50%'
                }}
              />
              <span>{bullet}</span>
            </div>
          ))}
        </div>
      );
    } else {
      return (
        <div 
          className="leading-relaxed whitespace-pre-wrap"
          style={{ 
            color: '#4a4a4a',
            fontSize: '16px',
            lineHeight: '1.7',
            fontWeight: 400,
            letterSpacing: '0.1px'
          }}
        >
          {contentData.content as string}
        </div>
      );
    }
  };

  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div 
      className="w-[800px] relative"
      style={{ 
        backgroundColor: '#faf8f5', // warm cream background
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
        padding: '48px 48px 32px 48px', // reduced bottom padding
        // Soft paper texture - very subtle
        backgroundImage: `
          radial-gradient(circle at 25% 25%, rgba(74, 74, 74, 0.008) 0%, transparent 50%),
          radial-gradient(circle at 75% 75%, rgba(74, 74, 74, 0.008) 0%, transparent 50%),
          linear-gradient(0deg, transparent 24%, rgba(74, 74, 74, 0.003) 25%, rgba(74, 74, 74, 0.003) 26%, transparent 27%, transparent 74%, rgba(74, 74, 74, 0.003) 75%, rgba(74, 74, 74, 0.003) 76%, transparent 77%)
        `
      }}
    >
      {/* Header - clean and minimal */}
      <div className="mb-10">
        <p 
          className="text-sm"
          style={{ 
            color: '#8a8a8a', // very soft gray
            fontWeight: 400,
            letterSpacing: '0.2px',
            opacity: 0.8
          }}
        >
          {currentDate}
        </p>
      </div>

      {/* Content - very spacious and breathable */}
      <div className="space-y-10">
        {(() => {
          const section1Content = getContentToDisplay(workingOn, section1Bullets);
          const hasContent = section1Content.type === 'bullets' 
            ? (section1Content.content as string[]).length > 0
            : (section1Content.content as string).length > 0;
          
          return showSection1 && hasContent && (
            <div className="space-y-4">
              <h2 
                className={getHeaderClassName(header1Format)}
                style={{ 
                  color: '#7a9b7a', // soft muted green
                  fontWeight: 500,
                  letterSpacing: '0.2px',
                  fontSize: header1Format === '##' ? '22px' : header1Format === '###' ? '20px' : '18px',
                  lineHeight: '1.3'
                }}
              >
                {formatHeader(header1Format, header1)}
              </h2>
              {renderContent(section1Content)}
            </div>
          );
        })()}

        {(() => {
          const section2Content = getContentToDisplay(workedOnYesterday, section2Bullets);
          const hasContent = section2Content.type === 'bullets' 
            ? (section2Content.content as string[]).length > 0
            : (section2Content.content as string).length > 0;
          
          return showSection2 && hasContent && (
            <div className="space-y-4">
              <h2 
                className={getHeaderClassName(header2Format)}
                style={{ 
                  color: '#8b7355', // soft brown
                  fontWeight: 500,
                  letterSpacing: '0.2px',
                  fontSize: header2Format === '##' ? '22px' : header2Format === '###' ? '20px' : '18px',
                  lineHeight: '1.3'
                }}
              >
                {formatHeader(header2Format, header2)}
              </h2>
              {renderContent(section2Content)}
            </div>
          );
        })()}

        {(() => {
          const section3Content = getContentToDisplay(blockers, section3Bullets);
          const hasContent = section3Content.type === 'bullets' 
            ? (section3Content.content as string[]).length > 0
            : (section3Content.content as string).length > 0;
          
          return showSection3 && hasContent && (
            <div className="space-y-4">
              <h2 
                className={getHeaderClassName(header3Format)}
                style={{ 
                  color: '#a67c7c', // very soft muted red/brown
                  fontWeight: 500,
                  letterSpacing: '0.2px',
                  fontSize: header3Format === '##' ? '22px' : header3Format === '###' ? '20px' : '18px',
                  lineHeight: '1.3'
                }}
              >
                {formatHeader(header3Format, header3)}
              </h2>
              {renderContent(section3Content)}
            </div>
          );
        })()}
      </div>

      {/* Footer - minimal and understated */}
      <div className="text-center mt-8">
        <p 
          className="text-xs"
          style={{ 
            color: '#8a8a8a',
            fontWeight: 400,
            letterSpacing: '0.2px',
            opacity: 0.7
          }}
        >
          Generated by standup formatter
        </p>
      </div>
    </div>
  );
};
