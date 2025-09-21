import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNumber(num: number, decimals = 2): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(num)
}

export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency
  }).format(amount)
}

export function formatUSDT(amount: number): string {
  return `${formatNumber(amount, 2)} USDT`
}

// USDT is a stablecoin pegged to USD at 1:1
export function usdtToUSD(usdtAmount: number): number {
  return usdtAmount // USDT is pegged 1:1 with USD
}

export function formatUSDTWithUSD(amount: number): string {
  // Since USDT ≈ USD, we can just show the USDT amount
  return `${formatNumber(amount, 2)} USDT`
}

export function formatUSDFromUSDT(usdtAmount: number): string {
  return formatCurrency(usdtToUSD(usdtAmount))
}

// Backwards compatibility functions (for transition period)
export function formatSOL(amount: number): string {
  return `${formatNumber(amount, 2)} USDT`
}

export async function solToUSD(usdtAmount: number): Promise<number> {
  return usdtToUSD(usdtAmount)
}

export function solToUSDSync(usdtAmount: number, _price?: number): number {
  return usdtToUSD(usdtAmount)
}

export async function formatSOLWithUSD(amount: number): Promise<string> {
  return formatUSDTWithUSD(amount)
}

export async function formatUSDFromSOL(usdtAmount: number): Promise<string> {
  return formatUSDFromUSDT(usdtAmount)
}

export function formatUSDFromSOLSync(usdtAmount: number, _price?: number): string {
  return formatUSDFromUSDT(usdtAmount)
}

export function formatSOLWithUSDSync(amount: number, _price?: number): string {
  return formatUSDTWithUSD(amount)
}

export function truncateAddress(address: string, chars = 4): string {
  if (address.length <= chars * 2 + 3) return address
  return `${address.slice(0, chars)}...${address.slice(-chars)}`
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function calculateProgress(current: number, goal: number): number {
  if (goal === 0) return 0
  return Math.min((current / goal) * 100, 100)
}

export function timeAgo(date: string | Date): string {
  const now = new Date()
  const past = new Date(date)
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000)

  const intervals = [
    { label: 'year', seconds: 31536000 },
    { label: 'month', seconds: 2592000 },
    { label: 'week', seconds: 604800 },
    { label: 'day', seconds: 86400 },
    { label: 'hour', seconds: 3600 },
    { label: 'minute', seconds: 60 },
    { label: 'second', seconds: 1 }
  ]

  for (const interval of intervals) {
    const count = Math.floor(diffInSeconds / interval.seconds)
    if (count >= 1) {
      return `${count} ${interval.label}${count !== 1 ? 's' : ''} ago`
    }
  }

  return 'just now'
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validateTokenSymbol(symbol: string): boolean {
  // Token symbol should be 3-6 characters, alphanumeric
  const symbolRegex = /^[A-Z0-9]{3,6}$/
  return symbolRegex.test(symbol.toUpperCase())
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export function copyToClipboard(text: string): Promise<void> {
  return navigator.clipboard.writeText(text)
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}