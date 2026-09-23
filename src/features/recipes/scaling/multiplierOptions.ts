export const MULTIPLIER_OPTIONS = [0.25, 0.5, 0.75, 1, 1.5, 2, 2.5, 3] as const

export function formatMultiplierLabel(multiplier: number): string {
  return `${multiplier}x`
}
