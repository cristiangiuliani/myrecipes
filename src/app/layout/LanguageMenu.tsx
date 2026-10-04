import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import Button from '@mui/material/Button'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import TranslateIcon from '@mui/icons-material/Translate'
import { LANGUAGES, setLanguage, useLanguage } from '@/shared/i18n'

export function LanguageMenu() {
  const { t } = useTranslation()
  const language = useLanguage()
  const [anchor, setAnchor] = useState<HTMLElement | null>(null)

  return (
    <>
      <Button
        color="inherit"
        startIcon={<TranslateIcon />}
        onClick={(event) => setAnchor(event.currentTarget)}
        aria-label={t('app.language')}
        aria-haspopup="menu"
        aria-expanded={anchor ? 'true' : undefined}
      >
        {language.toUpperCase()}
      </Button>
      <Menu anchorEl={anchor} open={!!anchor} onClose={() => setAnchor(null)}>
        {LANGUAGES.map((option) => (
          <MenuItem
            key={option.code}
            lang={option.code}
            selected={option.code === language}
            onClick={() => {
              setLanguage(option.code)
              setAnchor(null)
            }}
          >
            {option.label}
          </MenuItem>
        ))}
      </Menu>
    </>
  )
}
