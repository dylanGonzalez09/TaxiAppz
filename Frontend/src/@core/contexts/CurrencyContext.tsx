/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'

import { fetchSettings } from '@/app/api/apps/taxi/setting'
import { getCountryId } from '@/app/api/apps/taxi/country'

interface CurrencyInfo {
  currencyCode: string
  currencySymbol: string
  countryId: string | null
}

interface CurrencyContextType {
  currencyInfo: CurrencyInfo
  loading: boolean
  refreshCurrency: () => Promise<void>
}

const defaultCurrency: CurrencyInfo = {
  currencyCode: 'USD',
  currencySymbol: '$',
  countryId: null
}

const CurrencyContext = createContext<CurrencyContextType>({
  currencyInfo: defaultCurrency,
  loading: true,
  refreshCurrency: async () => {}
})

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currencyInfo, setCurrencyInfo] = useState<CurrencyInfo>(defaultCurrency)
  const [loading, setLoading] = useState(true)

  const fetchDefaultCurrency = useCallback(async () => {
    try {
      setLoading(true)
      
      // Fetch settings to get default country
      const settings = await fetchSettings()
      
      if (!settings || settings.length === 0) {
        console.warn('No settings found')
        setCurrencyInfo(defaultCurrency)
        
return
      }
      
      const generalSettings = settings.find((item: any) => item._id === 'general')
      
      if (!generalSettings?.settings) {
        console.warn('General settings not found')
        setCurrencyInfo(defaultCurrency)
        
return
      }
      
      // Find defaultCountry setting
      const defaultCountrySetting = generalSettings.settings.find(
        (s: any) => s.name === 'defaultCountry'
      )

      if (!defaultCountrySetting?.value) {
        console.warn('No default country set in settings')
        setCurrencyInfo(defaultCurrency)
        
return
      }

      const defaultCountryId = defaultCountrySetting.value


      // Fetch country details to get currency
      const country = await getCountryId(defaultCountryId)
      
      if (!country) {
        console.warn('Country not found for ID:', defaultCountryId)
        setCurrencyInfo(defaultCurrency)
        
return
      }

      if (!country.currency_symbol) {
        console.warn('Country found but missing currency_symbol:', country.name, country)
        setCurrencyInfo(defaultCurrency)
        
return
      }

      // Successfully fetched country with currency
      const newCurrencyInfo = {
        currencyCode: country.currency_code || 'USD',
        currencySymbol: country.currency_symbol,
        countryId: defaultCountryId
      }
      
      setCurrencyInfo(newCurrencyInfo)
     
    } catch (error) {
      console.error('❌ Error fetching default currency:', error)
      setCurrencyInfo(defaultCurrency)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDefaultCurrency()

    // Listen for custom event when settings are updated
    const handleSettingsUpdate = (event: Event) => {
      fetchDefaultCurrency()
    }

    window.addEventListener('settingsUpdated', handleSettingsUpdate)

    return () => {
      window.removeEventListener('settingsUpdated', handleSettingsUpdate)
    }
  }, [fetchDefaultCurrency])

  return (
    <CurrencyContext.Provider value={{ currencyInfo, loading, refreshCurrency: fetchDefaultCurrency }}>
      {children}
    </CurrencyContext.Provider>
  )
}

export const useCurrency = () => {
  const context = useContext(CurrencyContext)

  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider')
  }

  
return context
}
