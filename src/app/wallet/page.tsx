'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { motion } from 'framer-motion'
import { 
  Wallet as WalletIcon, 
  Coins, 
  Gift, 
  ExternalLink,
  Users,
  TrendingUp
} from 'lucide-react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

interface Purchase {
  id: string
  artist_id: string
  tokens_purchased: number
  sol_paid: number
  timestamp: string
  transaction_hash: string
  artist: {
    name: string
    slug: string
    token_symbol: string
  }
}

interface ArtistWithPurchases {
  artist_id: string
  artist_name: string
  artist_slug: string
  token_symbol: string
  total_tokens: number
  total_spent: number
  eligible_perks: Array<{
    title: string
    description: string
    token_threshold: number
  }>
}

export default function CollectorWallet() {
  const { user, loading: authLoading } = useAuth()
  const { connected, publicKey } = useWallet()
  const router = useRouter()
  
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [artistSummary, setArtistSummary] = useState<ArtistWithPurchases[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/auth/signin')
        return
      }
      if (connected && publicKey) {
        loadWalletData()
      } else {
        setLoading(false)
      }
    }
  }, [user, authLoading, connected, publicKey, router])

  const loadWalletData = async () => {
    if (!connected || !publicKey) return

    try {
      // Load purchases for this wallet
      const { data: purchasesData, error: purchasesError } = await supabase
        .from('purchases')
        .select(`
          *,
          artist:artists!inner(name, slug, token_symbol)
        `)
        .eq('collector_wallet', publicKey.toBase58())
        .order('timestamp', { ascending: false })

      if (purchasesError) throw purchasesError
      
      const typedPurchases = purchasesData.map(p => ({
        ...p,
        artist: Array.isArray(p.artist) ? p.artist[0] : p.artist
      })) as Purchase[]
      
      setPurchases(typedPurchases)

      // Group purchases by artist and calculate totals
      const artistMap = new Map<string, {
        artist_id: string
        artist_name: string
        artist_slug: string
        token_symbol: string
        total_tokens: number
        total_spent: number
      }>()

      typedPurchases.forEach(purchase => {
        const artistId = purchase.artist_id
        const existing = artistMap.get(artistId) || {
          artist_id: artistId,
          artist_name: purchase.artist.name,
          artist_slug: purchase.artist.slug,
          token_symbol: purchase.artist.token_symbol,
          total_tokens: 0,
          total_spent: 0
        }
        
        existing.total_tokens += purchase.tokens_purchased
        existing.total_spent += purchase.sol_paid
        artistMap.set(artistId, existing)
      })

      // Load perks for each artist and determine eligibility
      const artistSummaries: ArtistWithPurchases[] = []
      
      for (const [artistId, summary] of artistMap) {
        const { data: perksData, error: perksError } = await supabase
          .from('perks')
          .select('*')
          .eq('artist_id', artistId)
          .order('token_threshold', { ascending: true })

        if (perksError) throw perksError

        const eligiblePerks = (perksData || []).filter(
          perk => summary.total_tokens >= perk.token_threshold
        )

        artistSummaries.push({
          ...summary,
          eligible_perks: eligiblePerks
        })
      }

      setArtistSummary(artistSummaries)

    } catch (err: any) {
      setError(err.message || 'Failed to load wallet data')
    } finally {
      setLoading(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!connected || !publicKey) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl mx-auto text-center"
          >
            <Card>
              <CardHeader>
                <WalletIcon className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <CardTitle>Connect Your Wallet</CardTitle>
                <CardDescription>
                  Connect your Solana wallet to view your token holdings and transaction history
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <WalletMultiButton className="w-full !bg-primary !text-primary-foreground" />
                
                <div className="text-sm text-muted-foreground">
                  <p>Your wallet will show:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Token holdings from artists you've supported</li>
                    <li>Transaction history</li>
                    <li>Eligible perks and rewards</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    )
  }

  const totalTokens = artistSummary.reduce((sum, artist) => sum + artist.total_tokens, 0)
  const totalSpent = artistSummary.reduce((sum, artist) => sum + artist.total_spent, 0)
  const totalPerks = artistSummary.reduce((sum, artist) => sum + artist.eligible_perks.length, 0)

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-2">Your Wallet</h1>
          <p className="text-lg text-muted-foreground">
            Track your investments and rewards
          </p>
          <div className="mt-4 p-3 bg-muted rounded-lg inline-flex items-center">
            <span className="text-sm font-mono">
              {publicKey.toBase58().slice(0, 8)}...{publicKey.toBase58().slice(-8)}
            </span>
          </div>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Invested</p>
                  <p className="text-2xl font-bold">{totalSpent.toFixed(2)} SOL</p>
                </div>
                <TrendingUp className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Tokens</p>
                  <p className="text-2xl font-bold">{totalTokens}</p>
                </div>
                <Coins className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Eligible Perks</p>
                  <p className="text-2xl font-bold">{totalPerks}</p>
                </div>
                <Gift className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {artistSummary.length > 0 ? (
            <Tabs defaultValue="holdings" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="holdings">Holdings</TabsTrigger>
                <TabsTrigger value="perks">Perks</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
              </TabsList>

              <TabsContent value="holdings" className="mt-6">
                <div className="grid gap-6">
                  {artistSummary.map((artist) => (
                    <Card key={artist.artist_id}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="flex items-center gap-2">
                              {artist.artist_name}
                              <Link 
                                href={`/artists/${artist.artist_slug}`}
                                className="text-muted-foreground hover:text-foreground"
                              >
                                <ExternalLink className="h-4 w-4" />
                              </Link>
                            </CardTitle>
                            <CardDescription>
                              Token: {artist.token_symbol}
                            </CardDescription>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold">{artist.total_tokens}</div>
                            <div className="text-sm text-muted-foreground">tokens owned</div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex justify-between text-sm">
                          <span>Total invested:</span>
                          <span className="font-medium">{artist.total_spent.toFixed(3)} SOL</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="perks" className="mt-6">
                <div className="space-y-6">
                  {artistSummary.map((artist) => (
                    <Card key={artist.artist_id}>
                      <CardHeader>
                        <CardTitle>{artist.artist_name}</CardTitle>
                        <CardDescription>
                          You own {artist.total_tokens} {artist.token_symbol} tokens
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {artist.eligible_perks.length > 0 ? (
                          <div className="space-y-3">
                            {artist.eligible_perks.map((perk, index) => (
                              <div key={index} className="p-3 bg-green-50 border border-green-200 rounded-lg">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <h4 className="font-medium text-green-900">{perk.title}</h4>
                                    <p className="text-sm text-green-700 mt-1">{perk.description}</p>
                                  </div>
                                  <div className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                                    Eligible ✓
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-6">
                            <Gift className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                            <p className="text-sm text-muted-foreground">
                              No perks available with your current token amount
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="history" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Transaction History</CardTitle>
                    <CardDescription>
                      All your token purchases on Palette
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {purchases.map((purchase) => (
                        <div key={purchase.id} className="flex justify-between items-center p-4 border rounded-lg">
                          <div>
                            <div className="font-medium">{purchase.artist.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {new Date(purchase.timestamp).toLocaleString()}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">
                              {purchase.tokens_purchased} {purchase.artist.token_symbol}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {purchase.sol_paid} SOL
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Coins className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No tokens yet</h3>
                <p className="text-muted-foreground mb-6">
                  You haven't purchased any tokens yet. Start by supporting an artist!
                </p>
                <Button asChild>
                  <Link href="/">Explore Artists</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  )
}