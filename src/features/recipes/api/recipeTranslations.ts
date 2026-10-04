import type { CookingMethod, Recipe } from '../types'

// Storage shape of one recipe's entry in public/data/locales/<language>.json. Only text lives here:
// amounts, timers, ingredient refs and cooking settings come from recipes.json and are shared by every
// language. Every field is optional and anything missing falls back to the recipe's own (Italian) text.
export interface RecipeTranslation {
  title?: string
  description?: string
  origin?: string
  category?: string
  notes?: string
  sourceNote?: string
  servingsUnit?: string
  tags?: Record<string, string> // original tag -> translated tag
  groups?: Record<string, string> // group id -> name
  ingredients?: Record<string, { name?: string; substitute?: string }> // ingredient id -> texts
  steps?: Record<string, { title?: string; content?: string }> // step id -> texts; keep the {0003} refs in content
  methods?: Record<string, { label?: string; cookware?: string; heat?: string; rack?: string }> // method id -> texts
}

// recipe id -> translation, for one language
export type RecipeTranslations = Record<string, RecipeTranslation>

type RawObject = Record<string, unknown>

function isObject(value: unknown): value is RawObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function text(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() !== '' ? value : undefined
}

function textRecord(value: unknown): Record<string, string> | undefined {
  if (!isObject(value)) return undefined
  const result: Record<string, string> = {}
  for (const [key, entry] of Object.entries(value)) {
    const entryText = text(entry)
    if (entryText) result[key] = entryText
  }
  return result
}

function objectRecord<K extends string>(value: unknown, fields: K[]): Record<string, Partial<Record<K, string>>> | undefined {
  if (!isObject(value)) return undefined
  const result: Record<string, Partial<Record<K, string>>> = {}
  for (const [key, entry] of Object.entries(value)) {
    if (!isObject(entry)) continue
    const texts: Partial<Record<K, string>> = {}
    for (const field of fields) {
      const fieldText = text(entry[field])
      if (fieldText) texts[field] = fieldText
    }
    result[key] = texts
  }
  return result
}

function parseTranslation(raw: RawObject): RecipeTranslation {
  return {
    title: text(raw.title),
    description: text(raw.description),
    origin: text(raw.origin),
    category: text(raw.category),
    notes: text(raw.notes),
    sourceNote: text(raw.sourceNote),
    servingsUnit: text(raw.servingsUnit),
    tags: textRecord(raw.tags),
    groups: textRecord(raw.groups),
    ingredients: objectRecord(raw.ingredients, ['name', 'substitute']),
    steps: objectRecord(raw.steps, ['title', 'content']),
    methods: objectRecord(raw.methods, ['label', 'cookware', 'heat', 'rack']),
  }
}

// Parses a `{ language, recipes: { [recipeId]: translation } }` locale file.
// Malformed entries are dropped, never thrown on
export function parseTranslations(data: unknown): RecipeTranslations {
  if (!isObject(data) || !isObject(data.recipes)) return {}
  const translations: RecipeTranslations = {}
  for (const [recipeId, entry] of Object.entries(data.recipes)) {
    if (isObject(entry)) translations[recipeId] = parseTranslation(entry)
  }
  return translations
}

function localizeMethod(method: CookingMethod, texts: RecipeTranslation['methods'] = {}): CookingMethod {
  const translated = texts[method.id]
  if (!translated) return method
  const label = translated.label ?? method.label
  switch (method.type) {
    case 'oven':
      return { ...method, label, settings: { ...method.settings, rack: translated.rack ?? method.settings.rack } }
    case 'stovetop':
      return {
        ...method,
        label,
        settings: {
          cookware: translated.cookware ?? method.settings.cookware,
          heat: translated.heat ?? method.settings.heat,
        },
      }
    default:
      return { ...method, label }
  }
}

export function localizeRecipe(recipe: Recipe, translation: RecipeTranslation | undefined): Recipe {
  if (!translation) return recipe

  const { ingredients = {}, steps = {}, groups = {}, tags = {} } = translation
  return {
    ...recipe,
    title: translation.title ?? recipe.title,
    description: translation.description ?? recipe.description,
    origin: translation.origin ?? recipe.origin,
    category: translation.category ?? recipe.category,
    notes: translation.notes ?? recipe.notes,
    source: recipe.source && { ...recipe.source, note: translation.sourceNote ?? recipe.source.note },
    servings: { ...recipe.servings, unit: translation.servingsUnit ?? recipe.servings.unit },
    // Display only: if tag filtering is added, filter on the original (untranslated) tags
    tags: recipe.tags.map((tag) => tags[tag] ?? tag),
    groups: recipe.groups.map((group) => ({
      ...group,
      name: groups[group.id] ?? group.name,
      ingredients: group.ingredients.map((ingredient) => {
        const texts = ingredients[ingredient.id]
        if (!texts) return ingredient
        return {
          ...ingredient,
          name: texts.name ?? ingredient.name,
          ...(ingredient.substitute && {
            substitute: { ...ingredient.substitute, name: texts.substitute ?? ingredient.substitute.name },
          }),
        }
      }),
    })),
    steps: recipe.steps.map((step) => {
      const texts = steps[step.id]
      return texts ? { ...step, title: texts.title ?? step.title, content: texts.content ?? step.content } : step
    }),
    cooking: recipe.cooking && {
      methods: recipe.cooking.methods.map((method) => localizeMethod(method, translation.methods)),
    },
  }
}
