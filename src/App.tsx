import Container from '@mui/material/Container'
import Typography from '@mui/material/Typography'

function App() {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
        My Recipes
      </Typography>
    </Container>
  )
}

export default App
