/* eslint-disable @typescript-eslint/no-unused-vars */
// MUI Imports
import Grid from '@mui/material/Grid'

// Component Imports
import Wallet from './Wallet'

const WalletTab = () => {
  return (
    <Grid container spacing={6}>

      <Grid item xs={12}>
        <Wallet />
      </Grid>
    </Grid>
  )
}

export default WalletTab
