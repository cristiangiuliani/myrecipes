import { Link as RouterLink } from 'react-router-dom'
import Card from '@mui/material/Card'
import CardActionArea from '@mui/material/CardActionArea'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import { formatMinutes } from '@/shared/lib/duration'
import type { Recipe } from '../types'

interface RecipeCardProps {
  recipe: Recipe
}

export function RecipeCard({ recipe }: RecipeCardProps) {
  const totalTime = formatMinutes(recipe.totalTimeMinutes)

  return (
    <Card variant="outlined" sx={{ height: '100%' }}>
      <CardActionArea component={RouterLink} to={`/recipes/${recipe.id}`} sx={{ height: '100%', alignItems: 'stretch' }}>
        <CardContent>
          <Stack spacing={1.5}>
            <Stack direction="row" spacing={1} useFlexGap sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
              <Chip label={recipe.category} size="small" color="primary" variant="outlined" />
              <Typography variant="body2" color="text.secondary">
                {recipe.origin}
              </Typography>
            </Stack>

            <Typography variant="h6" component="h2">
              {recipe.title}
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {recipe.description}
            </Typography>

            <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
              {totalTime && (
                <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center', color: 'text.secondary' }}>
                  <AccessTimeIcon fontSize="small" />
                  <Typography variant="body2">{totalTime}</Typography>
                </Stack>
              )}
              <Typography variant="body2" color="text.secondary">
                {recipe.servings.amount} {recipe.servings.unit}
              </Typography>
            </Stack>

            <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
              {recipe.tags.slice(0, 4).map((tag) => (
                <Chip key={tag} label={tag} size="small" />
              ))}
            </Stack>
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  )
}
