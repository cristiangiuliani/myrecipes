import Stack from '@mui/material/Stack'
import ToggleButton from '@mui/material/ToggleButton'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import Typography from '@mui/material/Typography'
import AirIcon from '@mui/icons-material/Air'
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment'
import SoupKitchenIcon from '@mui/icons-material/SoupKitchen'
import WhatshotIcon from '@mui/icons-material/Whatshot'
import type { CookingMethod, CookingMethodType } from '../types'
import { describeCookingMethod } from '../methods/cookingMethods'

const ICONS: Record<CookingMethodType, typeof AirIcon> = {
  oven: LocalFireDepartmentIcon,
  stovetop: SoupKitchenIcon,
  airfryer: AirIcon,
  other: WhatshotIcon,
}

interface CookingMethodInfoProps {
  methods: CookingMethod[]
  selected: CookingMethod
  onSelect: (methodId: string) => void
}

export function CookingMethodInfo({ methods, selected, onSelect }: CookingMethodInfoProps) {
  const SelectedIcon = ICONS[selected.type]

  return (
    <Stack spacing={1.5}>
      {methods.length > 1 && (
        <ToggleButtonGroup
          exclusive
          size="small"
          color="primary"
          value={selected.id}
          // Clicking the active button yields null: keep the current method selected
          onChange={(_, methodId: string | null) => methodId && onSelect(methodId)}
          aria-label="Metodo di cottura"
          sx={{ flexWrap: 'wrap' }}
        >
          {methods.map((method) => {
            const Icon = ICONS[method.type]
            return (
              <ToggleButton key={method.id} value={method.id} sx={{ gap: 1, textTransform: 'none' }}>
                <Icon fontSize="small" />
                {method.label}
              </ToggleButton>
            )
          })}
        </ToggleButtonGroup>
      )}
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
        <SelectedIcon fontSize="small" color="action" />
        <Typography variant="body2">{describeCookingMethod(selected)}</Typography>
      </Stack>
    </Stack>
  )
}
