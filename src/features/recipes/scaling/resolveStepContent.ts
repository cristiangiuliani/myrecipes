import type { Ingredient, RecipeStep } from '../types'
import { formatQuantity } from './formatQuantity'

// Replaces "{0003}"-style ingredient refs in step text with the formatted quantity, e.g. "(25 g)"
export function resolveStepContent(
  step: RecipeStep,
  ingredientsById: Map<string, Ingredient>,
  multiplier = 1,
): string {
  return step.content.replace(/\{(\w+)\}/g, (match, id: string) => {
    const ingredient = ingredientsById.get(id)
    if (!ingredient) return match
    return formatQuantity(ingredient.amount, ingredient.unit, multiplier)
  })
}
