'use client'

// React Imports
import { useState } from 'react'

import type { SyntheticEvent, ReactElement } from 'react'

import {useRouter} from 'next/navigation'

// MUI Imports
import Grid from '@mui/material/Grid'
import Tab from '@mui/material/Tab'
import TabContext from '@mui/lab/TabContext'
import TabPanel from '@mui/lab/TabPanel'

// Component Imports
import CustomTabList from '@core/components/mui/TabList'

const Requestmanagement = ({
  tabContentList,
  dictionary,
  defaultTab = 'completed'
}: {
  tabContentList: { [key: string]: ReactElement }
  dictionary: any
  defaultTab?: string
}) => {
  const [activeTab, setActiveTab] = useState(defaultTab)
  const router = useRouter()

  const handleChange = (event: SyntheticEvent, value: string) => {
    setActiveTab(value)
    router.push(`?tab=${value}`)
  }

  return (
    <TabContext value={activeTab}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <CustomTabList onChange={handleChange} variant='scrollable' pill='true'>
            <Tab
              label={dictionary['navigation'].completed}
              icon={<i className='tabler-lock' />}
              iconPosition='start'
              value='completed'
            />

            <Tab
              label={dictionary['navigation'].accepted}
              icon={<i className='tabler-users' />}
              iconPosition='start'
              value='accepted'
            />

            <Tab
              label={dictionary['navigation'].arrived}
              icon={<i className='tabler-bell' />}
              iconPosition='start'
              value='arrived'
            />
            <Tab
              label={dictionary['navigation'].started}
              icon={<i className='tabler-link' />}
              iconPosition='start'
              value='started'
            />
            <Tab
              label={dictionary['navigation'].pending}
              icon={<i className='tabler-users' />}
              iconPosition='start'
              value='pending'
            />

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
