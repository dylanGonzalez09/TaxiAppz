// MUI Imports
import Grid from '@mui/material/Grid'

// Type Imports

// Component Imports
import Complaint from './Complaint'


const ComplaintTable = () => {
  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Complaint  />
      </Grid>

    </Grid>
  )
}

export default ComplaintTable
