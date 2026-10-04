// Units that only make sense as whole numbers (can't buy 1.5 eggs)
const WHOLE_UNIT_PATTERN = /^(pz|pezzi?|uova?)$/i

export interface QuantityFormat {
  locale: string
  // Display name for a stored unit (e.g. "tsp" -> "cucchiaini"); `count` picks singular/plural
  unitLabel: (unit: string, count: number) => string
  // Shown when an ingredient has no amount, e.g. "q.b."
  asNeeded: string
}

export const DEFAULT_QUANTITY_FORMAT: QuantityFormat = {
  locale: 'it-IT',
  unitLabel: (unit) => unit,
  asNeeded: 'q.b.',
}

export function formatQuantity(
  amount: number | null,
  unit: string | null,
  multiplier = 1,
  format: QuantityFormat = DEFAULT_QUANTITY_FORMAT,
): string {
  if (amount === null) return format.asNeeded
  const unitKey = unit?.trim() ?? ''
  const scaled = amount * multiplier
  const rounded = WHOLE_UNIT_PATTERN.test(unitKey) ? Math.max(1, Math.round(scaled)) : Math.round(scaled * 100) / 100
  const formatted = rounded.toLocaleString(format.locale, { maximumFractionDigits: 2 })
  return unitKey ? `${formatted} ${format.unitLabel(unitKey, rounded)}` : formatted
}
