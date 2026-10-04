import { useEffect, useState } from 'react'
import { recipeRepository } from '../api/recipes.repository'
import { useLanguage } from '@/shared/i18n'
import type { Recipe } from '../types'

interface UseRecipeResult {
  recipe: Recipe | undefined
  loading: boolean
  error: Error | null
}

export function useRecipe(id: string | undefined): UseRecipeResult {
  const language = useLanguage()
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
      .getRecipeById(id, language)
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
  }, [id, language])

  return { recipe, loading, error }
}
