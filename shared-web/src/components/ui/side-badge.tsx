export interface SideBadgeProps {
  side: string
  variant?: "text" | "badge"
}

const buyLikeValues = new Set(["Buy", "Long"])

export function SideBadge({ side, variant = "text" }: SideBadgeProps) {
  const isPositive = buyLikeValues.has(side)

  if (variant === "badge") {
    const cls = isPositive
      ? "bg-trade-positive/15 text-trade-positive"
      : "bg-trade-negative/15 text-trade-negative"
    return (
      <span className={`inline-block rounded px-1.5 py-0.5 text-[10px] font-medium ${cls}`}>
        {side}
      </span>
    )
  }

  return (
    <span
      className={`font-semibold text-[11px] ${
        isPositive ? "text-trade-positive" : "text-trade-negative"
      }`}
    >
      {side}
    </span>
  )
}
