import { useState } from 'react'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import LinearProgress from '@mui/material/LinearProgress'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import EditIcon from '@mui/icons-material/Edit'
import PauseIcon from '@mui/icons-material/Pause'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import ReplayIcon from '@mui/icons-material/Replay'
import { formatClock } from '@/shared/lib/duration'
import { canAdjustTimer, getRemainingMs, type TimerState } from '../cooking/timer'

interface StepTimerProps {
  timer: TimerState
  now: number
  onStart: () => void
  onPause: () => void
  onReset: () => void
  onAdjust: (deltaMs: number) => void
  onSetDuration: (durationMs: number) => void
}

const ADJUST_MINUTES = [-15, -5, -1, 1, 5, 15]
const MINUTE_MS = 60_000

export function StepTimer({ timer, now, onStart, onPause, onReset, onAdjust, onSetDuration }: StepTimerProps) {
  const [editing, setEditing] = useState(false)
  const remainingMs = getRemainingMs(timer, now)
  const progress = ((timer.durationMs - remainingMs) / timer.durationMs) * 100
  const isDone = timer.status === 'done'

  return (
    <Paper variant="outlined" sx={{ p: 3, borderColor: isDone ? 'warning.main' : undefined }}>
      <Stack spacing={2} sx={{ alignItems: 'center' }}>
        {editing ? (
          <DurationEditor
            initialMs={remainingMs > 0 ? remainingMs : timer.durationMs}
            onCancel={() => setEditing(false)}
            onSave={(durationMs) => {
              onSetDuration(durationMs)
              setEditing(false)
            }}
          />
        ) : (
          <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
            <Typography
              variant="h3"
              component="p"
              aria-live="polite"
              color={isDone ? 'warning.main' : 'text.primary'}
              sx={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}
            >
              {isDone ? 'Tempo scaduto!' : formatClock(remainingMs)}
            </Typography>
            {timer.status !== 'running' && (
              <IconButton aria-label="Modifica durata" onClick={() => setEditing(true)}>
                <EditIcon />
              </IconButton>
            )}
          </Stack>
        )}
        <LinearProgress
          variant="determinate"
          value={progress}
          color={isDone ? 'warning' : 'primary'}
          sx={{ width: '100%', height: 6, borderRadius: 3 }}
        />
        {!editing && (
          <>
            <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap', justifyContent: 'center' }}>
              {ADJUST_MINUTES.map((minutes) => (
                <Button
                  key={minutes}
                  size="small"
                  variant="outlined"
                  disabled={!canAdjustTimer(timer, minutes * MINUTE_MS, now)}
                  onClick={() => onAdjust(minutes * MINUTE_MS)}
                >
                  {minutes > 0 ? '+' : '−'}
                  {Math.abs(minutes)} min
                </Button>
              ))}
            </Stack>
            <Stack direction="row" spacing={1}>
              {timer.status === 'running' ? (
                <Button variant="contained" startIcon={<PauseIcon />} onClick={onPause}>
                  Pausa
                </Button>
              ) : (
                !isDone && (
                  <Button variant="contained" startIcon={<PlayArrowIcon />} onClick={onStart}>
                    {timer.status === 'paused' ? 'Riprendi' : 'Avvia timer'}
                  </Button>
                )
              )}
              {timer.status !== 'idle' && (
                <Button variant="outlined" startIcon={<ReplayIcon />} onClick={onReset}>
                  Azzera
                </Button>
              )}
            </Stack>
          </>
        )}
      </Stack>
    </Paper>
  )
}

interface DurationEditorProps {
  initialMs: number
  onSave: (durationMs: number) => void
  onCancel: () => void
}

function DurationEditor({ initialMs, onSave, onCancel }: DurationEditorProps) {
  const initialMinutes = Math.ceil(initialMs / MINUTE_MS)
  const [hours, setHours] = useState(String(Math.floor(initialMinutes / 60)))
  const [minutes, setMinutes] = useState(String(initialMinutes % 60))
  const totalMs = ((Number(hours) || 0) * 60 + (Number(minutes) || 0)) * MINUTE_MS

  return (
    <Stack
      component="form"
      spacing={2}
      sx={{ alignItems: 'center' }}
      onSubmit={(event) => {
        event.preventDefault()
        if (totalMs > 0) onSave(totalMs)
      }}
    >
      <Stack direction="row" spacing={1}>
        <TextField
          label="Ore"
          type="number"
          value={hours}
          onChange={(event) => setHours(event.target.value)}
          slotProps={{ htmlInput: { min: 0, inputMode: 'numeric' } }}
          sx={{ width: 96 }}
          autoFocus
        />
        <TextField
          label="Minuti"
          type="number"
          value={minutes}
          onChange={(event) => setMinutes(event.target.value)}
          slotProps={{ htmlInput: { min: 0, inputMode: 'numeric' } }}
          sx={{ width: 96 }}
        />
      </Stack>
      <Stack direction="row" spacing={1}>
        <Button onClick={onCancel}>Annulla</Button>
        <Button type="submit" variant="contained" disabled={totalMs <= 0}>
          Imposta
        </Button>
      </Stack>
    </Stack>
  )
}
