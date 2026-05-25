'use client'

// React Imports
import { useState } from 'react'

// MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import IconButton from '@mui/material/IconButton'
import CardContent from '@mui/material/CardContent'
import Collapse from '@mui/material/Collapse'
import Typography from '@mui/material/Typography'

const CardActionCollapsible = (dictionary:any) => {
  // States
  const [collapse, setCollapse] = useState(false)

  return (
    <Card>
      <CardHeader
        title='Collapsible'
        action={
          <IconButton size='small' aria-label='collapse' onClick={() => setCollapse(!collapse)}>
            <i className={collapse ? 'tabler-chevron-down' : 'tabler-chevron-up'} />
          </IconButton>
        }
      />
      <Collapse in={!collapse}>
        <CardContent>
          <Typography>
            {dictionary['navigation'].Clickon} <i className='tabler-chevron-up text-xl align-sub' /> {dictionary['navigation'].icontoseeitinaction}
          </Typography>
        </CardContent>
      </Collapse>
    </Card>
  )
}

export default CardActionCollapsible
