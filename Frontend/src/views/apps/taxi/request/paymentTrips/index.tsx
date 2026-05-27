'use client'

import { useEffect, useMemo, useState } from 'react'

import { useParams, useRouter } from 'next/navigation'

import Grid from '@mui/material/Grid'

// import Box from '@mui/material/Box'
// import Button from '@mui/material/Button'

import Tab from '@mui/material/Tab'
import TabContext from '@mui/lab/TabContext'
import TabPanel from '@mui/lab/TabPanel'

import CustomTabList from '@core/components/mui/TabList'

import PaymentTripsTable, { type PaymentOpt } from './PaymentTripsTable'

const TAB_TO_PAYMENT: Record<string, PaymentOpt> = {
  cash: 'CASH',
  card: 'CARD',
  wallet: 'WALLET'
}

const PaymentTrips = ({
  defaultTab = 'cash',
  dictionary,
  initialDataByTab,
  zoneId
}: {
  defaultTab?: 'cash' | 'card' | 'wallet'
  dictionary: any
  initialDataByTab: {
    cash: any
    card: any
    wallet: any
  },
  zoneId:any
}) => {
  const router = useRouter()
  const { lang } = useParams()
  const initialTab = (['cash', 'card', 'wallet'] as const).includes(defaultTab) ? defaultTab : 'cash'
  const [activeTab, setActiveTab] = useState<'cash' | 'card' | 'wallet'>(initialTab)

  // Keep local state in sync if server-provided defaultTab changes (e.g. direct navigation)
  useEffect(() => {
    setActiveTab(initialTab)
  }, [initialTab])

  const data = useMemo(() => {
    return {
      cash: initialDataByTab.cash,
      card: initialDataByTab.card,
      wallet: initialDataByTab.wallet
    }
  }, [initialDataByTab])

  return (
    <TabContext value={activeTab}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <CustomTabList
            onChange={(e, value) => {
              const nextTab = value as 'cash' | 'card' | 'wallet'

              setActiveTab(nextTab)

              // Update URL so refresh/back maintains selected tab
              router.replace(`/${lang}/${zoneId}/apps/taxi/request/payments?tab=${nextTab}`)
            }}
            variant='scrollable'
            pill='true'
          >
            <Tab label={dictionary['navigation'].CashPayments || 'Cash Payments'} icon={<i className='tabler-cash' />} iconPosition='start' value='cash' />
            <Tab label={dictionary['navigation'].CardPayments || 'Card Payments'} icon={<i className='tabler-credit-card-pay' />} iconPosition='start' value='card' />
            <Tab label={dictionary['navigation'].WalletPayments || 'Wallet Payments'} icon={<i className='tabler-wallet' />} iconPosition='start' value='wallet' />
          </CustomTabList>
        </Grid>

        <Grid item xs={12}>
          <TabPanel value='cash' className='p-0'>
            <PaymentTripsTable initialData={data.cash} zoneId={zoneId} dictionary={dictionary} paymentOpt={TAB_TO_PAYMENT.cash} />
          </TabPanel>
          <TabPanel value='card' className='p-0'>
            <PaymentTripsTable initialData={data.card} zoneId={zoneId} dictionary={dictionary} paymentOpt={TAB_TO_PAYMENT.card} />
          </TabPanel>
          <TabPanel value='wallet' className='p-0'>
            <PaymentTripsTable initialData={data.wallet} zoneId={zoneId} dictionary={dictionary} paymentOpt={TAB_TO_PAYMENT.wallet} />
          </TabPanel>
        </Grid>
      </Grid>
    </TabContext>
  )
}

export default PaymentTrips

