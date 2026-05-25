// MUI Imports
import Grid from '@mui/material/Grid'

// Type Imports
// Component Imports
import type { AdminType } from './AdminListTable';
import AdminListTable from './AdminListTable'

const AdminList = ({ adminData, dictionary }: { adminData?: AdminType[], dictionary: any }) => {

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <AdminListTable tableData={adminData} dictionary={dictionary}  />
      </Grid>
    </Grid>
  )
}

export default AdminList
