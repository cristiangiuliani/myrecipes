import { Link as RouterLink, useLocation } from 'react-router-dom'
import Breadcrumbs from '@mui/material/Breadcrumbs'
import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'

export function Navigation() {
  const location = useLocation()
  const isDetail = location.pathname.startsWith('/recipes/')

  return (
    <Container maxWidth="lg" sx={{ pt: 2 }}>
      <Breadcrumbs aria-label="navigazione">
        <Typography
          component={RouterLink}
          to="/"
          color={isDetail ? 'text.secondary' : 'text.primary'}
          sx={{ textDecoration: 'none' }}
        >
          Ricette
        </Typography>
        {isDetail && <Typography color="text.primary">Dettaglio ricetta</Typography>}
      </Breadcrumbs>
    </Container>
  )
}
