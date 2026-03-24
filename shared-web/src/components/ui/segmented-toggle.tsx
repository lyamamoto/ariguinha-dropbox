import { cn } from "../../lib/utils"

export interface SegmentedToggleOption<T extends string> {
  value: T
  label: string
}

export interface SegmentedToggleProps<T extends string> {
  options: SegmentedToggleOption<T>[]
  value: T
  onChange: (value: T) => void
  disabled?: boolean
  className?: string
}

export function SegmentedToggle<T extends string>({
  options,
  value,
  onChange,
  disabled = false,
  className,
}: SegmentedToggleProps<T>) {
  return (
    <div
      className={cn(
        "flex rounded-lg border border-border overflow-hidden",
        className
      )}
    >
      {options.map((option, index) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          disabled={disabled}
          className={cn(
            "px-3 py-1 text-xs font-medium transition-colors",
            index > 0 && "border-l border-border",
            value === option.value
              ? "bg-primary text-primary-foreground"
              : "bg-muted/50 text-muted-foreground hover:bg-muted"
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
