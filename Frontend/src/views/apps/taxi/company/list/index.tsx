// MUI Imports
import Grid from '@mui/material/Grid'

// Component Imports
import type { CompanyType } from './CompanyListTable';
import CompanyListTable from './CompanyListTable'

const CompanyList = ({ adminData, dictionary,privillageData }: { adminData?: CompanyType[], dictionary: any, privillageData : any }) => {
  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <CompanyListTable tableData={adminData} dictionary={dictionary} privillageData={privillageData}/>
      </Grid>
    </Grid>
  )
}

export default CompanyList
