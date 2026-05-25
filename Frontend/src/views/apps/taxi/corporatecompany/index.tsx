/* eslint-disable @typescript-eslint/no-unused-vars */
// MUI Imports
import Grid from '@mui/material/Grid'

// Component Imports
import type { CorporateType } from './CorporateListTable';
import CorporateListTable from './CorporateListTable'

const CorporateList = ({ adminData, dictionary,privillageData }: { adminData?: any, dictionary: any,privillageData:any }) => {
  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <CorporateListTable tableData={adminData} dictionary={dictionary} privillageData={privillageData}  />
      </Grid>
    </Grid>
  )
}

export default CorporateList
