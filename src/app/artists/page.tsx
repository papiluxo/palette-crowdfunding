'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { motion } from 'framer-motion'
import { Search, Users, Target, TrendingUp, Plus } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useSOLPrice } from '@/contexts/price-context'
import { formatUSDFromSOLSync } from '@/lib/utils'

interface Artist {
  id: string
  name: string
  bio: string | null
  fundraising_goal: number
  token_symbol: string
  price: number
  slug: string
  created_at: string
  end_date: string | null
  raised_amount: number
  supporter_count: number
  campaign_title: string | null
  campaign_blurb: string | null
  campaign_thumbnail_url: string | null
  progress_percentage?: number
}

export default function ArtistsPage() {
  const [artists, setArtists] = useState<Artist[]>([])
  const [filteredArtists, setFilteredArtists] = useState<Artist[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [error, setError] = useState('')
  const { solPrice } = useSOLPrice()

  useEffect(() => {
    loadArtists()
  }, [])

  useEffect(() => {
    if (searchTerm.trim()) {
      const filtered = artists.filter(artist =>
        artist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (artist.bio && artist.bio.toLowerCase().includes(searchTerm.toLowerCase())) ||
        artist.token_symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (artist.campaign_title && artist.campaign_title.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (artist.campaign_blurb && artist.campaign_blurb.toLowerCase().includes(searchTerm.toLowerCase()))
      )
      setFilteredArtists(filtered)
    } else {
      setFilteredArtists(artists)
    }
  }, [searchTerm, artists])

  const loadArtists = async () => {
    if (!supabase) {
      console.error('Supabase is not configured')
      setLoading(false)
      return
    }

    try {
      // Fetch artists from Supabase - only active campaigns (not expired)
      const { data: artistsData, error: artistsError } = await supabase
        .from('artists')
        .select('*')
        .or('end_date.is.null,end_date.gt.now()')
        .order('created_at', { ascending: false })

      if (artistsError) {
        throw artistsError
      }

      // Calculate progress percentage for each artist
      const artistsWithProgress = (artistsData || []).map(artist => ({
        ...artist,
        progress_percentage: artist.fundraising_goal > 0 
          ? (artist.raised_amount / artist.fundraising_goal) * 100
          : 0
      }))

      setArtists(artistsWithProgress)
      setFilteredArtists(artistsWithProgress)
    } catch (err: any) {
      console.error('Error loading artists:', err)
      setError(err.message || 'Failed to load artists')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <Card>
                  <CardHeader>
                    <div className="h-6 bg-muted rounded w-3/4"></div>
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="h-3 bg-muted rounded"></div>
                      <div className="h-4 bg-muted rounded w-1/3"></div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Error Loading Artists</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={loadArtists} className="w-full">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

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
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-4xl font-bold mb-2">Discover Artists</h1>
              <p className="text-lg text-muted-foreground">
                Support creative projects and earn exclusive rewards
              </p>
            </div>
            <Button asChild className="whitespace-nowrap px-6">
              <Link href="/create" className="inline-flex items-center">
                <Plus className="h-4 w-4 mr-2 flex-shrink-0" />
                Start Your Campaign
              </Link>
            </Button>
          </div>

          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search artists, tokens, or projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </motion.div>

        {/* Stats */}
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
                  <p className="text-sm font-medium text-muted-foreground">Active Campaigns</p>
                  <p className="text-2xl font-bold">{filteredArtists.length}</p>
                </div>
                <Users className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Raised</p>
                  <p className="text-2xl font-bold">
                    ${filteredArtists.reduce((sum, a) => sum + (a.raised_amount || 0), 0).toLocaleString()} USDT
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Supporters</p>
                  <p className="text-2xl font-bold">
                    {filteredArtists.reduce((sum, a) => sum + (a.supporter_count || 0), 0)}
                  </p>
                </div>
                <Target className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Artists Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {filteredArtists.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredArtists.map((artist, index) => (
                <motion.div
                  key={artist.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                    <Link href={`/artists/${artist.slug}`}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <CardTitle className="line-clamp-2">
                              {artist.name}
                            </CardTitle>
                            <CardDescription className="mt-1">
                              {artist.campaign_title && (
                                <span className="block text-sm font-medium text-foreground/80 mb-1">
                                  {artist.campaign_title}
                                </span>
                              )}
                              Token: {artist.token_symbol}
                            </CardDescription>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium">${artist.price} USDT</div>
                            <div className="text-xs text-muted-foreground">
                              per token
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {(artist.campaign_blurb || artist.bio) && (
                            <p className="text-sm text-muted-foreground line-clamp-3">
                              {artist.campaign_blurb || artist.bio}
                            </p>
                          )}
                          
                          {/* Progress */}
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Progress</span>
                              <span>{artist.progress_percentage?.toFixed(1)}%</span>
                            </div>
                            <Progress value={artist.progress_percentage || 0} className="h-2" />
                            <div className="flex justify-between text-xs text-muted-foreground">
                              <span>
                                ${artist.raised_amount?.toLocaleString()} USDT raised
                              </span>
                              <span>
                                Goal: ${artist.fundraising_goal?.toLocaleString()} USDT
                              </span>
                            </div>
                          </div>

                          {/* Stats */}
                          <div className="flex justify-between text-sm">
                            <div>
                              <span className="text-muted-foreground">Supporters: </span>
                              <span className="font-medium">{artist.supporter_count}</span>
                            </div>
                            <div className="text-muted-foreground">
                              Created {new Date(artist.created_at).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Link>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="space-y-4">
                  <div className="text-6xl">🎨</div>
                  <h3 className="text-xl font-semibold">
                    {searchTerm ? 'No artists found' : 'No campaigns yet'}
                  </h3>
                  <p className="text-muted-foreground">
                    {searchTerm 
                      ? `No artists match "${searchTerm}". Try a different search term.`
                      : 'Be the first to create a campaign and start raising funds for your creative project!'
                    }
                  </p>
                  {!searchTerm && (
                    <Button asChild>
                      <Link href="/create" className="flex items-center">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Your Campaign
                      </Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  )
}