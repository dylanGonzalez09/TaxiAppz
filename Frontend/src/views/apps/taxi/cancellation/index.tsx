/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import type { SyntheticEvent } from 'react'
import { useEffect, useState } from 'react'

import Tab from '@mui/material/Tab'
import Grid from '@mui/material/Grid'

import TabContext from '@mui/lab/TabContext'
import TabPanel from '@mui/lab/TabPanel'
import { getSession } from 'next-auth/react'

import CustomTabList from '@core/components/mui/TabList'

import { getDropDownList } from '@apis/user'

import { getCancellationByLanguage } from '@/app/api/apps/taxi/cancellationReason'
import CancellationTable from './CancellationTable'

type CancellationTab = {
  id: string
  name: string
}

interface Props {
  initialLangId: string
  initialCancellationData: any
  dictionary: any
  zoneId:string
}

const DynamicCancellationTabs = ({ zoneId, initialLangId, initialCancellationData, dictionary }: Props) => {
  const [tabs, setTabs] = useState<CancellationTab[]>([])
  const [activeTab, setActiveTab] = useState(initialLangId)

  const [tabContentMap, setTabContentMap] = useState<{ [key: string]: any }>({
    [initialLangId]: initialCancellationData
  })

  const [loadingTabs, setLoadingTabs] = useState(true)
  const [loadingContent, setLoadingContent] = useState(false)
  const [clientId, setClientId] = useState('')

  // Fetch available language tabs on mount
  useEffect(() => {
    const loadTabs = async () => {
      try {
        const session = await getSession()
        const id: any = session?.user?.image?.clientId

        setClientId(id)
        const res = await getDropDownList(id, zoneId)

        setTabs(res.language)
      } catch (err) {
        console.error('Failed to load languages:', err)
      } finally {
        setLoadingTabs(false)
      }
    }

    loadTabs()
  }, [zoneId])

  // This function now ALWAYS fetches fresh data from the server
  const fetchTabContent = async (langId: string, search = '', page = 1, limit = 10) => {
    setLoadingContent(true)

    try {
      // Fetch fresh data from API
      const data = await getCancellationByLanguage(langId, search, page, limit, zoneId)
      
      if (data) {
        // Overwrite the state with fresh data
        setTabContentMap(prev => ({
          ...prev,
          [langId]: data
        }))
      }
    } catch (err) {
      console.error(`Failed to fetch Cancellation for ${langId}`, err)
    } finally {
      setLoadingContent(false)
    }
  }

  // Handle Tab Switch
  const handleTabChange = async (event: SyntheticEvent, newValue: string) => {
    setActiveTab(newValue)
    await fetchTabContent(newValue, '', 1, 10) 
  }

  if (loadingTabs) return <p></p>

  return (
    <TabContext value={activeTab}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <CustomTabList onChange={handleTabChange} variant='scrollable' pill='true'>
            {tabs.map(tab => (
              <Tab key={tab.id} label={tab.name} value={tab.id} />
            ))}
          </CustomTabList>
        </Grid>
        <Grid item xs={12}>
          <TabPanel value={activeTab} className='p-0'>
            {tabContentMap[activeTab] ? (
              <CancellationTable
                dictionary={dictionary}
                CancellationData={tabContentMap[activeTab]}
                langId={activeTab}
                fetchTabContent={fetchTabContent}
                zoneId={zoneId}
                clientId={clientId}
              />
            ) : null}
          </TabPanel>
        </Grid>
      </Grid>
    </TabContext>
  )
}

export default DynamicCancellationTabs