'use client'

// React Imports
import { useState } from 'react'
import type { SyntheticEvent, ReactElement } from 'react'

// MUI Imports
import Grid from '@mui/material/Grid'
import Tab from '@mui/material/Tab'
import TabContext from '@mui/lab/TabContext'
import TabPanel from '@mui/lab/TabPanel'

// Component Imports
import CustomTabList from '@core/components/mui/TabList'

const Requestmanagement = ({ tabContentList, dictionary }: { tabContentList: { [key: string]: ReactElement };dictionary: any }) => {
  // States
  const [activeTab, setActiveTab] = useState('completed')

  const handleChange = (event: SyntheticEvent, value: string) => {
    setActiveTab(value)
  }

  return (
    <TabContext value={activeTab}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <CustomTabList onChange={handleChange} variant='scrollable' pill='true'>
          <Tab label='completed' icon={<i className='tabler-lock' />} iconPosition='start' value='completed' />


            <Tab label={dictionary['navigation'].accepted} icon={<i className='tabler-users' />} iconPosition='start' value='accepted' />
            <Tab
              label={dictionary['navigation'].arrived}
              icon={<i className='tabler-bell' />}
              iconPosition='start'
              value='arrived'
            />
            <Tab label='started' icon={<i className='tabler-link' />} iconPosition='start' value='started' />
            <Tab label='pending' icon={<i className='tabler-users' />} iconPosition='start' value='pending' />

            <Tab
              label={dictionary['navigation'].cancelled}
              icon={<i className='tabler-bookmark' />}
              iconPosition='start'
              value='cancelled'
            />
          </CustomTabList>
        </Grid>
        <Grid item xs={12}>
          <TabPanel value={activeTab} className='p-0'>
            {tabContentList[activeTab]}
          </TabPanel>
        </Grid>
      </Grid>
    </TabContext>
  )
}

export default Requestmanagement
