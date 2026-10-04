import { useEffect, useState } from 'react'
import { recipeRepository } from '../api/recipes.repository'
import { useLanguage } from '@/shared/i18n'
import type { Recipe } from '../types'

interface UseRecipesResult {
  recipes: Recipe[]
  loading: boolean
  error: Error | null
}

export function useRecipes(): UseRecipesResult {
  const language = useLanguage()
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    recipeRepository
      .getRecipes(language)
      .then((data) => {
        if (!cancelled) setRecipes(data)
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err : new Error('Failed to load recipes'))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [language])

  return { recipes, loading, error }
}
