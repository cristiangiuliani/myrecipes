import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import { useRecipe } from '../hooks/useRecipe'
import { RecipeDetail } from '../components/RecipeDetail'

export function RecipeDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation()
  const { recipe, loading, error } = useRecipe(id)

  // Spinner only on first load: a language switch must not unmount the page (it would reset running timers)
  if (loading && !recipe) {
    return (
      <Stack sx={{ alignItems: 'center', py: 8 }}>
        <CircularProgress />
      </Stack>
    )
  }

  if (error) {
    return <Alert severity="error">{t('detail.loadError', { message: error.message })}</Alert>
  }

  if (!recipe) {
    return <Alert severity="warning">{t('detail.notFound')}</Alert>
  }

  return <RecipeDetail recipe={recipe} />
}
