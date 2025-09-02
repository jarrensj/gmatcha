import * as React from "react"
import { cn } from "@/lib/utils"

export interface ProgressButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  progress: number // 0 to 1
}

const ProgressButton = React.forwardRef<HTMLButtonElement, ProgressButtonProps>(
  ({ className, progress, children, disabled, ...props }, ref) => {
    const progressPercentage = Math.min(100, Math.max(0, progress * 100))
    
    return (
      <button
        className={cn(
          "relative inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-all duration-500 ease-out focus-visible:outline-none disabled:pointer-events-none w-full overflow-hidden sketch-border",
          "border-2 hover:shadow-md",
          "h-12 px-6 py-3 rounded-lg",
          "hover:transform hover:translate-y-[-1px]",
          disabled && "opacity-60 cursor-not-allowed",
          className
        )}
        style={{
          backgroundColor: 'var(--warm-white)',
          borderColor: 'var(--soft-gray)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = 'var(--medium-gray)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = 'var(--soft-gray)';
        }}
        ref={ref}
        disabled={disabled}
        {...props}
      >
        {/* Soft sketch-style progress fill with animated wave */}
        <div 
          className="absolute inset-1 transition-all duration-700 ease-out rounded-md overflow-hidden"
          style={{ 
            width: `${Math.max(0, progressPercentage - 2)}%`,
          }}
        >
          {/* Animated gradient wave background */}
          {progressPercentage > 0 && (
            <div
              className="absolute inset-0 rounded-md"
              style={{
                background: `linear-gradient(135deg, 
                  rgba(92, 179, 166, 0.15) 0%, 
                  rgba(92, 179, 166, 0.25) 25%,
                  rgba(92, 179, 166, 0.35) 50%,
                  rgba(92, 179, 166, 0.25) 75%, 
                  rgba(92, 179, 166, 0.15) 100%)`,
                backgroundSize: '200% 100%',
                animation: 'gradient-wave 2.5s ease-in-out infinite'
              }}
            />
          )}
          
          {/* Subtle textured overlay for hand-drawn feel */}
          {progressPercentage > 0 && (
            <div 
              className="absolute inset-0 opacity-12 rounded-md"
              style={{
                background: `repeating-linear-gradient(
                  135deg,
                  transparent,
                  transparent 12px,
                  rgba(92, 179, 166, 0.1) 12px,
                  rgba(92, 179, 166, 0.1) 24px
                )`,
                animation: 'gentle-drift 3s ease-in-out infinite'
              }}
            />
          )}
        </div>
        
        {/* Button content with sketch-style text */}
        <span 
          className="relative z-10 font-medium tracking-wide transition-colors duration-300"
          style={{
            color: progressPercentage > 60 ? 'var(--sketch-gray)' : 'var(--soft-charcoal)',
            textShadow: progressPercentage > 60 ? '0 0 2px rgba(255,255,255,0.8)' : 'none'
          }}
        >
          {children}
        </span>
        
        {/* Subtle progress indicator text */}
        {progressPercentage > 0 && progressPercentage < 100 && (
          <span 
            className="absolute top-1 right-2 text-xs opacity-60 font-mono"
            style={{ color: 'var(--medium-gray)' }}
          >
            {Math.round(progressPercentage)}%
          </span>
        )}
      </button>
    )
  }
)

ProgressButton.displayName = "ProgressButton"

export { ProgressButton }
