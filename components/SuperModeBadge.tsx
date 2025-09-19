interface SuperModeBadgeProps {
  className?: string;
}

export function SuperModeBadge({ className = "" }: SuperModeBadgeProps) {
  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 ${className}`}>
      Super Mode
    </span>
  );
}
