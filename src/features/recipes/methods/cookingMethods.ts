import type { AirfryerSettings, CookingMethod, OvenSettings, RecipeStep, StovetopSettings } from '../types'

export function getDefaultMethod(methods: CookingMethod[]): CookingMethod | undefined {
  return methods.find((method) => method.default) ?? methods[0]
}

// Falls back to the default when the id is unknown (e.g. left over from another recipe)
export function resolveSelectedMethod(methods: CookingMethod[], selectedId: string | null): CookingMethod | undefined {
  return methods.find((method) => method.id === selectedId) ?? getDefaultMethod(methods)
}

// Steps without `methods` always apply; with no method selected (recipe has no cooking info) nothing is filtered out
export function filterStepsByMethod(steps: RecipeStep[], methodId: string | undefined): RecipeStep[] {
  if (!methodId) return steps
  return steps.filter((step) => !step.methods || step.methods.includes(methodId))
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1)
}

function joinParts(head: string, details: (string | null)[]): string {
  return [head, ...details.filter((part): part is string => !!part)].join(', ')
}

// e.g. "Forno statico 200°C (180°C ventilato), ripiano centrale"
function describeOven({ temperatureCelsius, temperatureCelsiusFan, mode, rack }: OvenSettings): string {
  let head = mode ? `Forno ${mode}` : 'Forno'
  if (mode === 'ventilato') {
    const temperature = temperatureCelsiusFan ?? temperatureCelsius
    if (temperature !== null) head += ` ${temperature}°C`
  } else if (temperatureCelsius !== null) {
    head += ` ${temperatureCelsius}°C`
    if (temperatureCelsiusFan !== null) head += ` (${temperatureCelsiusFan}°C ventilato)`
  } else if (temperatureCelsiusFan !== null) {
    head += ` ${temperatureCelsiusFan}°C ventilato`
  }
  return joinParts(head, [rack ? `ripiano ${rack}` : null])
}

// e.g. "Padella, fuoco medio-alto"
function describeStovetop({ cookware, heat }: StovetopSettings): string {
  if (!cookware) return heat ? `Fornello, fuoco ${heat}` : 'Fornello'
  return joinParts(capitalize(cookware), [heat ? `fuoco ${heat}` : null])
}

// e.g. "Friggitrice ad aria 180°C, preriscaldata"
function describeAirfryer({ temperatureCelsius, preheat }: AirfryerSettings): string {
  const head = temperatureCelsius !== null ? `Friggitrice ad aria ${temperatureCelsius}°C` : 'Friggitrice ad aria'
  const preheatText = preheat === true ? 'preriscaldata' : preheat === false ? 'senza preriscaldare' : null
  return joinParts(head, [preheatText])
}

export function describeCookingMethod(method: CookingMethod): string {
  switch (method.type) {
    case 'oven':
      return describeOven(method.settings)
    case 'stovetop':
      return describeStovetop(method.settings)
    case 'airfryer':
      return describeAirfryer(method.settings)
    case 'other':
      return method.label
  }
}
