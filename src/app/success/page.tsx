'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { motion } from 'framer-motion'
import { Check, ExternalLink, Home } from 'lucide-react'
import Link from 'next/link'

export default function SuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const transactionHash = searchParams.get('tx')
  const artistSlug = searchParams.get('artist')
  const amount = searchParams.get('amount')
  const tokenSymbol = searchParams.get('symbol')

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Purchase Successful!</CardTitle>
            <CardDescription>
              Your token purchase has been completed
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Transaction Details */}
            <div className="space-y-3">
              {amount && tokenSymbol && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tokens Purchased:</span>
                  <span className="font-medium">{amount} {tokenSymbol}</span>
                </div>
              )}
              
              {transactionHash && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Transaction:</span>
                  <span className="font-mono text-sm">
                    {transactionHash.slice(0, 8)}...{transactionHash.slice(-8)}
                  </span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="space-y-3">
              {artistSlug && (
                <Button asChild className="w-full">
                  <Link href={`/artists/${artistSlug}`}>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View Artist Campaign
                  </Link>
                </Button>
              )}
              
              <Button asChild variant="outline" className="w-full">
                <Link href="/wallet">
                  View Your Wallet
                </Link>
              </Button>
              
              <Button asChild variant="ghost" className="w-full">
                <Link href="/">
                  <Home className="h-4 w-4 mr-2" />
                  Back to Home
                </Link>
              </Button>
            </div>

            {/* Additional Info */}
            <div className="text-center text-sm text-muted-foreground border-t pt-4">
              <p>Your tokens will appear in your wallet shortly.</p>
              <p>Check your eligible perks on the artist's page!</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}