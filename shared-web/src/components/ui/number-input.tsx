import * as React from "react"
import { cn } from "../../lib/utils"
import { AlertCircle } from "lucide-react"

type NumberInputSize = "default" | "sm"

export interface NumberInputProps {
  label: string
  value: string | number
  onChange: (value: string) => void
  onBlur?: () => void
  step?: number | string
  min?: number | string
  max?: number | string
  placeholder?: string
  helperText?: string
  rightLabel?: string
  size?: NumberInputSize
  error?: string | null
  disabled?: boolean
  className?: string
}

const NumberInput = React.forwardRef<HTMLInputElement, NumberInputProps>(
  (
    {
      label,
      value,
      onChange,
      onBlur,
      step,
      min,
      max,
      placeholder,
      helperText,
      rightLabel,
      size = "default",
      error,
      disabled = false,
      className,
    },
    ref
  ) => {
    const isSmall = size === "sm"

    return (
      <div className={className}>
        <div
          className={cn(
            "flex items-center justify-between",
            isSmall ? "mb-1" : "mb-1.5"
          )}
        >
          <label
            className={cn(
              "block font-medium text-muted-foreground",
              isSmall ? "text-xs" : "text-sm"
            )}
          >
            {label}
          </label>
          {rightLabel && (
            <span className="text-xs text-muted-foreground">{rightLabel}</span>
          )}
        </div>

        <div className="relative">
          <input
            ref={ref}
            type="number"
            step={step ?? "any"}
            min={min}
            max={max}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onBlur={onBlur}
            placeholder={placeholder}
            disabled={disabled}
            className={cn(
              "w-full px-3 rounded-lg",
              "bg-muted/50 border",
              "focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent",
              "placeholder:text-muted-foreground/60",
              isSmall ? "py-1.5 text-sm" : "py-2",
              error
                ? "border-destructive focus:ring-destructive/50"
                : "border-border",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          />
          {error && (
            <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-destructive" />
          )}
        </div>

        {error ? (
          <p className="mt-1 text-xs text-destructive flex items-center gap-1">
            {error}
          </p>
        ) : helperText ? (
          <p className="mt-1 text-xs text-muted-foreground">{helperText}</p>
        ) : null}
      </div>
    )
  }
)
NumberInput.displayName = "NumberInput"

export { NumberInput }
