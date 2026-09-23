import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { useRecipes } from '../hooks/useRecipes'
import { RecipeList } from '../components/RecipeList'

export function RecipeListPage() {
  const { recipes, loading, error } = useRecipes()

  if (loading) {
    return (
      <Stack sx={{ alignItems: 'center', py: 8 }}>
        <CircularProgress />
      </Stack>
    )
  }

  if (error) {
    return <Alert severity="error">Impossibile caricare le ricette: {error.message}</Alert>
  }

  return (
    <Stack spacing={3}>
      <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
        Ricette
      </Typography>
      <RecipeList recipes={recipes} />
    </Stack>
  )
}
