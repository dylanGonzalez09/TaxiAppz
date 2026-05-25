/* eslint-disable @typescript-eslint/no-unused-vars */
// MUI Imports
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'

// Type Imports

// Component Imports
import RoleCards from './RoleCards'
import type { RoleType } from '@/types/apps/roleTypes'

const Roles = ({ roleData , dictionary }: { roleData?: RoleType[],dictionary: any }) => { 
  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <Typography variant='h4' className='mbe-1'>
          {dictionary['navigation'].RolesList}
        </Typography>
        <Typography>
          {dictionary['navigation'].RolesListDescription}
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <RoleCards roleData={roleData} dictionary={dictionary} />
      </Grid>


    </Grid>
  )
}

export default Roles
