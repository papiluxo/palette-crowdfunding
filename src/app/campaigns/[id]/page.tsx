'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { useWallet } from '@solana/wallet-adapter-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { motion } from 'framer-motion'
import { ArrowLeft, Users, Gift, ShoppingCart, Calendar, Target, DollarSign, User, Wallet } from 'lucide-react'
import Link from 'next/link'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { Campaign, Artist, Perk, Post, Purchase } from '@/lib/supabase'

interface CampaignWithDetails extends Campaign {
  artist: Artist
  perks: Perk[]
  posts: Post[]
  recent_purchases: Purchase[]
}

export default function CampaignPage() {
  const params = useParams()
  const campaignId = params.id as string
  const { publicKey, connected } = useWallet()
  const [campaign, setCampaign] = useState<CampaignWithDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [purchaseAmount, setPurchaseAmount] = useState('')
  const [purchasing, setPurchasing] = useState(false)

  useEffect(() => {
    if (campaignId) {
      fetchCampaign()
    }
  }, [campaignId])

  const fetchCampaign = async () => {
    if (!isSupabaseConfigured() || !supabase) {
      console.error('Supabase is not configured')
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase
        .from('campaigns')
        .select(`
          *,
          artist:artists(*),
          perks(*),
          posts(*),
          recent_purchases:purchases(*)
        `)
        .eq('id', campaignId)
        .single()

      if (error) {
        console.error('Error fetching campaign:', error)
    } else {
        setCampaign(data)
      }
    } catch (error) {
      console.error('Error fetching campaign:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePurchase = async () => {
    if (!campaign || !connected || !publicKey) {
      alert('Please connect your wallet first')
      return
    }

    const amount = parseFloat(purchaseAmount)
    if (!amount || amount <= 0) {
      alert('Please enter a valid amount')
      return
    }

    setPurchasing(true)

    try {
      // In production, this would integrate with the Solana blockchain
      // For now, we'll just record the purchase in the database
      const { error } = await supabase!
        .from('purchases')
        .insert({
          campaign_id: campaign.id,
          collector_wallet: publicKey.toString(),
          tokens_purchased: amount,
          usdt_paid: amount * campaign.price,
          transaction_hash: 'pending-' + Date.now().toString()
        })

      if (error) {
        console.error('Error recording purchase:', error)
        alert('Error processing purchase')
      } else {
        alert(`Successfully purchased ${amount} tokens!`)
        setPurchaseAmount('')
        fetchCampaign() // Refresh data
      }
    } catch (error) {
      console.error('Error processing purchase:', error)
      alert('Error processing purchase')
    } finally {
      setPurchasing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg text-muted-foreground">Loading campaign...</div>
          </div>
        </div>
      </div>
    )
  }

  if (!campaign) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-16">
            <h1 className="text-2xl font-bold mb-4">Campaign Not Found</h1>
            <p className="text-muted-foreground mb-6">The campaign you're looking for doesn't exist.</p>
            <Button asChild>
              <Link href="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const progressPercentage = Math.min((campaign.raised_amount / campaign.fundraising_goal) * 100, 100)
  const daysLeft = campaign.end_date 
    ? Math.max(0, Math.ceil((new Date(campaign.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Button variant="ghost" asChild className="mb-6">
            <Link href="/">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Campaigns
        </Link>
          </Button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
        {/* Campaign Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <User className="w-5 h-5 text-muted-foreground" />
                    <Link 
                  href={`/artists/${campaign.artist.slug}`}
                      className="text-primary hover:underline font-medium"
                    >
                  {campaign.artist.name}
                    </Link>
                  </div>
              <h1 className="text-4xl font-bold mb-4">{campaign.title}</h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                {campaign.blurb}
              </p>
            </motion.div>

            {/* Campaign Image */}
            {campaign.thumbnail_url && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="aspect-video rounded-lg overflow-hidden bg-muted"
              >
                <img 
                  src={campaign.thumbnail_url} 
                  alt={campaign.title}
                  className="w-full h-full object-cover"
                />
              </motion.div>
            )}

            {/* Campaign Details Tabs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Tabs defaultValue="description" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="description">Description</TabsTrigger>
                  <TabsTrigger value="updates">Updates ({campaign.posts.length})</TabsTrigger>
                  <TabsTrigger value="supporters">Supporters ({campaign.supporter_count})</TabsTrigger>
                </TabsList>
                
                <TabsContent value="description" className="mt-6">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="prose max-w-none">
                        <p className="whitespace-pre-wrap">
                          {campaign.description || 'No description provided.'}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="updates" className="mt-6">
                  <div className="space-y-4">
                    {campaign.posts.length === 0 ? (
                      <Card>
                        <CardContent className="pt-6 text-center text-muted-foreground">
                          No updates yet.
                        </CardContent>
                      </Card>
                    ) : (
                      campaign.posts.map((post) => (
                        <Card key={post.id}>
                          <CardHeader>
                            <CardTitle className="text-lg">{post.title}</CardTitle>
                            <CardDescription>
                              {new Date(post.created_at).toLocaleDateString()}
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <p className="whitespace-pre-wrap">{post.content}</p>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="supporters" className="mt-6">
                  <Card>
                    <CardContent className="pt-6">
                      {campaign.recent_purchases.length === 0 ? (
                        <div className="text-center text-muted-foreground">
                          No supporters yet. Be the first!
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {campaign.recent_purchases.map((purchase) => (
                            <div key={purchase.id} className="flex items-center justify-between py-2">
                              <div className="flex items-center gap-3">
                                <Wallet className="w-4 h-4 text-muted-foreground" />
                                <span className="font-mono text-sm">
                                  {purchase.collector_wallet.slice(0, 8)}...{purchase.collector_wallet.slice(-8)}
                                </span>
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {purchase.tokens_purchased} tokens
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </motion.div>
                  </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Purchase Card */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Card className="sticky top-6">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5" />
                    Purchase Tokens
                  </CardTitle>
                  <CardDescription>
                    Support this project by purchasing ${campaign.token_symbol} tokens
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{progressPercentage.toFixed(1)}%</span>
                    </div>
                    <Progress value={progressPercentage} className="h-2" />
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        ${campaign.raised_amount.toLocaleString()} raised
                      </span>
                      <span className="text-muted-foreground">
                        ${campaign.fundraising_goal.toLocaleString()} goal
                      </span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 py-4 border-y">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                        <Users className="w-4 h-4" />
                      </div>
                      <div className="font-semibold">{campaign.supporter_count}</div>
                      <div className="text-xs text-muted-foreground">Supporters</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div className="font-semibold">
                        {daysLeft !== null ? `${daysLeft}` : '∞'}
                    </div>
                      <div className="text-xs text-muted-foreground">Days left</div>
                    </div>
          </div>

                  {/* Purchase Form */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span>Price per token:</span>
                      <span className="font-medium">${campaign.price}</span>
                    </div>
                      <Input
                        type="number"
                      placeholder="Number of tokens"
                        value={purchaseAmount}
                        onChange={(e) => setPurchaseAmount(e.target.value)}
                      min="1"
                      step="1"
                    />
                    {purchaseAmount && (
                      <div className="text-sm text-muted-foreground">
                        Total: ${(parseFloat(purchaseAmount) * campaign.price).toFixed(2)}
                      </div>
                    )}
                    <Button 
                      onClick={handlePurchase}
                      disabled={!connected || purchasing || !purchaseAmount}
                      className="w-full"
                    >
                      {purchasing ? 'Processing...' : 
                       !connected ? 'Connect Wallet' : 
                       'Purchase Tokens'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Perks Card */}
            {campaign.perks.length > 0 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                      <Gift className="w-5 h-5" />
                    Token Perks
                  </CardTitle>
                  <CardDescription>
                      Benefits you'll receive for supporting this project
                  </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                      {campaign.perks.map((perk) => (
                        <div key={perk.id} className="border rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{perk.title}</h4>
                            <span className="text-sm text-muted-foreground">
                              {perk.token_threshold}+ tokens
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {perk.description}
                          </p>
                        </div>
                      ))}
                    </div>
                </CardContent>
              </Card>
        </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}