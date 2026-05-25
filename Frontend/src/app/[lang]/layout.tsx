/* eslint-disable import/order */
/* eslint-disable @typescript-eslint/no-unused-vars */
// Next Imports
import { headers } from 'next/headers'
import Script from 'next/script'

// Third-party Imports
import 'react-perfect-scrollbar/dist/css/styles.css'

// Type Imports
import type { ChildrenType } from '@core/types'
import type { Locale } from '@configs/i18n'

// Component Imports
import { getPrimaryColorConfig } from '@configs/primaryColorConfig'

// HOC Imports
import TranslationWrapper from '@/hocs/TranslationWrapper'

// Config Imports
import { i18n } from '@configs/i18n'

// Style Imports
import '@/app/globals.css'

// Generated Icon CSS Imports
import '@assets/iconify-icons/generated-icons.css'


import NextTopLoader from 'nextjs-toploader';


export const metadata = {
  title: 'Taxi Appz Pro',
  description:
    'Taxi Appz Pro - Admin Dashboard Template - is the most developer friendly & highly customizable Admin Dashboard Template based on MUI v5.'
}

const RootLayout = async ({ children, params }: ChildrenType & { params: { lang: Locale } }) => {
  // Vars
  const headersList = headers()
  const direction = i18n.langDirection[params.lang]
  const primaryColor = await getPrimaryColorConfig()

  return (
    <TranslationWrapper headersList={headersList} lang={params.lang}>
      <html id='__next' lang={params.lang} dir={direction}>
        <NextTopLoader
          color={primaryColor}
          initialPosition={0.9}
          crawlSpeed={200}
          height={4}
          showSpinner={false}
          easing="ease"
          speed={200}
        />
        <body className='flex is-full min-bs-full flex-auto flex-col'>
          <Script src="https://script.supademo.com/supademo.js" strategy="afterInteractive" />
          {children}
        </body>
      </html>
    </TranslationWrapper>
  )
}


export default RootLayout
