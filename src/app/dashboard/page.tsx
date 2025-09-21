'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { motion } from 'framer-motion'
import { 
  DollarSign, 
  Users, 
  Target, 
  TrendingUp, 
  Download,
  ExternalLink,
  Settings,
  Plus
} from 'lucide-react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

interface Artist {
  id: string
  email: string
  name: string
  bio: string | null
  fundraising_goal: number
  token_symbol: string
  token_address: string | null
  supply: number
  price: number
  slug: string
  created_at: string
}

interface Purchase {
  id: string
  collector_wallet: string
  tokens_purchased: number
  sol_paid: number
  timestamp: string
  transaction_hash: string
}

interface Perk {
  id: string
  title: string
  description: string
  token_threshold: number
}

export default function ArtistDashboard() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  
  const [artist, setArtist] = useState<Artist | null>(null)
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [perks, setPerks] = useState<Perk[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/auth/signin')
        return
      }
      loadDashboardData()
    }
  }, [user, authLoading, router])

  const loadDashboardData = async () => {
    if (!user) return

    try {
      // Load artist profile
      const { data: artistData, error: artistError } = await supabase
        .from('artists')
        .select('*')
        .eq('email', user.email)
        .single()

      if (artistError) {
        if (artistError.code === 'PGRST116') {
          // No artist profile found
          setError('No artist profile found. Create a campaign first.')
          setLoading(false)
          return
        }
        throw artistError
      }

      setArtist(artistData)

      // Load purchases
      const { data: purchasesData, error: purchasesError } = await supabase
        .from('purchases')
        .select('*')
        .eq('artist_id', artistData.id)
        .order('timestamp', { ascending: false })

      if (purchasesError) throw purchasesError
      setPurchases(purchasesData || [])

      // Load perks
      const { data: perksData, error: perksError } = await supabase
        .from('perks')
        .select('*')
        .eq('artist_id', artistData.id)
        .order('token_threshold', { ascending: true })

      if (perksError) throw perksError
      setPerks(perksData || [])

    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const downloadSupportersCSV = () => {
    if (purchases.length === 0) return

    const csvData = [
      ['Wallet Address', 'Tokens Purchased', 'SOL Paid', 'Date', 'Transaction Hash'],
      ...purchases.map(p => [
        p.collector_wallet,
        p.tokens_purchased.toString(),
        p.sol_paid.toString(),
        new Date(p.timestamp).toISOString(),
        p.transaction_hash
      ])
    ]

    const csvContent = csvData.map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `supporters-${artist?.slug}-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error || !artist) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>No Campaign Found</CardTitle>
            <CardDescription>
              {error || 'You haven\'t created a campaign yet.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button asChild className="w-full">
              <Link href="/create">Create Campaign</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/">Back to Home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const totalRaised = purchases.reduce((sum, purchase) => sum + purchase.sol_paid, 0)
  const totalTokensSold = purchases.reduce((sum, purchase) => sum + purchase.tokens_purchased, 0)
  const progressPercentage = Math.min((totalRaised / artist.fundraising_goal) * 100, 100)
  const supporterCount = new Set(purchases.map(p => p.collector_wallet)).size

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
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-4xl font-bold mb-2">Campaign Dashboard</h1>
              <p className="text-lg text-muted-foreground">
                Welcome back, {artist.name}
              </p>
            </div>
            <div className="flex gap-2">
              <Button asChild variant="outline">
                <Link href={`/artists/${artist.slug}`}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Profile
                </Link>
              </Button>
              <Button asChild>
                <Link href="/create">
                  <Plus className="h-4 w-4 mr-2" />
                  New Campaign
                </Link>
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Stats Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Raised</p>
                  <p className="text-2xl font-bold">{totalRaised.toFixed(2)} SOL</p>
                </div>
                <DollarSign className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Supporters</p>
                  <p className="text-2xl font-bold">{supporterCount}</p>
                </div>
                <Users className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Tokens Sold</p>
                  <p className="text-2xl font-bold">{totalTokensSold}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Progress</p>
                  <p className="text-2xl font-bold">{progressPercentage.toFixed(1)}%</p>
                </div>
                <Target className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Progress Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8"
        >
          <Card>
            <CardHeader>
              <CardTitle>Fundraising Progress</CardTitle>
              <CardDescription>
                Track your progress towards your {artist.fundraising_goal} SOL goal
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Progress value={progressPercentage} className="h-4" />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>{totalRaised.toFixed(2)} SOL raised</span>
                  <span>{(artist.fundraising_goal - totalRaised).toFixed(2)} SOL remaining</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Content Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Tabs defaultValue="supporters" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="supporters">Supporters</TabsTrigger>
              <TabsTrigger value="perks">Perks</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="supporters" className="mt-6">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Supporter List</CardTitle>
                      <CardDescription>
                        All supporters who have purchased your tokens
                      </CardDescription>
                    </div>
                    {purchases.length > 0 && (
                      <Button onClick={downloadSupportersCSV} variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Export CSV
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {purchases.length > 0 ? (
                    <div className="space-y-4">
                      {purchases.map((purchase) => (
                        <div key={purchase.id} className="flex justify-between items-center p-4 border rounded-lg">
                          <div>
                            <div className="font-mono text-sm font-medium">
                              {purchase.collector_wallet.slice(0, 12)}...{purchase.collector_wallet.slice(-12)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(purchase.timestamp).toLocaleString()}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">{purchase.tokens_purchased} {artist.token_symbol}</div>
                            <div className="text-sm text-muted-foreground">{purchase.sol_paid} SOL</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="font-medium mb-2">No supporters yet</h3>
                      <p className="text-muted-foreground mb-4">
                        Share your campaign to start attracting supporters!
                      </p>
                      <Button asChild>
                        <Link href={`/artists/${artist.slug}`}>
                          View Campaign
                        </Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="perks" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Reward Perks</CardTitle>
                  <CardDescription>
                    Manage the perks you offer to token holders
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {perks.length > 0 ? (
                    <div className="space-y-4">
                      {perks.map((perk) => (
                        <div key={perk.id} className="p-4 border rounded-lg">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium">{perk.title}</h3>
                              <p className="text-sm text-muted-foreground mt-1">{perk.description}</p>
                            </div>
                            <div className="text-right">
                              <div className="font-medium">{perk.token_threshold}+ tokens</div>
                              <div className="text-sm text-muted-foreground">required</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="text-6xl mb-4">🎁</div>
                      <h3 className="font-medium mb-2">No perks defined</h3>
                      <p className="text-muted-foreground">
                        You haven't set up any perks for your supporters yet.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Campaign Settings
                  </CardTitle>
                  <CardDescription>
                    View and manage your campaign details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-2">Campaign Details</h4>
                      <div className="space-y-2 text-sm">
                        <div><span className="text-muted-foreground">Name:</span> {artist.name}</div>
                        <div><span className="text-muted-foreground">Token Symbol:</span> {artist.token_symbol}</div>
                        <div><span className="text-muted-foreground">Token Supply:</span> {artist.supply.toLocaleString()}</div>
                        <div><span className="text-muted-foreground">Price per Token:</span> {artist.price} SOL</div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Campaign Stats</h4>
                      <div className="space-y-2 text-sm">
                        <div><span className="text-muted-foreground">Created:</span> {new Date(artist.created_at).toLocaleDateString()}</div>
                        <div><span className="text-muted-foreground">Profile URL:</span> /artists/{artist.slug}</div>
                        <div><span className="text-muted-foreground">Goal:</span> {artist.fundraising_goal} SOL</div>
                        <div><span className="text-muted-foreground">Raised:</span> {totalRaised.toFixed(2)} SOL</div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t">
                    <p className="text-sm text-muted-foreground mb-4">
                      Campaign editing is not available in this demo version.
                    </p>
                    <Button variant="outline" disabled>
                      Edit Campaign
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  )
}