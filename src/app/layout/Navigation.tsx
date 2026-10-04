import { useTranslation } from 'react-i18next'
import { Link as RouterLink, useLocation } from 'react-router-dom'
import Breadcrumbs from '@mui/material/Breadcrumbs'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'

export function Navigation() {
  const { t } = useTranslation()
  const location = useLocation()
  const isDetail = location.pathname.startsWith('/recipes/')

  return (
    <Container maxWidth="lg" sx={{ pt: 2 }}>
      <Breadcrumbs aria-label={t('nav.label')}>
        <Typography
          component={RouterLink}
          to="/"
          color={isDetail ? 'text.secondary' : 'text.primary'}
          sx={{ textDecoration: 'none' }}
        >
          {t('nav.recipes')}
        </Typography>
        {isDetail && <Typography color="text.primary">{t('nav.recipeDetail')}</Typography>}
      </Breadcrumbs>
    </Container>
  )
}
