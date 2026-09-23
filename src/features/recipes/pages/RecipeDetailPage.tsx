import { useParams } from 'react-router-dom'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import { useRecipe } from '../hooks/useRecipe'
import { RecipeDetail } from '../components/RecipeDetail'

export function RecipeDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { recipe, loading, error } = useRecipe(id)

  if (loading) {
    return (
      <Stack sx={{ alignItems: 'center', py: 8 }}>
        <CircularProgress />
      </Stack>
    )
  }

  if (error) {
    return <Alert severity="error">Impossibile caricare la ricetta: {error.message}</Alert>
  }

  if (!recipe) {
    return <Alert severity="warning">Ricetta non trovata.</Alert>
  }

  return <RecipeDetail recipe={recipe} />
}
