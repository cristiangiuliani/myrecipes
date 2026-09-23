export function formatMinutes(minutes: number | null | undefined): string | null {
  if (minutes === null || minutes === undefined) return null
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  return rest === 0 ? `${hours} h` : `${hours} h ${rest} min`
}

export function formatSeconds(seconds: number | null | undefined): string | null {
  if (seconds === null || seconds === undefined) return null
  return formatMinutes(Math.round(seconds / 60))
}
