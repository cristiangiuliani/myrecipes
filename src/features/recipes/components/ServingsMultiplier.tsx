import Stack from '@mui/material/Stack'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Typography from '@mui/material/Typography'
import { formatMultiplierLabel, MULTIPLIER_OPTIONS } from '../scaling/multiplierOptions'

interface ServingsMultiplierProps {
  value: number
  onChange: (value: number) => void
}

export function ServingsMultiplier({ value, onChange }: ServingsMultiplierProps) {
  return (
    <Stack spacing={1}>
      <Typography variant="subtitle2" color="text.secondary">
        Moltiplica dosi
      </Typography>
      <ToggleButtonGroup
        value={value}
        exclusive
        size="small"
        onChange={(_event, next: number | null) => {
          if (next !== null) onChange(next)
        }}
        sx={{ flexWrap: 'wrap', gap: 1 }}
      >
        {MULTIPLIER_OPTIONS.map((option) => (
          <ToggleButton key={option} value={option} sx={{ borderRadius: 1 }}>
            {formatMultiplierLabel(option)}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </Stack>
  )
}
