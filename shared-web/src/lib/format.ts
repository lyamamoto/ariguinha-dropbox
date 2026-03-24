export function formatNum(n: number | undefined | null, decimals = 2): string {
  if (n == null) return "—"
  return n.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

export function formatPrice(n: number | undefined | null, decimals = 2): string {
  return formatNum(n, decimals)
}

export function formatQuantity(n: number | undefined | null): string {
  if (n == null) return "—"
  return n >= 1
    ? n.toLocaleString("en-US", { minimumFractionDigits: 4, maximumFractionDigits: 4 })
    : n.toFixed(6)
}

export function formatTime(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  })
}

export function formatPercent(n: number, decimals = 2): string {
  const prefix = n > 0 ? "+" : ""
  return `${prefix}${n.toFixed(decimals)}%`
}
