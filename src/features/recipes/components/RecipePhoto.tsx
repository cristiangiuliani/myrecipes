import { useState } from 'react'
import Box from '@mui/material/Box'
import type { SxProps, Theme } from '@mui/material/styles'
import RestaurantIcon from '@mui/icons-material/Restaurant'

interface RecipePhotoProps {
  src: string
  alt: string
  sx?: SxProps<Theme>
}

export function RecipePhoto({ src, alt, sx }: RecipePhotoProps) {
  // Remembering the failed src (rather than a flag) resets the state when the recipe changes
  const [failedSrc, setFailedSrc] = useState<string | null>(null)

  // Missing photo: a neutral placeholder keeps the photo slot visible
  if (failedSrc === src) {
    return (
      <Box
        role="img"
        aria-label={alt}
        sx={[
          { display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'action.hover', color: 'text.disabled' },
          ...(Array.isArray(sx) ? sx : [sx]),
        ]}
      >
        <RestaurantIcon sx={{ fontSize: 48 }} />
      </Box>
    )
  }

  return (
    <Box
      component="img"
      src={src}
      alt={alt}
      // Not loading="lazy": Chrome never starts lazy images while offline, even when the service worker has them cached
      decoding="async"
      onError={() => setFailedSrc(src)}
      sx={[{ display: 'block', width: '100%', objectFit: 'cover' }, ...(Array.isArray(sx) ? sx : [sx])]}
    />
  )
}
