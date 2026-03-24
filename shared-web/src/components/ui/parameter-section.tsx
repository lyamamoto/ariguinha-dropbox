import type { ReactNode } from "react"
import { cn } from "../../lib/utils"
import type { LucideIcon } from "lucide-react"

export interface ParameterSectionProps {
  icon: LucideIcon
  title: string
  tooltip: string
  infoText: ReactNode
  disabled?: boolean
  children: ReactNode
  className?: string
}

export function ParameterSection({
  icon: Icon,
  title,
  tooltip,
  infoText,
  disabled = false,
  children,
  className,
}: ParameterSectionProps) {
  return (
    <div
      className={cn(
        "space-y-4 p-4 rounded-lg",
        "bg-primary/5 border border-primary/20",
        disabled && "opacity-50",
        className
      )}
    >
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-primary" />
        <h4 className="text-sm font-medium">{title}</h4>
        <div className="relative group">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 text-muted-foreground cursor-help"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 16v-4" />
            <path d="M12 8h.01" />
          </svg>
          <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-2 text-xs text-popover-foreground bg-popover border border-border rounded-lg shadow-lg w-64 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
            {tooltip}
          </div>
        </div>
      </div>

      {children}

      <div className="text-xs text-muted-foreground bg-muted/30 p-2 rounded">
        {infoText}
      </div>
    </div>
  )
}
