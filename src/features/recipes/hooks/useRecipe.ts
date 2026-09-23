import { useEffect, useState } from 'react'
import { recipeRepository } from '../api/recipes.repository'
import type { Recipe } from '../types'

interface UseRecipeResult {
  recipe: Recipe | undefined
  loading: boolean
  error: Error | null
}

export function useRecipe(id: string | undefined): UseRecipeResult {
  const [recipe, setRecipe] = useState<Recipe | undefined>(undefined)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!id) {
      setRecipe(undefined)
      setLoading(false)
      return
    }
    let cancelled = false
    setLoading(true)
    recipeRepository
      .getRecipeById(id)
      .then((data) => {
        if (!cancelled) setRecipe(data)
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err : new Error('Failed to load recipe'))
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [id])

  return { recipe, loading, error }
}
