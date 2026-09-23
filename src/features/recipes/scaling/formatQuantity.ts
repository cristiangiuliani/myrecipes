export function formatQuantity(amount: number, unit: string): string {
  const rounded = Math.round(amount * 100) / 100
  const formatted = rounded.toLocaleString('it-IT', { maximumFractionDigits: 2 })
  return unit ? `${formatted} ${unit}` : formatted
}
