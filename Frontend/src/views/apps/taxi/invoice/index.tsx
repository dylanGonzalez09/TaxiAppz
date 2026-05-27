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
import InvoiceTable from './invoice'
import { getInvoiceByLanguage } from '@/app/api/apps/taxi/invoice'
import { getDropDownList } from '@/app/api/apps/taxi/user'

type InvoiceTab = {
  id: string
  name: string
}

interface Props {
  initialLangId: string
  initialFaqData: any
  dictionary: any
  zoneId: string
}

const DynamicInvoiceTabs = ({ zoneId, initialLangId, initialFaqData, dictionary }: Props) => {
  const [tabs, setTabs] = useState<InvoiceTab[]>([])
  const [activeTab, setActiveTab] = useState(initialLangId)
  
  // We keep the map to store data, but we will overwrite it every time we switch
  const [tabContentMap, setTabContentMap] = useState<{ [key: string]: any }>({ [initialLangId]: initialFaqData })
  
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
      const data = await getInvoiceByLanguage(langId, search, page, limit, zoneId)
      
      if (data) {
        // Overwrite the state with fresh data
        setTabContentMap(prev => ({
          ...prev,
          [langId]: data
        }))
      }
    } catch (err) {
      console.error(`Failed to fetch Invoice for ${langId}`, err)
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
              <InvoiceTable
                dictionary={dictionary}
                InvoiceData={tabContentMap[activeTab]}
                langId={activeTab}
                fetchTabContent={fetchTabContent}
                clientId={clientId}
                zoneId={zoneId}
              />
            ) : null}
          </TabPanel>
        </Grid>
      </Grid>
    </TabContext>
  )
}

export default DynamicInvoiceTabs