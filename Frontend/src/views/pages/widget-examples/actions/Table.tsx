// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import TableContainer from '@mui/material/TableContainer'
import Table from '@mui/material/Table'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import TableBody from '@mui/material/TableBody'

// Style Imports
import tableStyles from '@core/styles/table.module.css'

const CardActionsTable = (dictionary:any) => {
  return (
    <Card>
      <CardHeader title='Card Actions' />
      <CardContent>
        <TableContainer>
          <Table className={tableStyles.table}>
            <TableHead>
              <TableRow>
                <TableCell>{dictionary['navigation'].Action}</TableCell>
                <TableCell>{dictionary['navigation'].Icon}</TableCell>
                <TableCell>{dictionary['navigation'].Details}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>{dictionary['navigation'].Collapse}</TableCell>
                <TableCell>
                  <i className='tabler-chevron-up text-xl' />
                </TableCell>
                <TableCell>{dictionary['navigation'].Collapsecardcontentusingcollapseaction}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>{dictionary['navigation'].RefreshContent}</TableCell>
                <TableCell>
                  <i className='tabler-refresh text-xl' />
                </TableCell>
                <TableCell>{dictionary['navigation'].Refreshyourcardcontentusingrefreshaction}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>{dictionary['navigation'].RemoveCard}</TableCell>
                <TableCell>
                  <i className='tabler-x text-xl' />
                </TableCell>
                <TableCell>{dictionary['navigation'].Removecardfrompageusingremovecardaction}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  )
}

export default CardActionsTable
