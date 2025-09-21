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
import { ArrowLeft, Users, Gift, ShoppingCart, MapPin, Globe, Instagram, Twitter, Linkedin, GraduationCap, Award, Briefcase, Palette } from 'lucide-react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function ArtistProfilePage() {
  const params = useParams()
  const { connected, publicKey } = useWallet()
  
  const [artist, setArtist] = useState<any>(null)
  const [campaigns, setCampaigns] = useState<any[]>([])
  const [education, setEducation] = useState<any[]>([])
  const [exhibitions, setExhibitions] = useState<any[]>([])
  const [residencies, setResidencies] = useState<any[]>([])
  const [artworks, setArtworks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  // Purchase form
  const [purchaseAmount, setPurchaseAmount] = useState('1')
  const [isPurchasing, setIsPurchasing] = useState(false)
  const [purchaseError, setPurchaseError] = useState('')

  const slug = params.slug as string

  useEffect(() => {
    const loadArtistProfile = async () => {
      if (!supabase) {
        console.error('Supabase is not configured')
        return
      }

      try {
        // Load artist data
        const { data: artistData } = await supabase
          .from('artists')
          .select('*')
          .eq('slug', slug)
          .single()

        if (!artistData) {
          setError('Artist not found')
          setLoading(false)
          return
        }

        setArtist(artistData)

        // Load campaigns
        const { data: campaignsData } = await supabase
          .from('campaigns')
          .select('*')
          .eq('artist_id', artistData.id)

        setCampaigns(campaignsData || [])

        // Load education
        const { data: educationData } = await supabase
          .from('artist_education')
          .select('*')
          .eq('artist_id', artistData.id)

        setEducation(educationData || [])

        // Load exhibitions
        const { data: exhibitionsData } = await supabase
          .from('artist_exhibitions')
          .select('*')
          .eq('artist_id', artistData.id)

        setExhibitions(exhibitionsData || [])

        // Load residencies
        const { data: residenciesData } = await supabase
          .from('artist_residencies')
          .select('*')
          .eq('artist_id', artistData.id)

        setResidencies(residenciesData || [])

        // Load artworks
        const { data: artworksData } = await supabase
          .from('artist_artworks')
          .select('*')
          .eq('artist_id', artistData.id)

        setArtworks(artworksData || [])

      } catch (err) {
        setError('Failed to load artist profile')
      } finally {
        setLoading(false)
      }
    }

    loadArtistProfile()
  }, [slug])

  const handlePurchase = async () => {
    if (!connected || !publicKey || !artist) {
      setPurchaseError('Please connect your wallet first')
      return
    }

    const activeCampaign = campaigns.find(c => c.status === 'active')
    if (!activeCampaign) {
      setPurchaseError('No active campaign available')
      return
    }

    const amount = parseInt(purchaseAmount)
    if (amount < 1) {
      setPurchaseError('Purchase amount must be at least 1 token')
      return
    }

    setIsPurchasing(true)
    setPurchaseError('')

    try {
      const totalCost = amount * activeCampaign.price
      
      // Simulate purchase
      alert(`Demo: Successfully purchased ${amount} ${activeCampaign.token_symbol} tokens for $${totalCost} USDT!`)
      
      // Reset form
      setPurchaseAmount('1')
      
    } catch (err: any) {
      setPurchaseError(err.message || 'Failed to purchase tokens')
    } finally {
      setIsPurchasing(false)
    }
  }

  if (loading) {
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
            <CardTitle>Artist Not Found</CardTitle>
            <CardDescription>
              {error || 'The artist you\'re looking for doesn\'t exist.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/">Back to Home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Calculate stats from campaigns
  const activeCampaign = campaigns.find(c => c.status === 'active')
  const totalRaised = campaigns.reduce((sum, campaign) => sum + (campaign.raised_amount || 0), 0)
  const totalGoal = campaigns.reduce((sum, campaign) => sum + (campaign.fundraising_goal || 0), 0)
  const totalSupporters = campaigns.reduce((sum, campaign) => sum + (campaign.supporter_count || 0), 0)
  const progressPercentage = totalGoal > 0 ? Math.min((totalRaised / totalGoal) * 100, 100) : 0

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative">
        {artist.banner_image_url ? (
          <div 
            className="h-64 bg-cover bg-center"
            style={{ backgroundImage: `url(${artist.banner_image_url})` }}
          />
        ) : (
          <div className="h-64 bg-gradient-to-br from-primary/20 to-secondary/20"></div>
        )}
        <div className="absolute inset-0 bg-black/20"></div>
      </div>

      <div className="container mx-auto px-4 -mt-32 relative z-10">
        {/* Back Link */}
        <Link 
          href="/" 
          className="inline-flex items-center text-sm text-white/80 hover:text-white transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to home
        </Link>

        {/* Profile Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="grid lg:grid-cols-3 gap-8 mb-8"
        >
          {/* Main Info */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-6">
                <div className="space-y-6">
                  {/* Artist Header */}
                  <div className="flex gap-4">
                    {artist.profile_image_url && (
                      <img
                        src={artist.profile_image_url}
                        alt={artist.name}
                        className="w-20 h-20 rounded-full object-cover border-4 border-background shadow-lg"
                      />
                    )}
                    <div className="flex-1">
                      <h1 className="text-3xl font-bold mb-2">{artist.name}</h1>
                      {artist.location && (
                        <div className="flex items-center gap-2 text-muted-foreground mb-2">
                          <MapPin className="h-4 w-4" />
                          <span>{artist.location}</span>
                        </div>
                      )}
                      {artist.bio && (
                        <p className="text-muted-foreground">{artist.bio}</p>
                      )}
                    </div>
                  </div>

                  {/* Social Links */}
                  <div className="flex gap-4">
                    {artist.website_url && (
                      <a href={artist.website_url} target="_blank" rel="noopener noreferrer" 
                         className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                        <Globe className="h-4 w-4" />
                        <span>Website</span>
                      </a>
                    )}
                    {artist.instagram_handle && (
                      <a href={`https://instagram.com/${artist.instagram_handle.replace('@', '')}`} target="_blank" rel="noopener noreferrer"
                         className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                        <Instagram className="h-4 w-4" />
                        <span>{artist.instagram_handle}</span>
                      </a>
                    )}
                    {artist.twitter_handle && (
                      <a href={`https://twitter.com/${artist.twitter_handle.replace('@', '')}`} target="_blank" rel="noopener noreferrer"
                         className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                        <Twitter className="h-4 w-4" />
                        <span>{artist.twitter_handle}</span>
                      </a>
                    )}
                    {artist.linkedin_url && (
                      <a href={artist.linkedin_url} target="_blank" rel="noopener noreferrer"
                         className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
                        <Linkedin className="h-4 w-4" />
                        <span>LinkedIn</span>
                      </a>
                    )}
                  </div>

                  {/* Campaign Progress */}
                  {campaigns.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Total Fundraising Progress</span>
                        <span>{progressPercentage.toFixed(1)}%</span>
                      </div>
                      <Progress value={progressPercentage} className="h-3" />
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>${totalRaised.toLocaleString()} USDT raised</span>
                        <span>Goal: ${totalGoal.toLocaleString()} USDT</span>
                      </div>
                    </div>
                  )}

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{totalSupporters}</div>
                      <div className="text-sm text-muted-foreground">Supporters</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{campaigns.length}</div>
                      <div className="text-sm text-muted-foreground">Campaigns</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{artworks.length}</div>
                      <div className="text-sm text-muted-foreground">Artworks</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Purchase Section */}
          <div>
            {activeCampaign ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5" />
                    Buy {activeCampaign.token_symbol} Tokens
                  </CardTitle>
                  <CardDescription>
                    Support "{activeCampaign.title}"
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {!connected ? (
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Connect your wallet to purchase tokens
                      </p>
                      <div className="text-center">
                        <p className="text-xs text-muted-foreground">
                          Use the wallet button in the bottom right corner
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label htmlFor="amount" className="text-sm font-medium">
                          Number of Tokens
                        </label>
                        <Input
                          id="amount"
                          type="number"
                          min="1"
                          value={purchaseAmount}
                          onChange={(e) => setPurchaseAmount(e.target.value)}
                          disabled={isPurchasing}
                        />
                      </div>

                      <div className="space-y-2 p-3 bg-muted rounded-lg">
                        <div className="flex justify-between text-sm">
                          <span>Price per token:</span>
                          <span>${activeCampaign.price} USDT</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Quantity:</span>
                          <span>{purchaseAmount}</span>
                        </div>
                        <div className="flex justify-between font-medium border-t pt-2">
                          <span>Total:</span>
                          <span>${(parseFloat(purchaseAmount) * activeCampaign.price).toFixed(2)} USDT</span>
                        </div>
                      </div>

                      {purchaseError && (
                        <div className="p-3 text-sm text-destructive-foreground bg-destructive/10 border border-destructive/20 rounded-md">
                          {purchaseError}
                        </div>
                      )}

                      <Button 
                        onClick={handlePurchase}
                        disabled={isPurchasing}
                        className="w-full"
                      >
                        {isPurchasing ? 'Processing...' : 'Purchase Tokens'}
                      </Button>

                      <p className="text-xs text-muted-foreground text-center">
                        This is a demo. No real transaction will occur.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="space-y-4">
                    <div className="text-4xl">🎨</div>
                    <h3 className="font-medium">No Active Campaign</h3>
                    <p className="text-muted-foreground text-sm">
                      This artist doesn't have an active campaign right now.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </motion.div>

        {/* Content Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="pb-12"
        >
          <Tabs defaultValue="campaigns" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
              <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
              <TabsTrigger value="education">Education</TabsTrigger>
              <TabsTrigger value="exhibitions">Exhibitions</TabsTrigger>
              <TabsTrigger value="residencies">Residencies</TabsTrigger>
            </TabsList>

            {/* Campaigns Tab */}
            <TabsContent value="campaigns" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gift className="h-5 w-5" />
                    Active Campaigns
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {campaigns.length > 0 ? (
                    <div className="space-y-4">
                      {campaigns.map((campaign, index) => (
                        <div key={campaign.id} className="border rounded-lg p-4">
                          <div className="flex gap-4">
                            {campaign.thumbnail_url && (
                              <img
                                src={campaign.thumbnail_url}
                                alt={campaign.title}
                                className="w-16 h-16 object-cover rounded-lg"
                              />
                            )}
                            <div className="flex-1">
                              <h3 className="font-semibold">{campaign.title}</h3>
                              <p className="text-sm text-muted-foreground mb-2">{campaign.blurb}</p>
                              <div className="flex justify-between text-sm">
                                <span>${campaign.raised_amount?.toLocaleString() || 0} raised</span>
                                <span>Goal: ${campaign.fundraising_goal?.toLocaleString() || 0} USDT</span>
                              </div>
                              <div className="mt-2">
                                <Progress 
                                  value={campaign.fundraising_goal ? Math.min((campaign.raised_amount || 0) / campaign.fundraising_goal * 100, 100) : 0} 
                                  className="h-2" 
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Gift className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="font-medium mb-2">No campaigns yet</h3>
                      <p className="text-muted-foreground">
                        This artist hasn't launched any campaigns yet.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Portfolio Tab */}
            <TabsContent value="portfolio" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="h-5 w-5" />
                    Artworks
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {artworks.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {artworks.map((artwork) => (
                        <div key={artwork.id} className="border rounded-lg overflow-hidden">
                          {artwork.image_url && (
                            <img
                              src={artwork.image_url}
                              alt={artwork.title}
                              className="w-full h-48 object-cover"
                            />
                          )}
                          <div className="p-4">
                            <h3 className="font-semibold">{artwork.title}</h3>
                            {artwork.year_created && (
                              <p className="text-sm text-muted-foreground">{artwork.year_created}</p>
                            )}
                            {artwork.medium && (
                              <p className="text-sm text-muted-foreground">{artwork.medium}</p>
                            )}
                            {artwork.description && (
                              <p className="text-sm mt-2">{artwork.description}</p>
                            )}
                            {artwork.is_for_sale && artwork.price && (
                              <div className="mt-2 text-sm font-medium text-green-600">
                                ${artwork.price.toLocaleString()} USDT
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Palette className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="font-medium mb-2">No artworks yet</h3>
                      <p className="text-muted-foreground">
                        This artist hasn't uploaded any artworks yet.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Education Tab */}
            <TabsContent value="education" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="h-5 w-5" />
                    Education
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {education.length > 0 ? (
                    <div className="space-y-6">
                      {education.map((edu) => (
                        <div key={edu.id} className="border-l-4 border-primary pl-4">
                          <h3 className="font-semibold">{edu.institution}</h3>
                          <div className="text-sm text-muted-foreground">
                            {edu.degree_type} {edu.field_of_study && `in ${edu.field_of_study}`}
                          </div>
                          {(edu.start_year || edu.end_year) && (
                            <div className="text-sm text-muted-foreground">
                              {edu.start_year} - {edu.end_year || 'Present'}
                            </div>
                          )}
                          {edu.description && (
                            <p className="text-sm mt-2">{edu.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="font-medium mb-2">No education records</h3>
                      <p className="text-muted-foreground">
                        No educational background has been added yet.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Exhibitions Tab */}
            <TabsContent value="exhibitions" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="h-5 w-5" />
                    Exhibitions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {exhibitions.length > 0 ? (
                    <div className="space-y-6">
                      {exhibitions.map((exhibition) => (
                        <div key={exhibition.id} className="border-l-4 border-secondary pl-4">
                          <h3 className="font-semibold">{exhibition.title}</h3>
                          <div className="text-sm text-muted-foreground">
                            {exhibition.venue} • {exhibition.location}
                          </div>
                          {exhibition.exhibition_type && (
                            <div className="text-sm text-muted-foreground">
                              {exhibition.exhibition_type} Exhibition
                            </div>
                          )}
                          {(exhibition.start_date || exhibition.end_date) && (
                            <div className="text-sm text-muted-foreground">
                              {exhibition.start_date && new Date(exhibition.start_date).toLocaleDateString()} - {exhibition.end_date && new Date(exhibition.end_date).toLocaleDateString()}
                            </div>
                          )}
                          {exhibition.description && (
                            <p className="text-sm mt-2">{exhibition.description}</p>
                          )}
                          {exhibition.url && (
                            <a href={exhibition.url} target="_blank" rel="noopener noreferrer" 
                               className="text-sm text-primary hover:underline">
                              View Exhibition →
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="font-medium mb-2">No exhibitions yet</h3>
                      <p className="text-muted-foreground">
                        No exhibition history has been added yet.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Residencies Tab */}
            <TabsContent value="residencies" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    Residencies
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {residencies.length > 0 ? (
                    <div className="space-y-6">
                      {residencies.map((residency) => (
                        <div key={residency.id} className="border-l-4 border-accent pl-4">
                          <h3 className="font-semibold">{residency.program_name}</h3>
                          <div className="text-sm text-muted-foreground">
                            {residency.organization} • {residency.location}
                          </div>
                          {(residency.start_date || residency.end_date) && (
                            <div className="text-sm text-muted-foreground">
                              {residency.start_date && new Date(residency.start_date).toLocaleDateString()} - {residency.end_date && new Date(residency.end_date).toLocaleDateString()}
                            </div>
                          )}
                          {residency.description && (
                            <p className="text-sm mt-2">{residency.description}</p>
                          )}
                          {residency.url && (
                            <a href={residency.url} target="_blank" rel="noopener noreferrer" 
                               className="text-sm text-primary hover:underline">
                              View Program →
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="font-medium mb-2">No residencies yet</h3>
                      <p className="text-muted-foreground">
                        No residency experience has been added yet.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  )
}
