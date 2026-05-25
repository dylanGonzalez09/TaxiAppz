/* eslint-disable @typescript-eslint/no-unused-vars */
// MUI Imports
import Grid from '@mui/material/Grid'

// Component Imports
import RatingList from './RatingList'
import OverAllRating from './OverAllRating'

const RatingTab = () => {
  return (
    <Grid container spacing={6}>
     <Grid item xs={12}>
        <OverAllRating />
      </Grid>
      <Grid item xs={12}>
        <RatingList />
      </Grid>
    </Grid>
  )
}

export default RatingTab
