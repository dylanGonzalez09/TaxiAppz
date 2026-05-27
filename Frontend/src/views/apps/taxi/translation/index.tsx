/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import { useState } from 'react'

import { Card, Box, Tabs, Tab } from '@mui/material'

import TranslationTable from './TranslationTable'

interface TabViewClientProps {
  data: Array<Record<string, any>>
  mobileData: Array<Record<string, any>>
  activeData: any
  allLanguageCodes?: string[]
  dictionary: any
}

const TabViewClient: React.FC<TabViewClientProps> = ({ data,mobileData, activeData, allLanguageCodes = [], dictionary }) => {
  // Use 'mobile' so add flow writes to mobile JSON (mob_*.json); one language add = auto-add to all languages in mobile
  const [currentTab, setCurrentTab] = useState('web')

  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setCurrentTab(newValue)
  }

  return (
    <Card>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={currentTab}
          onChange={handleTabChange}
          variant='fullWidth'
          textColor='primary'
          indicatorColor='primary'
        >
          <Tab label={dictionary['navigation'].Web} value='web' sx={{ flex: 1, textAlign: 'center' }} />
          <Tab label={dictionary['navigation'].Mobile} value='mobile' sx={{ flex: 1, textAlign: 'center' }} />
        </Tabs>
      </Box>
      <Box sx={{ p: 2 }}>
        {activeData && data && currentTab === 'web' && (
          <TranslationTable
            translationData={data}
            currentTab={currentTab}
            activeLanguage={activeData}
            dictionary={dictionary}
          />
        )}
        {activeData && mobileData && currentTab === 'mobile' && (
          <TranslationTable
            translationData={mobileData}
            currentTab={currentTab}
            activeLanguage={activeData}
            allLanguageCodes={allLanguageCodes}
            dictionary={dictionary}
          />
        )}
      </Box>
    </Card>
  )
}

export default TabViewClient
