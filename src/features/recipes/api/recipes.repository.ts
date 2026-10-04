import type { Recipe } from '../types'
import { normalizeRecipes } from './normalizeRecipes'
import { localizeRecipe, parseTranslations, type RecipeTranslations } from './recipeTranslations'

export interface RecipeRepository {
  // `language` picks the recipe translation; untranslated text stays in the recipe's own language
  getRecipes(language: string): Promise<Recipe[]>
  getRecipeById(id: string, language: string): Promise<Recipe | undefined>
}

// The language recipes.json is written in: it needs no locale file
const SOURCE_LANGUAGE = 'it'

class JsonRecipeRepository implements RecipeRepository {
  private cache: Promise<Recipe[]> | null = null
  private translationCache = new Map<string, Promise<RecipeTranslations>>()

  private load(): Promise<Recipe[]> {
    if (!this.cache) {
      this.cache = fetch('/data/recipes.json').then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to load recipes: ${response.status}`)
        }
        return response.json()
      }).then(normalizeRecipes)
    }
    return this.cache
  }

  // A missing or broken locale file is not an error: the recipes just stay in Italian.
  // (Hosting answers a missing file with index.html, so a JSON parse failure lands here too.)
  private loadTranslations(language: string): Promise<RecipeTranslations> {
    if (language === SOURCE_LANGUAGE) return Promise.resolve({})
    let translations = this.translationCache.get(language)
    if (!translations) {
      translations = fetch(`/data/locales/${encodeURIComponent(language)}.json`)
        .then((response) => (response.ok ? response.json() : null))
        .then(parseTranslations)
        .catch(() => {
          // Not cached, so a file that failed while offline is retried on the next language switch
          this.translationCache.delete(language)
          return {}
        })
      this.translationCache.set(language, translations)
    }
    return translations
  }

  async getRecipes(language: string): Promise<Recipe[]> {
    const [recipes, translations] = await Promise.all([this.load(), this.loadTranslations(language)])
    return recipes.map((recipe) => localizeRecipe(recipe, translations[recipe.id]))
  }

  async getRecipeById(id: string, language: string): Promise<Recipe | undefined> {
    const [recipes, translations] = await Promise.all([this.load(), this.loadTranslations(language)])
    const recipe = recipes.find((candidate) => candidate.id === id)
    return recipe && localizeRecipe(recipe, translations[recipe.id])
  }
}

export const recipeRepository: RecipeRepository = new JsonRecipeRepository()
