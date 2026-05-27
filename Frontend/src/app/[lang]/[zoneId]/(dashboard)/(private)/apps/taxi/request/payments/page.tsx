import type { Locale } from '@/configs/i18n'
import { getDictionary } from '@/utils/getDictionary'

import PaymentTrips from '@/views/apps/taxi/request/paymentTrips'
import { getRequestWithPagination } from '@/app/api/apps/taxi/request'

const VALID_TABS = ['cash', 'card', 'wallet'] as const

const PaymentsPage = async ({
  params,
  searchParams
}: {
  params: { lang: Locale ,zoneId:any}
  searchParams?: { tab?: string }
}) => {
  const dictionary = await getDictionary(params.lang)
  const tab = searchParams?.tab
  const defaultTab = tab && (VALID_TABS as readonly string[]).includes(tab) ? (tab as (typeof VALID_TABS)[number]) : 'cash'

  // Prefetch all three tabs so switching is instant (and avoids client-side router changes).
  const [cash, card, wallet] = await Promise.all([
    getRequestWithPagination('', 1, 10, 'RIDE_NOW', 'isCompleted', 'CASH',"","",params.zoneId),
    getRequestWithPagination('', 1, 10, 'RIDE_NOW', 'isCompleted', 'CARD',"","",params.zoneId),
    getRequestWithPagination('', 1, 10, 'RIDE_NOW', 'isCompleted', 'WALLET',"","",params.zoneId)
  ])

  return (
    <PaymentTrips
      defaultTab={defaultTab}
      dictionary={dictionary}
      zoneId={params.zoneId}
      initialDataByTab={{
        cash: cash || { page: 1, limit: 10, totalResults: 0, results: [] },
        card: card || { page: 1, limit: 10, totalResults: 0, results: [] },
        wallet: wallet || { page: 1, limit: 10, totalResults: 0, results: [] }
      }}
    />
  )
}

export default PaymentsPage

