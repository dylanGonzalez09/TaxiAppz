/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState } from 'react';

import dynamic from 'next/dynamic';

import Card from '@mui/material/Card';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';

import GeneralTable from '@/views/apps/taxi/settings/general';

const TermsTable = dynamic(() => import('@/views/apps/taxi/settings/terms'), {

  ssr: false
});

import ModuleTable from '@/views/apps/taxi/settings/module';
import KeysTable from '@/views/apps/taxi/settings/keys';
import SmsTable from './sms';
import PaymentTable from './payment';

interface TabViewComponentProps {
  dictionary: any;
  params: { id: string };
  settingsData: {
    general?: any;
    terms?: any;
    keys?: any;
    modules?: any;
    sms?: any;
    payment?: any;
    activeLanguage?: any;
    activeCountry?: any;
    langId?:any;
  };
}

const TabViewComponent = ({ params, dictionary, settingsData }: TabViewComponentProps) => {
  const [currentTab, setCurrentTab] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  return (
    <Card>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={currentTab} onChange={handleTabChange} variant="fullWidth">
          <Tab label={dictionary['navigation'].General} sx={{ width: '50%' }} />
          <Tab label={dictionary['navigation'].Keys} sx={{ width: '50%' }} />
          <Tab label={dictionary['navigation'].ModuleSettings} sx={{ width: '50%' }} />
          <Tab label={dictionary['navigation'].TermsandCondition} sx={{ width: '50%' }} />
          <Tab label={dictionary['navigation'].sms} sx={{ width: '50%' }} />
          <Tab label={dictionary['navigation'].payment} sx={{ width: '50%' }} />
        </Tabs>
      </Box>
      <Box sx={{ p: 2 }}>
        {currentTab === 0 && (
          <GeneralTable 
            translationData={settingsData.general?.settings || []} 
            currentTab={currentTab} 
            activeLanguage={settingsData.activeLanguage} 
            activeCountry={settingsData.activeCountry} 
            apiData={settingsData.general?.settings || []} 
            dictionary={dictionary}
          />
        )}
        {currentTab === 1 && (
          <KeysTable 
            translationData={settingsData.keys?.settings || []} 
            currentTab={currentTab} 
            activeLanguage={settingsData.activeLanguage} 
            dictionary={dictionary}
          />
        )}
        {currentTab === 2 && (
          <ModuleTable 
            translationData={settingsData.modules?.settings || []} 
            currentTab={currentTab} 
            activeLanguage={settingsData.activeLanguage} 
            settingsData={settingsData.modules?.settings || []}  
            dictionary={dictionary}
          />
        )}
        {currentTab === 3 && (
          <TermsTable 
            translationData={settingsData.terms?.settings || []} 
            currentTab={currentTab} 
            activeLanguage={settingsData.activeLanguage} 
            settingsData={settingsData.terms?.settings || []} 
            dictionary={dictionary} 
            langId={settingsData.langId}
          />
        )}
        {currentTab === 4 && (
          <SmsTable 
            translationData={settingsData.modules?.settings || []} 
            currentTab={currentTab} 
            activeLanguage={settingsData.activeLanguage} 
            settingsData={settingsData.modules?.settings || []} 
            dictionary={dictionary} 
          />
        )}
        {currentTab === 5 && (
          <PaymentTable 
            translationData={settingsData.sms?.settings || []} 
            currentTab={currentTab} 
            activeLanguage={settingsData.activeLanguage} 
            settingsData={settingsData.modules?.settings || []} 
            dictionary={dictionary} 
          />
        )}
      </Box>
    </Card>
  );
};

export default TabViewComponent;