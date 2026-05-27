'use client'

import { useParams, usePathname, useRouter, useSearchParams } from 'next/navigation'

import ArrowBack from '@mui/icons-material/ArrowBack'
import Button from '@mui/material/Button'

interface BackButtonProps {
  dictionary?: Record<string, any>
  backPath?: string
}

const BackButton: React.FC<BackButtonProps> = ({ dictionary, backPath }) => {
  const router = useRouter()
  const params = useParams()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const lang = String(params?.lang ?? 'en')
  const zoneId = String(params?.zoneId ?? '')
  const returnPage = searchParams?.get('returnPage')
  const returnPageSize = searchParams?.get('returnPageSize')
  const returnSearch = searchParams?.get('returnSearch')
  const returnUserTypeFilter = searchParams?.get('returnUserTypeFilter')
  const returnSpecialSubFilter = searchParams?.get('returnSpecialSubFilter')
  const returnModule = searchParams?.get('returnModule')
  const returnTab = searchParams?.get('returnTab')
  const label = dictionary?.navigation?.Back ?? 'Back'
  const isWalletUserView = pathname?.includes('/wallet/user/view')

  const handleBack = () => {
    if (pathname?.includes('/apps/taxi/request/requestView') && returnModule) {
      const q = new URLSearchParams()

      if (returnTab) q.set('tab', returnTab)
      if (returnPage) q.set('page', returnPage)
      if (returnPageSize) q.set('pageSize', returnPageSize)
      if (returnSearch) q.set('search', returnSearch)

      const zoneSegment = zoneId ? `/${zoneId}` : ''
      const listPath = returnModule === 'rideLater' ? 'apps/taxi/request/ridelater' : 'apps/taxi/request/ridenow'
      const path = `/${lang}${zoneSegment}/${listPath}${q.toString() ? `?${q.toString()}` : ''}`

      router.push(path)
      
return
    }

    if (returnPage || returnPageSize || returnSearch || returnUserTypeFilter || returnSpecialSubFilter) {
      const q = new URLSearchParams()

      if (returnPage) q.set('page', returnPage)
      if (returnPageSize) q.set('pageSize', returnPageSize)
      if (returnSearch) q.set('search', returnSearch)
      if (returnUserTypeFilter) q.set('userTypeFilter', returnUserTypeFilter)
      if (returnSpecialSubFilter) q.set('specialSubFilter', returnSpecialSubFilter)

      const listPath = backPath || (isWalletUserView ? 'apps/taxi/user/list' : 'apps/taxi/user/list')
      const zoneSegment = zoneId ? `/${zoneId}` : ''
      const path = `/${lang}${zoneSegment}/${listPath}${q.toString() ? `?${q.toString()}` : ''}`

      router.push(path)
      
return
    }

    if (backPath) {
      const zoneSegment = zoneId ? `/${zoneId}` : ''
      const path = `/${lang}${zoneSegment}/${backPath}`

      router.push(path)
      
return
    }

    router.back()
  }

  return (
    <Button variant='tonal' color='secondary' startIcon={<ArrowBack />} onClick={handleBack} sx={{ mb: 2 }}>
      {label}
    </Button>
  )
}

export default BackButton

// 'use client'

// import { useRouter, useParams, useSearchParams } from 'next/navigation'

// import Button from '@mui/material/Button'
// import ArrowBack from '@mui/icons-material/ArrowBack'

// interface BackButtonProps {
//   dictionary?: Record<string, any>
//   backPath?: string // Optional path to navigate back to (e.g., 'apps/taxi/driver/list')
//   preserveQueryParams?: boolean // Whether to preserve query params from URL
// }

// const BackButton: React.FC<BackButtonProps> = ({ dictionary, backPath, preserveQueryParams = false }) => {
//   const router = useRouter()
//   const params = useParams()
//   const searchParams = useSearchParams()
//   const lang = params?.lang ?? 'en'
//   const label = dictionary?.['navigation']?.Back ?? 'Back'

//   const handleBack = () => {
//     if (backPath) {
//       // Build query string if we need to preserve params
//       let queryString = ''

//       if (preserveQueryParams) {
//         const returnPage = searchParams?.get('returnPage')
//         const returnPageSize = searchParams?.get('returnPageSize')
//         const returnSearch = searchParams?.get('returnSearch')
//         const returnUserTypeFilter = searchParams?.get('returnUserTypeFilter')
//         const returnSpecialSubFilter = searchParams?.get('returnSpecialSubFilter')

//         if (returnPage || returnPageSize || returnSearch || returnUserTypeFilter || returnSpecialSubFilter) {
//           const q = new URLSearchParams()

//           if (returnPage) q.set('page', returnPage)
//           if (returnPageSize) q.set('pageSize', returnPageSize)
//           if (returnSearch) q.set('search', returnSearch)
//           if (returnUserTypeFilter) q.set('userTypeFilter', returnUserTypeFilter)
//           if (returnSpecialSubFilter) q.set('specialSubFilter', returnSpecialSubFilter)
//           queryString = `?${q.toString()}`
//         }
//       }

//       const path = `/${lang}/${backPath}${queryString}`

//       router.push(path)
//     } else {
//       router.back()
//     }
//   }

//   return (
//     <Button
//       variant='contained'
//       color='primary'
//       startIcon={<ArrowBack />}
//       onClick={handleBack}
//       sx={{ mb: 2 }}
//     >
//       {label}
//     </Button>
//   )
// }

// export default BackButton
