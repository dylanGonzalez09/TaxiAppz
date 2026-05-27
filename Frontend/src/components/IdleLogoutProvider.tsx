'use client'

import { useEffect, useRef } from 'react'

import { signOut } from 'next-auth/react'

const IdleLogoutProvider = ({ timeout = 5 * 60 * 1000 }: { timeout?: number }) => {
  const timer = useRef<NodeJS.Timeout | null>(null)

  // Reset timer on user interaction
  const resetTimer = () => {
    if (timer.current) clearTimeout(timer.current)

    timer.current = setTimeout(() => {
      signOut({ callbackUrl: '/' }) // You can redirect to login/home page
    }, timeout)
  }

  useEffect(() => {
    const events = ['mousemove', 'keydown', 'scroll', 'click']

    for (const event of events) {
      window.addEventListener(event, resetTimer)
    }

    resetTimer() // start timer initially

    return () => {
      if (timer.current) clearTimeout(timer.current)
     
        for (const event of events) {
        window.removeEventListener(event, resetTimer)
      }
    }
  }, [timeout])

  return null // This component doesn't render anything
}

export default IdleLogoutProvider
