'use client'

import { useUSDTPrice } from '@/contexts/price-context'
import { formatCurrency, timeAgo } from '@/lib/utils'
import { TrendingUp, Clock } from 'lucide-react'

export function USDTPriceIndicator() {
  const { usdtPrice, isLoading, lastUpdated } = useUSDTPrice()

  if (isLoading && !lastUpdated) {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <div className="animate-pulse">Loading USDT price...</div>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <TrendingUp className="h-3 w-3" />
      <span>USDT: {formatCurrency(usdtPrice)}</span>
      {lastUpdated && (
        <>
          <Clock className="h-3 w-3" />
          <span>Updated {timeAgo(lastUpdated)}</span>
        </>
      )}
      {isLoading && (
        <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
      )}
    </div>
  )
}

// Keep old component for backwards compatibility
export function SOLPriceIndicator() {
  return <USDTPriceIndicator />
}
