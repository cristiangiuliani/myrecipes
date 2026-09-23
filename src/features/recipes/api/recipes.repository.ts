import type { Recipe } from '../types'

export interface RecipeRepository {
  getRecipes(): Promise<Recipe[]>
  getRecipeById(id: string): Promise<Recipe | undefined>
}

class JsonRecipeRepository implements RecipeRepository {
  private cache: Promise<Recipe[]> | null = null

  private load(): Promise<Recipe[]> {
    if (!this.cache) {
      this.cache = fetch('/data/recipes.json').then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to load recipes: ${response.status}`)
        }
        return response.json() as Promise<Recipe[]>
      })
    }
    return this.cache
  }

  getRecipes(): Promise<Recipe[]> {
    return this.load()
  }

  async getRecipeById(id: string): Promise<Recipe | undefined> {
    const recipes = await this.load()
    return recipes.find((recipe) => recipe.id === id)
  }
}

export const recipeRepository: RecipeRepository = new JsonRecipeRepository()
