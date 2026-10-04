export interface IngredientSubstitute {
  name: string
  amount: number
  unit: string
}

export interface Ingredient {
  id: string
  name: string
  // null for "as much as needed" (q.b.)
  amount: number | null
  unit: string | null
  optional?: boolean
  substitute?: IngredientSubstitute
}

export interface IngredientGroup {
  id: string
  name: string
  ingredients: Ingredient[]
}

export interface RecipeStep {
  id: string
  group: string
  title: string
  content: string
  ingredientRefs: string[]
  timerSeconds: number | null
  // Ids of the cooking methods this step belongs to; absent means the step applies to every method
  methods?: string[]
}

export interface Servings {
  amount: number
  unit: string
}

export type OvenMode = 'statico' | 'ventilato' | 'grill'

export interface OvenSettings {
  temperatureCelsius: number | null
  temperatureCelsiusFan: number | null
  mode: OvenMode | null
  rack: string | null
}

export interface StovetopSettings {
  cookware: string | null
  heat: string | null
}

export interface AirfryerSettings {
  temperatureCelsius: number | null
  preheat: boolean | null
}

interface CookingMethodBase {
  id: string
  label: string
  default: boolean
}

export interface OvenMethod extends CookingMethodBase {
  type: 'oven'
  settings: OvenSettings
}

export interface StovetopMethod extends CookingMethodBase {
  type: 'stovetop'
  settings: StovetopSettings
}

export interface AirfryerMethod extends CookingMethodBase {
  type: 'airfryer'
  settings: AirfryerSettings
}

// A method type the app doesn't know yet (grill, steam, ...): shown by label only
export interface OtherMethod extends CookingMethodBase {
  type: 'other'
  sourceType: string
}

export type CookingMethod = OvenMethod | StovetopMethod | AirfryerMethod | OtherMethod
export type CookingMethodType = CookingMethod['type']

export interface Cooking {
  // Never empty, and exactly one method has default: true (guaranteed by the data layer)
  methods: CookingMethod[]
}

export interface RecipeSource {
  type: string
  originalUrl: string | null
  note?: string
}

export interface Recipe {
  id: string
  title: string
  description: string
  origin: string
  category: string
  tags: string[]
  servings: Servings
  prepTimeMinutes: number | null
  restTimeMinutes: number | null
  cookTimeMinutes: number | null
  totalTimeMinutes: number | null
  groups: IngredientGroup[]
  steps: RecipeStep[]
  cooking?: Cooking
  notes?: string
  source?: RecipeSource
  // Photo location resolved by the data layer; the file may not exist yet
  imageUrl: string
}
