// MUI Imports
import dynamic from 'next/dynamic'
import { unstable_noStore as noStore } from 'next/cache'

import Button from '@mui/material/Button'

// Third-party Imports
import { getServerSession } from 'next-auth'

// Type Imports
import type { ChildrenType } from '@core/types'
import type { Locale } from '@configs/i18n'

// Layout Imports
import LayoutWrapper from '@layouts/LayoutWrapper'
import VerticalLayout from '@layouts/VerticalLayout'

// Component Imports
import Providers from '@components/Providers'
import IdleLogoutProvider from '@components/IdleLogoutProvider'
import Navigation from '@components/layout/vertical/Navigation'
import Navbar from '@components/layout/vertical/Navbar'
import VerticalFooter from '@components/layout/vertical/Footer'
import ScrollToTop from '@core/components/scroll-to-top'
import AuthGuard from '@/hocs/AuthGuard'
import TranslationUpdateSync from '@/components/TranslationUpdateSync'
import RouteRefreshOnNavigation from '@/components/RouteRefreshOnNavigation'

// Config Imports
import { i18n } from '@configs/i18n'

// Util Imports
import { getDictionary } from '@/utils/getDictionary'
import { getMode, getSystemMode } from '@core/utils/serverHelpers'

const MqttProvider = dynamic(() => import('@/components/MqttProvider'), { ssr: false })

const Layout = async ({ children, params }: ChildrenType & { params: { lang: Locale } }) => {
  noStore()

  const direction = i18n.langDirection[params.lang]
  const dictionary = await getDictionary(params.lang)
  const mode = getMode()
  const systemMode = getSystemMode()
  const session = await getServerSession()

  return (
    <Providers direction={direction}>
      <IdleLogoutProvider timeout={60 * 60 * 1000} />
      <MqttProvider />
      <AuthGuard locale={params.lang}>
        <TranslationUpdateSync />
        <RouteRefreshOnNavigation />
        <LayoutWrapper
          systemMode={systemMode}
          verticalLayout={
            <VerticalLayout
              navigation={<Navigation dictionary={dictionary} mode={mode} systemMode={systemMode} session={session} />}
              navbar={<Navbar />}
              footer={<VerticalFooter />}
            >
              {children}
            </VerticalLayout>
          }
        />
        <ScrollToTop className='mui-fixed'>
          <Button variant='contained' className='is-10 bs-10 rounded-full p-0 min-is-0 flex items-center justify-center'>
            <i className='tabler-arrow-up' />
          </Button>
        </ScrollToTop>
      </AuthGuard>
    </Providers>
  )
}

export default Layout

