import { Link as RouterLink } from 'react-router-dom'
import AppBar from '@mui/material/AppBar'
import Stack from '@mui/material/Stack'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu'

export function Header() {
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
            My Recipes
          </Typography>
        </Stack>
      </Toolbar>
    </AppBar>
  )
}
