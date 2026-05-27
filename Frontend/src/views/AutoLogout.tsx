'use client'

import { useEffect } from 'react'

import { signOut } from 'next-auth/react'

const AutoLogout = () => {
  useEffect(() => {

    localStorage.removeItem('isDemoUser')
    localStorage.removeItem('newZoneId')
    localStorage.removeItem('userRole')
    localStorage.removeItem('moduleSettings')

    signOut({
      callbackUrl: process.env.NEXT_PUBLIC_APP_URL || '/', 
    })
  }, [])

  return null
}

export default AutoLogout
