'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'

interface PriceContextType {
  usdtPrice: number
  isLoading: boolean
  lastUpdated: Date | null
}

const PriceContext = createContext<PriceContextType | undefined>(undefined)

async function fetchUSDTPrice(): Promise<number> {
  // USDT is a stablecoin pegged to USD, so it's always $1
  // We could still fetch from API for completeness, but return 1.0
  try {
    // Optional: fetch real USDT price for accuracy (usually very close to $1)
    const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=tether&vs_currencies=usd')
    const data = await response.json()
    return data.tether?.usd || 1.0 // Fallback to $1
  } catch (error) {
    console.warn('Failed to fetch USDT price:', error)
    return 1.0 // Stable fallback price
  }
}

export function PriceProvider({ children }: { children: ReactNode }) {
  const [usdtPrice, setUsdtPrice] = useState(1.0) // Start with $1 (stable)
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const updatePrice = async () => {
    try {
      setIsLoading(true)
      const newPrice = await fetchUSDTPrice()
      setUsdtPrice(newPrice)
      setLastUpdated(new Date())
    } catch (error) {
      console.error('Failed to update USDT price:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    // Fetch price immediately
    updatePrice()

    // Set up interval to update every hour (USDT is stable, less frequent updates needed)
    const interval = setInterval(updatePrice, 3600000) // 1 hour

    return () => clearInterval(interval)
  }, [])

  const value = {
    usdtPrice,
    isLoading,
    lastUpdated
  }

  return (
    <PriceContext.Provider value={value}>
      {children}
    </PriceContext.Provider>
  )
}

export function useUSDTPrice() {
  const context = useContext(PriceContext)
  if (context === undefined) {
    throw new Error('useUSDTPrice must be used within a PriceProvider')
  }
  return context
}

// Keep backwards compatibility with old hook name for now
export function useSOLPrice() {
  const context = useContext(PriceContext)
  if (context === undefined) {
    throw new Error('useSOLPrice must be used within a PriceProvider')
  }
  // Return USDT price as solPrice for backwards compatibility during transition
  return {
    solPrice: context.usdtPrice,
    isLoading: context.isLoading,
    lastUpdated: context.lastUpdated
  }
}
