'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { CampaignCard } from '@/components/campaign-card'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Plus, Filter, TrendingUp, Clock, DollarSign } from 'lucide-react'
import { useSOLPrice } from '@/contexts/price-context'
import { formatUSDFromSOLSync } from '@/lib/utils'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { Campaign, Artist } from '@/lib/supabase'

interface CampaignWithArtist extends Campaign {
  artist: Artist
}

export default function HomePage() {
  const [campaigns, setCampaigns] = useState<CampaignWithArtist[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<'newest' | 'ending-soon' | 'most-funded'>('newest')
  const { solPrice } = useSOLPrice()

  useEffect(() => {
    fetchCampaigns()
  }, [])

  const fetchCampaigns = async () => {
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
          artist:artists(*)
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching campaigns:', error)
      } else {
        setCampaigns(data || [])
      }
    } catch (error) {
      console.error('Error fetching campaigns:', error)
    } finally {
      setLoading(false)
    }
  }

  // Calculate totals from campaigns
  const totalRaised = campaigns.reduce((sum, campaign) => sum + campaign.raised_amount, 0)
  const totalSupporters = campaigns.reduce((sum, campaign) => sum + campaign.supporter_count, 0)

  const sortedCampaigns = [...campaigns].sort((a, b) => {
    switch (sortBy) {
      case 'ending-soon':
        if (!a.end_date) return 1
        if (!b.end_date) return -1
        return new Date(a.end_date).getTime() - new Date(b.end_date).getTime()
      case 'most-funded':
        return (b.raised_amount / b.fundraising_goal) - (a.raised_amount / a.fundraising_goal)
      default: // newest
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    }
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg text-muted-foreground">Loading campaigns...</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 to-background py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <motion.h1
              className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              Fund Creative Dreams
            </motion.h1>
            <motion.p
              className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              Support artists by purchasing their custom tokens. Get exclusive perks and help bring creative projects to life through blockchain-powered patronage.
            </motion.p>
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Button size="lg" asChild className="whitespace-nowrap px-6">
                <Link href="/artists" className="inline-flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 flex-shrink-0" />
                  Explore Campaigns
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild className="whitespace-nowrap px-6">
                <Link href="/create" className="inline-flex items-center">
                  <Plus className="w-5 h-5 mr-2 flex-shrink-0" />
                  Start a Campaign
                </Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-b">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="text-3xl font-bold text-primary">{formatUSDFromSOLSync(totalRaised, solPrice)}</div>
              <div className="text-sm text-muted-foreground">Total Raised</div>
            </motion.div>
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <div className="text-3xl font-bold text-primary">{totalSupporters}</div>
              <div className="text-sm text-muted-foreground">Total Supporters</div>
            </motion.div>
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="text-3xl font-bold text-primary">{campaigns.length}</div>
              <div className="text-sm text-muted-foreground">Active Campaigns</div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Campaigns Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div>
              <h2 className="text-3xl font-bold mb-2">Active Campaigns</h2>
              <p className="text-muted-foreground">
                Discover and support amazing creative projects
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-background border rounded-md px-3 py-2 text-sm"
              >
                <option value="newest">Newest First</option>
                <option value="ending-soon">Ending Soon</option>
                <option value="most-funded">Most Funded</option>
              </select>
            </div>
          </div>

          {sortedCampaigns.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-lg font-medium mb-2">No active campaigns yet</div>
              <p className="text-muted-foreground mb-6">
                Be the first to create a campaign and start raising funds for your creative project.
              </p>
              <Button asChild className="whitespace-nowrap px-6">
                <Link href="/create" className="inline-flex items-center">
                  <Plus className="w-4 h-4 mr-2 flex-shrink-0" />
                  Create First Campaign
                </Link>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedCampaigns.map((campaign, index) => (
                <motion.div
                  key={campaign.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <CampaignCard
                    campaign={{
                      id: campaign.id,
                      artistName: campaign.artist.name,
                      title: campaign.title,
                      blurb: campaign.blurb || '',
                      goalAmount: campaign.fundraising_goal,
                      raisedAmount: campaign.raised_amount,
                      thumbnailUrl: campaign.thumbnail_url || undefined,
                      endDate: campaign.end_date || '',
                      supporterCount: campaign.supporter_count,
                      tokenPerks: [] // TODO: Add perks from database
                    }}
                    index={index}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}