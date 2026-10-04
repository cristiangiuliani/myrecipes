import { useState, type KeyboardEvent } from 'react'
import { useTranslation } from 'react-i18next'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import IconButton from '@mui/material/IconButton'
import LinearProgress from '@mui/material/LinearProgress'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import CheckIcon from '@mui/icons-material/Check'
import CloseIcon from '@mui/icons-material/Close'
import TimerIcon from '@mui/icons-material/Timer'
import { formatClock } from '@/shared/lib/duration'
import type { Recipe, RecipeStep } from '../types'
import { getIngredientsById } from '../scaling/ingredientLookup'
import { resolveStepContent } from '../scaling/resolveStepContent'
import { useQuantityFormat } from '../scaling/useQuantityFormat'
import { getRemainingMs } from '../cooking/timer'
import { useStepTimers } from '../cooking/useStepTimers'
import { useWakeLock } from '../cooking/useWakeLock'
import { playAlarm, primeAlarm } from '../cooking/alarm'
import { StepTimer } from './StepTimer'

interface CookingModeDialogProps {
  open: boolean
  onClose: () => void
  recipe: Recipe
  // Already filtered by the selected cooking method
  steps: RecipeStep[]
  multiplier: number
}

export function CookingModeDialog({ open, onClose, recipe, steps, multiplier }: CookingModeDialogProps) {
  const { t } = useTranslation()
  const quantityFormat = useQuantityFormat()
  const theme = useTheme()
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'))
  const [requestedStepIndex, setStepIndex] = useState(0)
  const { timers, now, start, pause, reset, adjust, setDuration } = useStepTimers(steps, playAlarm)
  useWakeLock(open)

  const ingredientsById = getIngredientsById(recipe)
  // Switching cooking method can shorten the step list while the dialog is closed
  const stepIndex = Math.min(requestedStepIndex, steps.length - 1)
  const step = steps[stepIndex]
  const isFirst = stepIndex === 0
  const isLast = stepIndex === steps.length - 1
  const timer = timers[step.id]

  // Timers from other steps that still need attention (e.g. dough rising while preparing the filling)
  const otherActiveSteps = steps.filter(
    (other) => other.id !== step.id && (timers[other.id]?.status === 'running' || timers[other.id]?.status === 'done'),
  )

  const goTo = (index: number) => setStepIndex(Math.min(Math.max(index, 0), steps.length - 1))

  const finish = () => {
    onClose()
    setStepIndex(0)
  }

  const handleKeyDown = (event: KeyboardEvent) => {
    // Arrow keys belong to the caret while editing a timer's duration
    if (event.target instanceof HTMLInputElement) return
    if (event.key === 'ArrowRight') goTo(stepIndex + 1)
    if (event.key === 'ArrowLeft') goTo(stepIndex - 1)
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      onKeyDown={handleKeyDown}
      fullScreen={fullScreen}
      fullWidth
      maxWidth="sm"
      keepMounted
      aria-labelledby="cooking-mode-title"
    >
      <DialogTitle id="cooking-mode-title" sx={{ pr: 7 }}>
        <Typography variant="overline" component="p" color="text.secondary">
          {t('cookingMode.stepOf', { current: stepIndex + 1, total: steps.length })}
        </Typography>
        {step.title}
      </DialogTitle>
      <IconButton aria-label={t('cookingMode.close')} onClick={onClose} sx={{ position: 'absolute', right: 8, top: 8 }}>
        <CloseIcon />
      </IconButton>
      <LinearProgress variant="determinate" value={((stepIndex + 1) / steps.length) * 100} />

      <DialogContent>
        <Stack spacing={3} sx={{ pt: 2 }}>
          <Typography variant="h6" component="p" sx={{ fontWeight: 400, lineHeight: 1.6 }}>
            {resolveStepContent(step, ingredientsById, multiplier, quantityFormat)}
          </Typography>

          {timer && (
            <StepTimer
              key={step.id}
              timer={timer}
              now={now}
              onStart={() => {
                primeAlarm()
                start(step.id)
              }}
              onPause={() => pause(step.id)}
              onReset={() => reset(step.id)}
              onAdjust={(deltaMs) => adjust(step.id, deltaMs)}
              onSetDuration={(durationMs) => setDuration(step.id, durationMs)}
            />
          )}

          {otherActiveSteps.length > 0 && (
            <Stack spacing={1}>
              <Typography variant="subtitle2" color="text.secondary">
                {t('cookingMode.otherTimers')}
              </Typography>
              <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
                {otherActiveSteps.map((other) => {
                  const otherTimer = timers[other.id]
                  const isDone = otherTimer.status === 'done'
                  return (
                    <Chip
                      key={other.id}
                      icon={<TimerIcon />}
                      label={`${other.title} · ${isDone ? t('cookingMode.expired') : formatClock(getRemainingMs(otherTimer, now))}`}
                      color={isDone ? 'warning' : 'default'}
                      variant={isDone ? 'filled' : 'outlined'}
                      onClick={() => goTo(steps.indexOf(other))}
                    />
                  )
                })}
              </Stack>
            </Stack>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ justifyContent: 'space-between', px: 3, pb: 2 }}>
        <Button startIcon={<ArrowBackIcon />} disabled={isFirst} onClick={() => goTo(stepIndex - 1)}>
          {t('cookingMode.back')}
        </Button>
        {isLast ? (
          <Button variant="contained" startIcon={<CheckIcon />} onClick={finish}>
            {t('cookingMode.finish')}
          </Button>
        ) : (
          <Button variant="contained" endIcon={<ArrowForwardIcon />} onClick={() => goTo(stepIndex + 1)}>
            {t('cookingMode.next')}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  )
}
