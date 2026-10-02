import type {
  Cooking,
  CookingMethod,
  OvenMode,
  OvenSettings,
  Recipe,
  RecipeStep,
} from '../types'

// Turns raw stored data into the app's Recipe shape. Everything here is defensive:
// malformed cooking data degrades to "no cooking section" instead of throwing.

type RawObject = Record<string, unknown>

const OVEN_MODES: OvenMode[] = ['statico', 'ventilato', 'grill']

const DEFAULT_LABELS: Record<string, string> = {
  oven: 'Forno',
  stovetop: 'Fornello',
  airfryer: 'Friggitrice ad aria',
}

function isObject(value: unknown): value is RawObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function numberOrNull(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

function stringOrNull(value: unknown): string | null {
  if (typeof value === 'number') return String(value)
  return typeof value === 'string' && value.trim() !== '' ? value : null
}

function booleanOrNull(value: unknown): boolean | null {
  return typeof value === 'boolean' ? value : null
}

function ovenSettings(raw: RawObject): OvenSettings {
  const mode = raw.mode
  return {
    temperatureCelsius: numberOrNull(raw.temperatureCelsius),
    temperatureCelsiusFan: numberOrNull(raw.temperatureCelsiusFan),
    mode: OVEN_MODES.includes(mode as OvenMode) ? (mode as OvenMode) : null,
    rack: stringOrNull(raw.rack),
  }
}

function parseMethod(raw: unknown, index: number): CookingMethod | null {
  if (!isObject(raw)) return null
  const type = stringOrNull(raw.type)
  if (!type) return null
  const settings = isObject(raw.settings) ? raw.settings : {}
  const base = {
    id: stringOrNull(raw.id) ?? `${type}-${index}`,
    label: stringOrNull(raw.label) ?? DEFAULT_LABELS[type] ?? type,
    default: raw.default === true,
  }
  switch (type) {
    case 'oven':
      return { ...base, type, settings: ovenSettings(settings) }
    case 'stovetop':
      return {
        ...base,
        type,
        settings: { cookware: stringOrNull(settings.cookware), heat: stringOrNull(settings.heat) },
      }
    case 'airfryer':
      return {
        ...base,
        type,
        settings: {
          temperatureCelsius: numberOrNull(settings.temperatureCelsius),
          preheat: booleanOrNull(settings.preheat),
        },
      }
    default:
      return { ...base, type: 'other', sourceType: type }
  }
}

function parseCooking(raw: unknown): CookingMethod[] {
  if (!isObject(raw) || !Array.isArray(raw.methods)) return []
  const seenIds = new Set<string>()
  const methods: CookingMethod[] = []
  raw.methods.forEach((entry, index) => {
    const method = parseMethod(entry, index)
    if (method && !seenIds.has(method.id)) {
      seenIds.add(method.id)
      methods.push(method)
    }
  })
  return methods
}

// Recipes saved before multi-method cooking had a single `oven` object
function fromLegacyOven(raw: unknown): CookingMethod[] {
  if (!isObject(raw)) return []
  return [{ id: 'oven', type: 'oven', label: 'Forno', default: true, settings: ovenSettings(raw) }]
}

function normalizeCooking(raw: RawObject): Cooking | undefined {
  let methods = parseCooking(raw.cooking)
  if (methods.length === 0) methods = fromLegacyOven(raw.oven)
  if (methods.length === 0) return undefined

  // Exactly one default: the first one flagged, or the first method if none is
  const defaultIndex = Math.max(
    methods.findIndex((method) => method.default),
    0,
  )
  return { methods: methods.map((method, index) => ({ ...method, default: index === defaultIndex })) }
}

function normalizeStep(raw: RecipeStep): RecipeStep {
  const { methods, ...step } = raw as RecipeStep & { methods?: unknown }
  if (!Array.isArray(methods)) return step
  return { ...step, methods: methods.filter((id): id is string => typeof id === 'string') }
}

function normalizeRecipe(raw: RawObject): Recipe {
  const recipe = { ...raw } as unknown as Recipe & { oven?: unknown }
  delete recipe.oven
  return {
    ...recipe,
    steps: Array.isArray(recipe.steps) ? recipe.steps.map(normalizeStep) : [],
    cooking: normalizeCooking(raw),
  }
}

// Accepts both the bare array and the `{ updatedAt, recipes }` envelope
export function normalizeRecipes(data: unknown): Recipe[] {
  const list = Array.isArray(data) ? data : isObject(data) && Array.isArray(data.recipes) ? data.recipes : []
  return list.filter(isObject).map(normalizeRecipe)
}
