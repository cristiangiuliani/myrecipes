import { useState } from 'react'
import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Divider from '@mui/material/Divider'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import Stack from '@mui/material/Stack'
import Step from '@mui/material/Step'
import StepContent from '@mui/material/StepContent'
import StepLabel from '@mui/material/StepLabel'
import Stepper from '@mui/material/Stepper'
import Typography from '@mui/material/Typography'
import AccessTimeIcon from '@mui/icons-material/AccessTime'
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment'
import RestaurantIcon from '@mui/icons-material/Restaurant'
import { formatMinutes, formatSeconds } from '@/shared/lib/duration'
import type { Recipe } from '../types'
import { getIngredientsById } from '../scaling/ingredientLookup'
import { resolveStepContent } from '../scaling/resolveStepContent'
import { formatQuantity } from '../scaling/formatQuantity'
import { ServingsMultiplier } from './ServingsMultiplier'

interface RecipeDetailProps {
  recipe: Recipe
}

export function RecipeDetail({ recipe }: RecipeDetailProps) {
  const [multiplier, setMultiplier] = useState(1)
  const ingredientsById = getIngredientsById(recipe)

  const timeInfo = [
    { label: 'Preparazione', minutes: recipe.prepTimeMinutes },
    { label: 'Riposo', minutes: recipe.restTimeMinutes },
    { label: 'Cottura', minutes: recipe.cookTimeMinutes },
    { label: 'Totale', minutes: recipe.totalTimeMinutes },
  ].filter((item) => item.minutes !== null && item.minutes !== undefined)

  return (
    <Stack spacing={4}>
      <Stack spacing={1.5}>
        <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
          <Chip label={recipe.category} color="primary" size="small" />
          <Chip label={recipe.origin} size="small" variant="outlined" />
          {recipe.tags.map((tag) => (
            <Chip key={tag} label={tag} size="small" variant="outlined" />
          ))}
        </Stack>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
          {recipe.title}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {recipe.description}
        </Typography>
      </Stack>

      <Stack direction="row" spacing={3} useFlexGap sx={{ flexWrap: 'wrap' }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <RestaurantIcon fontSize="small" color="action" />
          <Typography variant="body2">{formatQuantity(recipe.servings.amount, recipe.servings.unit, multiplier)}</Typography>
        </Stack>
        {timeInfo.map((item) => (
          <Stack key={item.label} direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <AccessTimeIcon fontSize="small" color="action" />
            <Typography variant="body2">
              {item.label}: {formatMinutes(item.minutes)}
            </Typography>
          </Stack>
        ))}
        {recipe.oven && (
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <LocalFireDepartmentIcon fontSize="small" color="action" />
            <Typography variant="body2">
              Forno: {recipe.oven.temperatureCelsius}°C
              {recipe.oven.temperatureCelsiusFan ? ` (${recipe.oven.temperatureCelsiusFan}°C ventilato)` : ''}
              {recipe.oven.rack ? ` · ripiano ${recipe.oven.rack}` : ''}
            </Typography>
          </Stack>
        )}
      </Stack>

      <Divider />

      <Stack spacing={3}>
        <Stack direction="row" sx={{ alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="h5" component="h2">
            Ingredienti
          </Typography>
          <ServingsMultiplier value={multiplier} onChange={setMultiplier} />
        </Stack>
        {recipe.groups.map((group) =>
          group.ingredients.length === 0 ? null : (
            <Box key={group.id}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                {group.name}
              </Typography>
              <List dense disablePadding>
                {group.ingredients.map((ingredient) => (
                  <ListItem key={ingredient.id} disableGutters>
                    <ListItemText
                      primary={`${formatQuantity(ingredient.amount, ingredient.unit, multiplier)} ${ingredient.name}`}
                      secondary={
                        [
                          ingredient.optional ? 'opzionale' : null,
                          ingredient.substitute
                            ? `sostituto: ${formatQuantity(ingredient.substitute.amount, ingredient.substitute.unit, multiplier)} ${ingredient.substitute.name}`
                            : null,
                        ]
                          .filter(Boolean)
                          .join(' · ') || undefined
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          ),
        )}
      </Stack>

      <Divider />

      <Stack spacing={2}>
        <Typography variant="h5" component="h2">
          Preparazione
        </Typography>
        <Stepper orientation="vertical" nonLinear>
          {recipe.steps.map((step) => (
            <Step key={step.id} active expanded>
              <StepLabel>{step.title}</StepLabel>
              <StepContent>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  {resolveStepContent(step, ingredientsById, multiplier)}
                </Typography>
                {step.timerSeconds && (
                  <Chip icon={<AccessTimeIcon />} label={formatSeconds(step.timerSeconds)} size="small" variant="outlined" />
                )}
              </StepContent>
            </Step>
          ))}
        </Stepper>
      </Stack>

      {recipe.notes && (
        <>
          <Divider />
          <Stack spacing={1}>
            <Typography variant="h5" component="h2">
              Note
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {recipe.notes}
            </Typography>
          </Stack>
        </>
      )}

      {recipe.source?.originalUrl && (
        <Typography variant="caption" color="text.secondary">
          Fonte:{' '}
          <a href={recipe.source.originalUrl} target="_blank" rel="noreferrer">
            {recipe.source.originalUrl}
          </a>
          {recipe.source.note ? ` — ${recipe.source.note}` : ''}
        </Typography>
      )}
    </Stack>
  )
}
