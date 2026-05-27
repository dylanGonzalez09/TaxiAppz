'use client'

import { useEffect } from 'react'

import { usePathname, useRouter } from 'next/navigation'

const shouldSkipRefreshOnCurrentPage = (pathname: string | null) => {
  if (!pathname) return false

  // Avoid refresh while user is actively managing translation keys.
  return /\/translation(\/|$)/i.test(pathname)
}

const TranslationUpdateSync = () => {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const onTranslationUpdated = () => {
      if (shouldSkipRefreshOnCurrentPage(pathname)) return
      router.refresh()
    }

    window.addEventListener('translationUpdated', onTranslationUpdated)

    return () => {
      window.removeEventListener('translationUpdated', onTranslationUpdated)
    }
  }, [pathname, router])

  return null
}

export default TranslationUpdateSync
