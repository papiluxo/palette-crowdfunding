'use client'

import { useState, useEffect } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Wallet, X, Sparkles, ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { getUSDTBalance } from '@/lib/solana'

export function FloatingWallet() {
  const [isExpanded, setIsExpanded] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const { connected, select, wallets, connecting, disconnect, publicKey, wallet } = useWallet()
  const [error, setError] = useState<string>('')
  const [isSelecting, setIsSelecting] = useState(false)
  const [isDisconnecting, setIsDisconnecting] = useState(false)
  const [showOtherProviders, setShowOtherProviders] = useState(false)
  const [usdtBalance, setUsdtBalance] = useState<number | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Fetch USDT balance when wallet is connected
  useEffect(() => {
    const fetchBalance = async () => {
      if (connected && publicKey) {
        try {
          const balance = await getUSDTBalance(publicKey)
          setUsdtBalance(balance)
        } catch (error) {
          console.error('Failed to fetch USDT balance:', error)
          setUsdtBalance(0)
        }
      } else {
        setUsdtBalance(null)
      }
    }

    fetchBalance()
  }, [connected, publicKey])

  // Scroll direction detection for mobile
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      
      // Only hide/show on mobile (screen width < 768px)
      if (window.innerWidth >= 768) {
        setIsVisible(true)
        return
      }
      
      // Show if at the top
      if (currentScrollY < 10) {
        setIsVisible(true)
      } 
      // Hide when scrolling down, show when scrolling up
      else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false)
        setIsExpanded(false) // Close expanded state when hiding
      } else if (currentScrollY < lastScrollY) {
        setIsVisible(true)
      }
      
      setLastScrollY(currentScrollY)
    }

    // Throttle scroll events for better performance
    let ticking = false
    const scrollHandler = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll()
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener('scroll', scrollHandler, { passive: true })
    
    return () => {
      window.removeEventListener('scroll', scrollHandler)
    }
  }, [lastScrollY])

  if (!mounted) {
    return null
  }

  const desiredNames = new Set(['MetaMask', 'Phantom', 'Solflare', 'Torus'])
  const allWallets = wallets ?? []
  const curatedWallets = allWallets.filter(w => desiredNames.has(w.adapter.name))
  const otherWallets = allWallets.filter(w => !desiredNames.has(w.adapter.name))

  const handleSelectWallet = async (walletName: string) => {
    try {
      setError('')
      setIsSelecting(true)
      select(walletName)
      setIsExpanded(false)
      setShowOtherProviders(false)
    } catch (e: any) {
      const message = e?.message || 'Failed to select wallet'
      setError(message)
    } finally {
      setIsSelecting(false)
    }
  }

  const handleDisconnect = async () => {
    try {
      setIsDisconnecting(true)
      setError('')
      await disconnect()
    } catch (e: any) {
      setError(e?.message || 'Failed to disconnect')
    } finally {
      setIsDisconnecting(false)
    }
  }

  const shortKey = publicKey ? `${publicKey.toBase58().slice(0, 4)}…${publicKey.toBase58().slice(-4)}` : ''
  const currentWalletName = wallet?.adapter?.name

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          className="fixed bottom-6 right-6 z-50"
          initial={{ opacity: 0, y: 100, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 100, scale: 0.8 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        >
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                className="absolute bottom-16 right-0 bg-background/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl p-6 min-w-[320px]"
              >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                  <Sparkles className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-foreground">{showOtherProviders ? 'Other Wallet Providers' : 'Connect Wallet'}</h3>
                  <p className="text-xs text-muted-foreground">
                    {showOtherProviders ? 'Choose from all detected wallets' : 'Choose your preferred wallet'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {showOtherProviders && (
                  <button
                    onClick={() => setShowOtherProviders(false)}
                    className="w-8 h-8 rounded-lg bg-muted/50 hover:bg-muted flex items-center justify-center transition-colors"
                    aria-label="Back"
                  >
                    <ArrowLeft className="h-4 w-4 text-muted-foreground" />
                  </button>
                )}
                <button
                  onClick={() => {
                    setIsExpanded(false)
                    setShowOtherProviders(false)
                  }}
                  className="w-8 h-8 rounded-lg bg-muted/50 hover:bg-muted flex items-center justify-center transition-colors"
                  aria-label="Close"
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              </div>
            </div>

            {/* Connected state */}
            {connected && (
              <div className="w-full mb-3">
                <div className="text-xs text-muted-foreground text-center mb-2">
                  Connected {currentWalletName ? `with ${currentWalletName}` : ''} {shortKey ? `(${shortKey})` : ''}
                </div>
                {usdtBalance !== null && (
                  <div className="text-center mb-2 p-2 bg-muted/50 rounded-lg">
                    <div className="text-sm font-medium">
                      ${usdtBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT
                    </div>
                    <div className="text-xs text-muted-foreground">Available Balance</div>
                  </div>
                )}
                <Button
                  variant="destructive"
                  className="w-full justify-center"
                  disabled={isDisconnecting}
                  onClick={handleDisconnect}
                >
                  {isDisconnecting ? 'Disconnecting…' : 'Disconnect Wallet'}
                </Button>
              </div>
            )}

            {/* Curated wallet list */}
            {!connected && !showOtherProviders && (
              <div className="w-full mt-2">
                <div className="grid grid-cols-1 gap-2">
                  {curatedWallets.map(w => (
                    <Button
                      key={w.adapter.name}
                      variant="outline"
                      className="w-full justify-center"
                      disabled={connecting || isSelecting}
                      onClick={() => handleSelectWallet(w.adapter.name)}
                    >
                      {connecting || isSelecting ? 'Connecting…' : `Connect ${w.adapter.name}`}
                    </Button>
                  ))}
                </div>

                {/* Always show link to other providers */}
                <button
                  type="button"
                  className="mt-3 w-full text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
                  onClick={() => setShowOtherProviders(true)}
                >
                  Other wallet providers
                </button>

                {error && (
                  <p className="text-xs text-destructive mt-2 text-center">{error}</p>
                )}
              </div>
            )}

            {/* Other providers list */}
            {!connected && showOtherProviders && (
              <div className="w-full mt-2">
                <div className="grid grid-cols-1 gap-2 max-h-64 overflow-auto pr-1">
                  {otherWallets.map(w => (
                    <Button
                      key={w.adapter.name}
                      variant="outline"
                      className="w-full justify-center"
                      disabled={connecting || isSelecting}
                      onClick={() => handleSelectWallet(w.adapter.name)}
                    >
                      {connecting || isSelecting ? 'Connecting…' : `Connect ${w.adapter.name}`}
                    </Button>
                  ))}
                </div>
                {otherWallets.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center">No other providers detected</p>
                )}
                {error && (
                  <p className="text-xs text-destructive mt-2 text-center">{error}</p>
                )}
              </div>
            )}

            {/* Info Text */}
            <div className="text-center mt-2">
              <p className="text-xs text-muted-foreground leading-relaxed">
                Connect your Solana wallet to support creators with USDT and manage your campaign tokens
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

          {/* Floating Button */}
          <motion.button
            data-testid="floating-wallet-button"
            whileHover={{ scale: 1.05, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsExpanded(!isExpanded)}
            className={cn(
              'flex items-center justify-center w-16 h-16 rounded-2xl shadow-2xl',
              'bg-gradient-to-br from-primary to-primary/90 text-primary-foreground',
              'hover:from-primary/90 hover:to-primary/80',
              'transition-all duration-300 ease-out',
              'border-2 border-primary/20 hover:border-primary/30',
              'backdrop-blur-sm',
              connected && 'ring-2 ring-green-500/50'
            )}
          >
            <Wallet className="h-7 w-7" />
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  )
} 