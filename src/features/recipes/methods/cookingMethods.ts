import type { TFunction } from 'i18next'
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

// Only plain values ("padella", "medio-alto") are looked up; free text ("padella o piastra di ferro") is shown as written
const VALUE_KEY_PATTERN = /^[\p{L}\d-]+$/u

function translateValue(t: TFunction, group: 'rackValues' | 'heatValues' | 'cookwareValues', value: string): string {
  return VALUE_KEY_PATTERN.test(value) ? t(`cooking.${group}.${value}`, { defaultValue: value }) : value
}

// e.g. "Forno statico 200°C (180°C ventilato), ripiano centrale"
function describeOven({ temperatureCelsius, temperatureCelsiusFan, mode, rack }: OvenSettings, t: TFunction): string {
  let head = t(`cooking.oven.${mode ?? 'plain'}`)
  if (mode === 'ventilato') {
    const temperature = temperatureCelsiusFan ?? temperatureCelsius
    if (temperature !== null) head += ` ${t('cooking.temperature', { value: temperature })}`
  } else if (temperatureCelsius !== null) {
    head += ` ${t('cooking.temperature', { value: temperatureCelsius })}`
    if (temperatureCelsiusFan !== null) head += ` ${t('cooking.fanTemperature', { value: temperatureCelsiusFan })}`
  } else if (temperatureCelsiusFan !== null) {
    head += ` ${t('cooking.fanOnly', { value: temperatureCelsiusFan })}`
  }
  return joinParts(head, [rack ? t('cooking.rack', { rack: translateValue(t, 'rackValues', rack) }) : null])
}

// e.g. "Padella, fuoco medio-alto"
function describeStovetop({ cookware, heat }: StovetopSettings, t: TFunction): string {
  const heatText = heat ? t('cooking.heat', { heat: translateValue(t, 'heatValues', heat) }) : null
  const head = cookware ? capitalize(translateValue(t, 'cookwareValues', cookware)) : t('cooking.stovetop')
  return joinParts(head, [heatText])
}

// e.g. "Friggitrice ad aria 180°C, preriscaldata"
function describeAirfryer({ temperatureCelsius, preheat }: AirfryerSettings, t: TFunction): string {
  let head = t('cooking.airfryer')
  if (temperatureCelsius !== null) head += ` ${t('cooking.temperature', { value: temperatureCelsius })}`
  const preheatText = preheat === true ? t('cooking.preheated') : preheat === false ? t('cooking.notPreheated') : null
  return joinParts(head, [preheatText])
}

// `t` comes from the UI layer, so this stays a pure function of its inputs
export function describeCookingMethod(method: CookingMethod, t: TFunction): string {
  switch (method.type) {
    case 'oven':
      return describeOven(method.settings, t)
    case 'stovetop':
      return describeStovetop(method.settings, t)
    case 'airfryer':
      return describeAirfryer(method.settings, t)
    case 'other':
      return method.label
  }
}
