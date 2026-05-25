/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'
 

import type { SyntheticEvent } from 'react';
import { useEffect, useState } from 'react'

import Tab from '@mui/material/Tab'
import Grid from '@mui/material/Grid'
import TabContext from '@mui/lab/TabContext'
import TabPanel from '@mui/lab/TabPanel'

import { getSession } from 'next-auth/react';

import CustomTabList from '@core/components/mui/TabList'
import FaqTable from './faq' // Your existing FaqTable
import { ENDPOINTS } from '@/app/api/apps/taxi/endpoint';
import { getFaqByLanguage } from '@/app/api/apps/taxi/faq';
 

type FaqTab = {
  id: string
  name: string
}
 

interface Props {
  initialLangId: string
  initialFaqData: any
  dictionary: any
}
 

const DynamicFaqTabs = ({ initialLangId, initialFaqData, dictionary }: Props) => {
  const [tabs, setTabs] = useState<FaqTab[]>([])
  const [activeTab, setActiveTab] = useState(initialLangId)
  const [tabContentMap, setTabContentMap] = useState<{ [key: string]: any }>({[initialLangId]: initialFaqData})
  const [loadingTabs, setLoadingTabs] = useState(true)
  const [loadingContent, setLoadingContent] = useState(false)
 

  const getClientId = async () => {
      const session = await getSession();
      const clientId = session?.user?.image?.clientId;
      const companyId = session?.user?.image?.companyId;
   
      return { clientId, companyId };
    };
 
 

  
  // Fetch available language tabs on mount
  useEffect(() => {
    const loadTabs = async () => {
      try {
        const { clientId } = await getClientId();
 
  
        if (!clientId) throw new Error('Client ID missing');
        const res = await fetch(ENDPOINTS.user.dropDownList(clientId))
        const result = await res.json()

        setTabs(result.data.language)
 

      } catch (err) {
        console.error('Failed to load languages:', err)
      } finally {
        setLoadingTabs(false)
      }
    }

    loadTabs()
  }, []);

  const fetchTabContent = async (langId: string, search = '',page = 1, limit = 10,) => {
    if (tabContentMap[langId]) return

    setLoadingContent(true)

    try {
      const data = await getFaqByLanguage(langId,search, page, limit);

      if (data) {
       setTabContentMap(prev => ({
        ...prev,
        [langId]: data
      }))
 

      }
    } catch (err) {
      console.error(`Failed to fetch FAQ for ${langId}`, err)
    } finally {
      setLoadingContent(false)
    }
  }

  useEffect(() => {
    fetchTabContent(activeTab)
  }, [activeTab])

  useEffect(() => {
  }, [tabContentMap]);

  const handleTabChange = async (event: SyntheticEvent, newValue: string) => {
    setActiveTab(newValue)

    // if (!tabContentMap[newValue]) {
    //   await fetchTabContent(newValue)
    // }
  }

  if (loadingTabs) return <p></p>

  return (
    <TabContext value={activeTab}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <CustomTabList onChange={handleTabChange} variant="scrollable" pill="true">
            {tabs.map(tab => (
              <Tab key={tab.id} label={tab.name} value={tab.id} />
            ))}
          </CustomTabList>
        </Grid>
        <Grid item xs={12}>
          <TabPanel value={activeTab} className="p-0">
            {tabContentMap[activeTab] ? (
              <FaqTable
                dictionary={dictionary}
                FaqData={tabContentMap[activeTab]}
                langId={activeTab}
                fetchTabContent={fetchTabContent}
              />
            ) : null}
          </TabPanel>
        </Grid>
      </Grid>
    </TabContext>
  )
}
 

export default DynamicFaqTabs