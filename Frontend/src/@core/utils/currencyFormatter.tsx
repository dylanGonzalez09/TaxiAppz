'use client'
import { useCurrency } from '@core/contexts/CurrencyContext'

/**
 * Format currency using the default country's currency settings
 * @param amount - The amount to format
 * @param options - Optional formatting options
 * @returns Formatted currency string
 */
export const useFormatCurrency = () => {
  const { currencyInfo, loading } = useCurrency()

  const formatCurrency = (amount: number | string, options?: {
    showSymbol?: boolean
    minimumFractionDigits?: number
    maximumFractionDigits?: number
  }) => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
    
    if (isNaN(numAmount)) {
      return `${currencyInfo.currencySymbol}0.00`
    }

    const {
      showSymbol = true,
      minimumFractionDigits = 2,
      maximumFractionDigits = 2
    } = options || {}

    if (loading) {
      // Return a placeholder while loading
      return `${currencyInfo.currencySymbol}${(numAmount || 0).toFixed(minimumFractionDigits)}`
    }

    try {
      // Use Intl.NumberFormat for proper number formatting (without currency style)
      // Then prepend our currency symbol
      const formatted = new Intl.NumberFormat('en-US', {
        minimumFractionDigits,
        maximumFractionDigits
      }).format(numAmount || 0)

      // If showSymbol is false, return just the number
      if (!showSymbol) {
        return formatted
      }

      // Prepend our currency symbol
      return `${currencyInfo.currencySymbol}${formatted}`
    } catch (error) {
      // Fallback formatting
      return `${currencyInfo.currencySymbol}${(numAmount || 0).toFixed(minimumFractionDigits)}`
    }
  }

  return {
    formatCurrency,
    currencyInfo,
    loading
  }
}

/**
 * Simple currency formatter that uses default currency symbol
 * This is a synchronous version that uses cached/default values
 */
export const formatCurrencySimple = (amount: number | string, currencySymbol: string = '$'): string => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
  
  if (isNaN(numAmount)) {
    return `${currencySymbol}0.00`
  }

  return `${currencySymbol}${(numAmount || 0).toFixed(2)}`
}
