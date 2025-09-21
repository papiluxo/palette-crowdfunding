'use client'

import { ReactNode, useMemo } from 'react'
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import { clusterApiUrl } from '@solana/web3.js'
import { AuthProvider } from '@/contexts/auth-context'
import { PriceProvider } from '@/contexts/price-context'

// Import wallet adapter CSS
import '@solana/wallet-adapter-react-ui/styles.css'

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  const network = process.env.NEXT_PUBLIC_SOLANA_NETWORK === 'mainnet-beta' 
    ? WalletAdapterNetwork.Mainnet 
    : WalletAdapterNetwork.Devnet
  
  const endpoint = useMemo(() => {
    // Use custom RPC URL if provided, otherwise fall back to default cluster URL
    return process.env.NEXT_PUBLIC_SOLANA_RPC_URL || clusterApiUrl(network)
  }, [network])

  // Use Wallet Standard (no explicit adapters)
  const wallets = useMemo(() => [], [])

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <PriceProvider>
            <AuthProvider>
              {children}
            </AuthProvider>
          </PriceProvider>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}