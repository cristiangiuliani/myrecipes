import type { Ingredient, Recipe } from '../types'

export function getIngredientsById(recipe: Recipe): Map<string, Ingredient> {
  const map = new Map<string, Ingredient>()
  for (const group of recipe.groups) {
    for (const ingredient of group.ingredients) {
      map.set(ingredient.id, ingredient)
    }
  }
  return map
}
