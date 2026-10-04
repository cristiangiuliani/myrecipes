import { useTranslation } from 'react-i18next'
import { Link as RouterLink } from 'react-router-dom'
import AppBar from '@mui/material/AppBar'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu'
import { LanguageMenu } from './LanguageMenu'

export function Header() {
  const { t } = useTranslation()

  return (
    <AppBar position="sticky" color="default" elevation={0} sx={{ borderBottom: 1, borderColor: 'divider' }}>
      <Toolbar>
        <Stack
          component={RouterLink}
          to="/"
          direction="row"
          spacing={1}
          sx={{ alignItems: 'center', textDecoration: 'none', color: 'inherit' }}
        >
          <RestaurantMenuIcon />
          <Typography variant="h6" component="span" sx={{ fontWeight: 700 }}>
            {t('app.name')}
          </Typography>
        </Stack>
        <Box sx={{ flexGrow: 1 }} />
        <LanguageMenu />
      </Toolbar>
    </AppBar>
  )
}
