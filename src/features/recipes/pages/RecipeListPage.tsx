import { useTranslation } from 'react-i18next'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useRecipes } from '../hooks/useRecipes'
import { RecipeList } from '../components/RecipeList'

export function RecipeListPage() {
  const { t } = useTranslation()
  const { recipes, loading, error } = useRecipes()

  // Spinner only on first load: a language switch re-fetches while the current list stays visible
  if (loading && recipes.length === 0) {
    return (
      <Stack sx={{ alignItems: 'center', py: 8 }}>
        <CircularProgress />
      </Stack>
    )
  }

  if (error) {
    return <Alert severity="error">{t('list.loadError', { message: error.message })}</Alert>
  }

  return (
    <Stack spacing={3}>
      <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
        {t('list.title')}
      </Typography>
      <RecipeList recipes={recipes} />
    </Stack>
  )
}
