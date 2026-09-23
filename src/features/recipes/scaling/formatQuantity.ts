// Units that only make sense as whole numbers (can't buy 1.5 eggs)
const WHOLE_UNIT_PATTERN = /^(pz|pezzi?|uova?)$/i

export function formatQuantity(amount: number, unit: string, multiplier = 1): string {
  const scaled = amount * multiplier
  const rounded = WHOLE_UNIT_PATTERN.test(unit.trim())
    ? Math.max(1, Math.round(scaled))
    : Math.round(scaled * 100) / 100
  const formatted = rounded.toLocaleString('it-IT', { maximumFractionDigits: 2 })
  return unit ? `${formatted} ${unit}` : formatted
}
