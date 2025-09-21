'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { motion } from 'framer-motion'
import { ArrowLeft, Upload, Plus, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { formatUSDFromUSDT } from '@/lib/utils'
import { useUSDTPrice } from '@/contexts/price-context'
import { USDTPriceIndicator } from '@/components/sol-price-indicator'

interface Perk {
  title: string
  description: string
  tokenThreshold: number
}

export default function CreateCampaignPage() {
  const { user } = useAuth()
  const { usdtPrice } = useUSDTPrice()
  const router = useRouter()
  
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [artistProfile, setArtistProfile] = useState<any>(null)
  const [checkingProfile, setCheckingProfile] = useState(true)
  
  // Form data
  const [name, setName] = useState('')
  const [bio, setBio] = useState('')
  const [fundraisingGoal, setFundraisingGoal] = useState('')
  const [tokenSymbol, setTokenSymbol] = useState('')
  const [supply, setSupply] = useState('1000000')
  const [price, setPrice] = useState('0.01')
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null)

  // Calculate values when one changes
  const handleFundraisingGoalChange = (value: string) => {
    setFundraisingGoal(value)
    if (value && supply) {
      const goal = parseFloat(value)
      const supplyNum = parseFloat(supply)
      if (goal > 0 && supplyNum > 0) {
        const newPrice = (goal / supplyNum).toFixed(6)
        setPrice(newPrice)
      }
    }
  }

  const handleSupplyChange = (value: string) => {
    setSupply(value)
    if (fundraisingGoal && value) {
      const goal = parseFloat(fundraisingGoal)
      const supplyNum = parseFloat(value)
      if (goal > 0 && supplyNum > 0) {
        const newPrice = (goal / supplyNum).toFixed(6)
        setPrice(newPrice)
      }
    }
  }

  const handlePriceChange = (value: string) => {
    setPrice(value)
    if (fundraisingGoal && value) {
      const goal = parseFloat(fundraisingGoal)
      const priceNum = parseFloat(value)
      if (goal > 0 && priceNum > 0) {
        const newSupply = Math.round(goal / priceNum).toString()
        setSupply(newSupply)
      }
    }
  }
  const [perks, setPerks] = useState<Perk[]>([
    { title: '', description: '', tokenThreshold: 1 }
  ])

  // Check if user has completed artist profile
  useEffect(() => {
    const checkArtistProfile = async () => {
      if (!user?.email) return

      try {
        const { data: profile } = await supabase!
          .from('artists')
          .select('*')
          .eq('email', user.email)
          .eq('profile_completed', true)
          .single()

        setArtistProfile(profile)
      } catch (error) {
        // Profile doesn't exist or isn't completed
        setArtistProfile(null)
      } finally {
        setCheckingProfile(false)
      }
    }

    if (user) {
      checkArtistProfile()
    }
  }, [user])

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  const addPerk = () => {
    setPerks([...perks, { title: '', description: '', tokenThreshold: 1 }])
  }

  const removePerk = (index: number) => {
    if (perks.length > 1) {
      setPerks(perks.filter((_, i) => i !== index))
    }
  }

  const updatePerk = (index: number, field: keyof Perk, value: string | number) => {
    const updatedPerks = [...perks]
    
    // Special handling for tokenThreshold to ensure it's always a valid number >= 1
    if (field === 'tokenThreshold') {
      const numValue = typeof value === 'string' ? parseFloat(value) : value
      const validValue = isNaN(numValue) || numValue < 1 ? 1 : Math.floor(numValue)
      updatedPerks[index] = { ...updatedPerks[index], [field]: validValue }
    } else {
      updatedPerks[index] = { ...updatedPerks[index], [field]: value }
    }
    
    setPerks(updatedPerks)
  }

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file')
        return
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image file size must be less than 5MB')
        return
      }

      setThumbnailFile(file)
      
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setThumbnailPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
      setError('') // Clear any previous errors
    }
  }

  const removeThumbnail = () => {
    setThumbnailFile(null)
    setThumbnailPreview(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      setError('You must be signed in to create a campaign')
      return
    }

    if (!isSupabaseConfigured()) {
      setError('Supabase is not configured. Please set up your environment variables.')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      // Handle thumbnail upload
      let thumbnailUrl = null
      if (thumbnailFile) {
        // TODO: In production, upload to Supabase Storage
        // For now, we'll set this to null until image upload is implemented
        thumbnailUrl = null
      }

      // Create campaign
      const { data: campaign, error: campaignError } = await supabase!
        .from('campaigns')
        .insert({
          artist_id: artistProfile.id,
          title: name,
          description: bio,
          fundraising_goal: parseFloat(fundraisingGoal),
          token_symbol: tokenSymbol.toUpperCase(),
          supply: parseInt(supply),
          price: parseFloat(price),
          thumbnail_url: thumbnailUrl,
          status: 'active'
        })
        .select()
        .single()

      if (campaignError) throw campaignError

      // Create perks
      const perksData = perks
        .filter(perk => perk.title.trim() && perk.description.trim())
        .map(perk => ({
          campaign_id: campaign.id,
          title: perk.title,
          description: perk.description,
          token_threshold: perk.tokenThreshold
        }))

      if (perksData.length > 0) {
        const { error: perksError } = await supabase
          .from('perks')
          .insert(perksData)

        if (perksError) throw perksError
      }

      // Redirect to campaign page
      router.push(`/campaigns/${campaign.id}`)
    } catch (err: any) {
      setError(err.message || 'Failed to create campaign')
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Sign In Required</CardTitle>
            <CardDescription>
              You need to be signed in to create a campaign
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button asChild className="w-full">
              <Link href="/auth/signin">Sign In</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link href="/auth/signup">Create Account</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (checkingProfile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!artistProfile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-lg">
          <CardHeader className="text-center">
            <CardTitle>Complete Your Artist Profile</CardTitle>
            <CardDescription>
              Before creating a campaign, you need to complete your artist profile to showcase your work and experience
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                <Upload className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-2">Your profile includes:</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Professional bio and contact information</li>
                  <li>• Educational background and training</li>
                  <li>• Exhibition and residency history</li>
                  <li>• Portfolio of your artworks</li>
                  <li>• Career achievements and recognition</li>
                </ul>
              </div>
            </div>
            
            <div className="space-y-3">
              <Button asChild className="w-full">
                <Link href="/profile/setup">Complete Artist Profile</Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/">Back to Home</Link>
              </Button>
            </div>
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
          <Link 
            href="/" 
            className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to home
          </Link>
          <h1 className="text-4xl font-bold mb-2">Create Your Campaign</h1>
          <p className="text-lg text-muted-foreground">
            Set up your artist profile and launch your token-based fundraising campaign
          </p>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="max-w-2xl mx-auto"
        >
          <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
              <div className="p-4 text-sm text-destructive-foreground bg-destructive/10 border border-destructive/20 rounded-md">
                {error}
              </div>
            )}

            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Tell us about yourself and your creative work
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">
                    Campaign Title *
                  </label>
                  <Input
                    id="name"
                    placeholder="Your campaign title"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="bio" className="text-sm font-medium">
                    Campaign Description
                  </label>
                  <textarea
                    id="bio"
                    placeholder="Describe your project and what you're raising funds for..."
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    disabled={isLoading}
                    className="w-full min-h-[100px] px-3 py-2 border border-input bg-background rounded-md text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-vertical"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="thumbnail" className="text-sm font-medium">
                    Campaign Thumbnail
                  </label>
                  <div className="space-y-3">
                    {thumbnailPreview ? (
                      <div className="relative inline-block">
                        <img
                          src={thumbnailPreview}
                          alt="Campaign thumbnail preview"
                          className="w-32 h-32 object-cover rounded-lg border-2 border-border"
                        />
                        <button
                          type="button"
                          onClick={removeThumbnail}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center text-xs hover:bg-destructive/90 transition-colors"
                          aria-label="Remove thumbnail"
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center w-32 h-32 border-2 border-dashed border-border rounded-lg bg-muted/50">
                        <div className="text-center">
                          <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                          <p className="text-xs text-muted-foreground">No image</p>
                        </div>
                      </div>
                    )}
                    
                    <div>
                      <input
                        id="thumbnail"
                        type="file"
                        accept="image/*"
                        onChange={handleThumbnailChange}
                        disabled={isLoading}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => document.getElementById('thumbnail')?.click()}
                        disabled={isLoading}
                        className="w-full max-w-xs"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        {thumbnailFile ? 'Change Thumbnail' : 'Upload Thumbnail'}
                      </Button>
                    </div>
                    
                    <p className="text-xs text-muted-foreground">
                      Recommended: 400x400px or larger. Max file size: 5MB. Supports JPG, PNG, WebP.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Campaign Details */}
            <Card>
              <CardHeader>
                <CardTitle>Campaign Details</CardTitle>
                <CardDescription>
                  Configure your token and fundraising parameters
                </CardDescription>
                <div className="pt-2">
                  <USDTPriceIndicator />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="fundraisingGoal" className="text-sm font-medium">
                      Fundraising Goal (USDT) *
                    </label>
                    <Input
                      id="fundraisingGoal"
                      type="number"
                      step="0.01"
                      min="0.1"
                      placeholder="100"
                      value={fundraisingGoal}
                      onChange={(e) => handleFundraisingGoalChange(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="tokenSymbol" className="text-sm font-medium">
                      Token Symbol *
                    </label>
                    <Input
                      id="tokenSymbol"
                      placeholder="ART"
                      value={tokenSymbol}
                      onChange={(e) => setTokenSymbol(e.target.value.toUpperCase())}
                      maxLength={10}
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="supply" className="text-sm font-medium">
                      Total Token Supply
                    </label>
                    <Input
                      id="supply"
                      type="number"
                      min="1000"
                      value={supply}
                      onChange={(e) => handleSupplyChange(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="price" className="text-sm font-medium">
                      Price per Token (USDT)
                    </label>
                    <Input
                      id="price"
                      type="number"
                      step="0.001"
                      min="0.001"
                      value={price}
                      onChange={(e) => handlePriceChange(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                </div>
                
                {/* Token Economics Display */}
                {fundraisingGoal && supply && price && (
                  <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                    <h4 className="text-sm font-medium mb-2">Token Economics</h4>
                    <div className="text-xs text-muted-foreground space-y-1">
                      <div>Goal: ${parseFloat(fundraisingGoal).toLocaleString()} USDT <span className="text-green-600">({formatUSDFromUSDT(parseFloat(fundraisingGoal))})</span></div>
                      <div>Supply: {parseFloat(supply).toLocaleString()} tokens</div>
                      <div>Price: ${parseFloat(price).toFixed(6)} USDT per token <span className="text-green-600">({formatUSDFromUSDT(parseFloat(price))} each)</span></div>
                      <div className="mt-2 pt-2 border-t border-border/50">
                        <strong>Calculation: {parseFloat(supply).toLocaleString()} × ${parseFloat(price).toFixed(6)} = ${(parseFloat(supply) * parseFloat(price)).toFixed(2)} USDT</strong>
                        <div className="text-green-600 font-medium">≈ {formatUSDFromUSDT(parseFloat(supply) * parseFloat(price))}</div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Perks */}
            <Card>
              <CardHeader>
                <CardTitle>Reward Perks</CardTitle>
                <CardDescription>
                  Define rewards for supporters based on token ownership
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {perks.map((perk, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-4">
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium">Perk {index + 1}</h4>
                      {perks.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removePerk(index)}
                          disabled={isLoading}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">
                          Perk Title
                        </label>
                        <Input
                          placeholder="Digital artwork"
                          value={perk.title}
                          onChange={(e) => updatePerk(index, 'title', e.target.value)}
                          disabled={isLoading}
                        />
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-medium">
                          Description
                        </label>
                        <Input
                          placeholder="Receive an exclusive digital artwork..."
                          value={perk.description}
                          onChange={(e) => updatePerk(index, 'description', e.target.value)}
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Minimum Tokens Required
                      </label>
                      <Input
                        type="number"
                        min="1"
                        step="1"
                        value={perk.tokenThreshold}
                        onChange={(e) => {
                          const value = e.target.value
                          // Allow empty string during typing, but update with valid number
                          if (value === '') {
                            updatePerk(index, 'tokenThreshold', 1)
                          } else {
                            updatePerk(index, 'tokenThreshold', value)
                          }
                        }}
                        onBlur={(e) => {
                          // Ensure valid value on blur
                          const value = parseFloat(e.target.value)
                          if (isNaN(value) || value < 1) {
                            updatePerk(index, 'tokenThreshold', 1)
                          }
                        }}
                        onKeyDown={(e) => {
                          // Prevent non-numeric input (except backspace, delete, tab, escape, enter, and arrow keys)
                          if (
                            !['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight'].includes(e.key) &&
                            !((e.key >= '0' && e.key <= '9') || e.key === '.')
                          ) {
                            e.preventDefault()
                          }
                        }}
                        disabled={isLoading}
                        className="max-w-32"
                        placeholder="1"
                      />
                    </div>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  onClick={addPerk}
                  disabled={isLoading}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Another Perk
                </Button>
              </CardContent>
            </Card>

            {/* Submit */}
            <div className="flex gap-4">
              <Button
                type="submit"
                size="lg"
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? 'Creating Campaign...' : 'Launch Campaign'}
              </Button>
              
              <Button
                type="button"
                variant="outline"
                size="lg"
                asChild
                disabled={isLoading}
              >
                <Link href="/">Cancel</Link>
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  )
}