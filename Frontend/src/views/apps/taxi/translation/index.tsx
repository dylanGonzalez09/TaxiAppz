'use client';

import { useState } from 'react';

import { Card, Tabs, Tab, Box } from '@mui/material';

import TranslationTable from '@/views/apps/taxi/translation/TranslationTable';

interface TabViewClientProps {
  data: Array<Record<string, any>>; // Adjust this type based on the actual structure of your data
  mobileData: Array<Record<string, any>>; // Adjust this type based on the actual structure of your mobile data
  activeData: any; // Replace 'any' with the specific type of your active data
  dictionary: any; // Assuming this is an object containing your dictionary
}

const TabViewClient: React.FC<TabViewClientProps> = ({ data, mobileData, activeData, dictionary }) => {
  const [currentTab, setCurrentTab] = useState('web');

  const handleTabChange = (event: React.SyntheticEvent, newValue: string) => {
    setCurrentTab(newValue);
  };


  return (
    <Card>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs 
          value={currentTab} 
          onChange={handleTabChange} 
          variant="fullWidth" 
          textColor="primary"
          indicatorColor="primary"
        >
          <Tab label={dictionary['navigation'].Web} value="web" sx={{ flex: 1, textAlign: 'center' }} />
          <Tab label={dictionary['navigation'].Mobile} value="mobile" sx={{ flex: 1, textAlign: 'center' }} />
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
            dictionary={dictionary}
          />
        )}
      </Box>
    </Card>
  );
};

export default TabViewClient;
