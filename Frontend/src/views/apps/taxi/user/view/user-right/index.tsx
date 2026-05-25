/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

// React Imports
import { useState } from 'react'
import type { SyntheticEvent, ReactElement } from 'react'

// MUI Imports
import Tab from '@mui/material/Tab'
import TabContext from '@mui/lab/TabContext'
import TabPanel from '@mui/lab/TabPanel'
import Grid from '@mui/material/Grid'

// Component Imports
import CustomTabList from '@core/components/mui/TabList'

const UserRight = ({ tabContentList, userId ,dictionary}: { tabContentList: { [key: string]: ReactElement }, userId: string,dictionary:any }) => {
  // States
  const [activeTab, setActiveTab] = useState('request')

  const handleChange = (event: SyntheticEvent, value: string) => {
    setActiveTab(value)
  }

  return (
    <>
      <TabContext value={activeTab}>
        <Grid container spacing={6}>
          <Grid item xs={12}>
            <CustomTabList onChange={handleChange} variant='scrollable' pill='true'>
              <Tab icon={<i className='tabler-pointer-question' />} value='request' label={dictionary['navigation'].Request}  iconPosition='start' />
              <Tab icon={<i className='tabler-wallet' />} value='wallet' label={dictionary['navigation'].Wallet}  iconPosition='start' />
              <Tab
                icon={<i className='tabler-components-off' />}
                value='complaint'
                label={dictionary['navigation'].Complaint} 
                iconPosition='start'
              />
              <Tab
                icon={<i className='tabler-rating-12-plus' />}
                value='rating'
                label={dictionary['navigation'].Rating} 
                iconPosition='start'
              />
             <Tab icon={<i className='tabler-repeat' />} value='referal' label={dictionary['navigation'].Referal} iconPosition='start' />
              {/* <Tab icon={<i className='tabler-grip-horizontal' />} value='totalTrip' label='Total Trip' iconPosition='start' /> */}
              <Tab icon={<i className='tabler-ticket' />} value='fine' label={dictionary['navigation'].Fine}  iconPosition='start' />

            </CustomTabList>
          </Grid>
          <Grid item xs={12}>
            <TabPanel value={activeTab} className='p-0'>
              {tabContentList[activeTab]}
            </TabPanel>
          </Grid>
        </Grid>
      </TabContext>
    </>
  )
}

export default UserRight
