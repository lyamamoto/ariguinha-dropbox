import { formatNum } from "../../lib/format"

export interface PnLCellProps {
  value: number
  decimals?: number
}

export function PnLCell({ value, decimals = 2 }: PnLCellProps) {
  if (value === 0) return <span className="text-muted-foreground">—</span>
  const cls = value > 0 ? "text-trade-positive" : "text-trade-negative"
  const prefix = value > 0 ? "+" : ""
  return (
    <span className={`tabular-nums ${cls}`}>
      {prefix}{formatNum(value, decimals)}
    </span>
  )
}
