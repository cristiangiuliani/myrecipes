export interface IngredientSubstitute {
  name: string
  amount: number
  unit: string
}

export interface Ingredient {
  id: string
  name: string
  amount: number
  unit: string
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
}

export interface Servings {
  amount: number
  unit: string
}

export interface OvenInfo {
  temperatureCelsius: number | null
  temperatureCelsiusFan: number | null
  rack: string | null
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
  oven?: OvenInfo
  notes?: string
  source?: RecipeSource
}
