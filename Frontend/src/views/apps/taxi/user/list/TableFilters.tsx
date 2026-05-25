// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import CardContent from '@mui/material/CardContent'
import Grid from '@mui/material/Grid'
import MenuItem from '@mui/material/MenuItem'

// Type Imports
import type { UsersType } from '@/types/apps/userTypes'

// Component Imports
import CustomTextField from '@core/components/mui/TextField'

const TableFilters = ({ setData, tableData , dictionary }: { setData: (data: UsersType[]) => void; tableData?: UsersType[], dictionary: any }) => {
  // States
  const [status, setStatus] = useState<any>()

  useEffect(() => {

    const filteredData = tableData?.filter(user => {

      if (status != undefined && user.active != status) {
        return false
      } else {
        return true
      }
    })

    setData(filteredData || [])
  }, [status, tableData, setData])

  return (
    <CardContent>
      <Grid container spacing={6}>

        <Grid item xs={12} sm={4}>
          <CustomTextField
            select
            fullWidth
            id='select-status'
            value={status}
            onChange={e => setStatus(e.target.value == "inactive" ? false : true)}
            SelectProps={{ displayEmpty: true }}
          >
            <MenuItem value=''>{dictionary['navigation'].SelectStatus}</MenuItem>
            <MenuItem value='active'>{dictionary['navigation'].Active}</MenuItem>
            <MenuItem value='inactive'>{dictionary['navigation'].InActive}</MenuItem>
          </CustomTextField>
        </Grid>
      </Grid>
    </CardContent>
  )
}

export default TableFilters
