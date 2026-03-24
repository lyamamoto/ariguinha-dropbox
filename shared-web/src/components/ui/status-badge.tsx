const defaultColorMap: Record<string, string> = {
  // Positive
  Filled: "bg-trade-positive/15 text-trade-positive",
  Accepted: "bg-trade-positive/15 text-trade-positive",
  Complete: "bg-trade-positive/15 text-trade-positive",
  Confirmed: "bg-trade-positive/15 text-trade-positive",

  // Warning
  PartiallyFilled: "bg-yellow-500/15 text-yellow-400",
  Pending: "bg-yellow-500/15 text-yellow-400",
  PendingLiquidityProviderAck: "bg-yellow-500/15 text-yellow-400",

  // Primary (in-progress)
  New: "bg-primary/15 text-primary",
  Submitted: "bg-primary/15 text-primary",

  // Destructive
  Rejected: "bg-destructive/15 text-destructive",
  Failed: "bg-destructive/15 text-destructive",
  Cancelled: "bg-destructive/15 text-destructive",
  Expired: "bg-destructive/15 text-destructive",
}

const fallbackColor = "bg-muted text-muted-foreground"

export interface StatusBadgeProps {
  status: string
  colorMap?: Record<string, string>
}

export function StatusBadge({ status, colorMap }: StatusBadgeProps) {
  const map = colorMap ?? defaultColorMap
  const cls = map[status] ?? fallbackColor

  return (
    <span className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-medium ${cls}`}>
      {status}
    </span>
  )
}
