'use client'

import { forwardRef } from 'react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { cn } from '@/lib/utils'

interface WalletButtonProps {
  className?: string
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

export const WalletButton = forwardRef<HTMLButtonElement, WalletButtonProps>(
  ({ className, variant = 'default', size = 'sm', ...props }, ref) => {
    return (
      <div className={cn(
        'wallet-button-wrapper',
        className
      )}>
        <WalletMultiButton 
          className={cn(
            'wallet-adapter-button-custom',
            'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50',
            {
              'bg-primary text-primary-foreground shadow hover:bg-primary/90': variant === 'default',
              'border border-input bg-background hover:bg-accent hover:text-accent-foreground': variant === 'outline',
              'hover:bg-accent hover:text-accent-foreground': variant === 'ghost',
              'h-8 px-3 text-xs': size === 'sm',
              'h-9 px-4': size === 'md',
              'h-10 px-8': size === 'lg',
            }
          )}
          {...props}
        />
      </div>
    )
  }
)

WalletButton.displayName = 'WalletButton' 