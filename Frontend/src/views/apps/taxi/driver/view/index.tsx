// MUI Imports
import Grid from '@mui/material/Grid'

// Component Imports
import DiverDetails from './DiverDetails'

const DriverLeftOverview = () => {
  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <DiverDetails />
      </Grid>
   
    </Grid>
  )
}

export default DriverLeftOverview
