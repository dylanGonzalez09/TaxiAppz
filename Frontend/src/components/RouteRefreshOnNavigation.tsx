'use client'

import { useEffect, useRef } from 'react'

import { usePathname, useRouter } from 'next/navigation'

const RouteRefreshOnNavigation = () => {
  const router = useRouter()
  const pathname = usePathname()
  const lastPathRef = useRef<string | null>(null)

  useEffect(() => {
    if (!pathname) return

    // First mount: just store path; no refresh needed.
    if (lastPathRef.current === null) {
      lastPathRef.current = pathname
     
      return
    }

    // Any route change should fetch latest server data for that route.
    if (lastPathRef.current !== pathname) {
      lastPathRef.current = pathname
      router.refresh()
    }
  }, [pathname, router])

  return null
}

export default RouteRefreshOnNavigation
