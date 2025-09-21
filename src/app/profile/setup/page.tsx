'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { motion } from 'framer-motion'
import { ArrowLeft, Upload, Plus, Trash2, Save, Eye } from 'lucide-react'
import Link from 'next/link'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'

interface Education {
  institution: string
  degree_type: string
  field_of_study: string
  start_year: string
  end_year: string
  description: string
}

interface Exhibition {
  title: string
  venue: string
  location: string
  exhibition_type: string
  start_date: string
  end_date: string
  description: string
  url: string
}

interface Residency {
  program_name: string
  organization: string
  location: string
  start_date: string
  end_date: string
  description: string
  url: string
}

interface Artwork {
  title: string
  description: string
  medium: string
  dimensions: string
  year_created: string
  image_file: File | null
  image_preview: string | null
  price: string
  is_for_sale: boolean
  is_featured: boolean
}

export default function ProfileSetupPage() {
  const { user } = useAuth()
  const router = useRouter()
  
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [currentStep, setCurrentStep] = useState(1)
  
  // Basic Info
  const [name, setName] = useState('')
  const [bio, setBio] = useState('')
  const [location, setLocation] = useState('')
  const [websiteUrl, setWebsiteUrl] = useState('')
  const [instagramHandle, setInstagramHandle] = useState('')
  const [twitterHandle, setTwitterHandle] = useState('')
  const [linkedinUrl, setLinkedinUrl] = useState('')
  const [profileImage, setProfileImage] = useState<File | null>(null)
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null)
  const [bannerImage, setBannerImage] = useState<File | null>(null)
  const [bannerImagePreview, setBannerImagePreview] = useState<string | null>(null)

  // Education
  const [education, setEducation] = useState<Education[]>([
    { institution: '', degree_type: '', field_of_study: '', start_year: '', end_year: '', description: '' }
  ])

  // Exhibitions
  const [exhibitions, setExhibitions] = useState<Exhibition[]>([
    { title: '', venue: '', location: '', exhibition_type: '', start_date: '', end_date: '', description: '', url: '' }
  ])

  // Residencies
  const [residencies, setResidencies] = useState<Residency[]>([
    { program_name: '', organization: '', location: '', start_date: '', end_date: '', description: '', url: '' }
  ])

  // Artworks
  const [artworks, setArtworks] = useState<Artwork[]>([
    { title: '', description: '', medium: '', dimensions: '', year_created: '', image_file: null, image_preview: null, price: '', is_for_sale: false, is_featured: false }
  ])

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'profile' | 'banner' | { artwork: number }
  ) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file')
        return
      }

      if (file.size > 5 * 1024 * 1024) {
        setError('Image file size must be less than 5MB')
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        
        if (type === 'profile') {
          setProfileImage(file)
          setProfileImagePreview(result)
        } else if (type === 'banner') {
          setBannerImage(file)
          setBannerImagePreview(result)
        } else if (typeof type === 'object' && 'artwork' in type) {
          const updatedArtworks = [...artworks]
          updatedArtworks[type.artwork].image_file = file
          updatedArtworks[type.artwork].image_preview = result
          setArtworks(updatedArtworks)
        }
      }
      reader.readAsDataURL(file)
      setError('')
    }
  }

  const addEducation = () => {
    setEducation([...education, { institution: '', degree_type: '', field_of_study: '', start_year: '', end_year: '', description: '' }])
  }

  const removeEducation = (index: number) => {
    if (education.length > 1) {
      setEducation(education.filter((_, i) => i !== index))
    }
  }

  const updateEducation = (index: number, field: keyof Education, value: string) => {
    const updated = [...education]
    updated[index] = { ...updated[index], [field]: value }
    setEducation(updated)
  }

  const addExhibition = () => {
    setExhibitions([...exhibitions, { title: '', venue: '', location: '', exhibition_type: '', start_date: '', end_date: '', description: '', url: '' }])
  }

  const removeExhibition = (index: number) => {
    if (exhibitions.length > 1) {
      setExhibitions(exhibitions.filter((_, i) => i !== index))
    }
  }

  const updateExhibition = (index: number, field: keyof Exhibition, value: string) => {
    const updated = [...exhibitions]
    updated[index] = { ...updated[index], [field]: value }
    setExhibitions(updated)
  }

  const addResidency = () => {
    setResidencies([...residencies, { program_name: '', organization: '', location: '', start_date: '', end_date: '', description: '', url: '' }])
  }

  const removeResidency = (index: number) => {
    if (residencies.length > 1) {
      setResidencies(residencies.filter((_, i) => i !== index))
    }
  }

  const updateResidency = (index: number, field: keyof Residency, value: string) => {
    const updated = [...residencies]
    updated[index] = { ...updated[index], [field]: value }
    setResidencies(updated)
  }

  const addArtwork = () => {
    setArtworks([...artworks, { title: '', description: '', medium: '', dimensions: '', year_created: '', image_file: null, image_preview: null, price: '', is_for_sale: false, is_featured: false }])
  }

  const removeArtwork = (index: number) => {
    if (artworks.length > 1) {
      setArtworks(artworks.filter((_, i) => i !== index))
    }
  }

  const updateArtwork = (index: number, field: keyof Artwork, value: string | boolean) => {
    const updated = [...artworks]
    updated[index] = { ...updated[index], [field]: value }
    setArtworks(updated)
  }

  const handleSubmit = async () => {
    if (!user) {
      setError('You must be signed in to create a profile')
      return
    }

    if (!name.trim()) {
      setError('Artist name is required')
      return
    }

    if (!isSupabaseConfigured()) {
      setError('Supabase is not configured. Please set up your environment variables.')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const slug = generateSlug(name)
      
      // Check if slug already exists
      const { data: existingArtist } = await supabase!
        .from('artists')
        .select('id')
        .eq('slug', slug)
        .single()

      if (existingArtist) {
        setError('An artist with this name already exists. Please choose a different name.')
        setIsLoading(false)
        return
      }

      // TODO: In production, upload images to Supabase Storage
      // For now, we'll set these to null until image upload is implemented
      const profileImageUrl = null
      const bannerImageUrl = null

      // Create artist profile
      const { data: artist, error: artistError } = await supabase!
        .from('artists')
        .insert({
          email: user.email!,
          name,
          bio,
          location,
          website_url: websiteUrl || null,
          instagram_handle: instagramHandle || null,
          twitter_handle: twitterHandle || null,
          linkedin_url: linkedinUrl || null,
          profile_image_url: profileImageUrl,
          banner_image_url: bannerImageUrl,
          slug,
          profile_completed: true
        })
        .select()
        .single()

      if (artistError) throw artistError

      // Add education records
      const educationData = education
        .filter(edu => edu.institution.trim())
        .map(edu => ({
          artist_id: artist.id,
          institution: edu.institution,
          degree_type: edu.degree_type || null,
          field_of_study: edu.field_of_study || null,
          start_year: edu.start_year ? parseInt(edu.start_year) : null,
          end_year: edu.end_year ? parseInt(edu.end_year) : null,
          description: edu.description || null
        }))

      if (educationData.length > 0) {
        const { error: educationError } = await supabase!
          .from('artist_education')
          .insert(educationData)
        if (educationError) throw educationError
      }

      // Add exhibition records
      const exhibitionData = exhibitions
        .filter(ex => ex.title.trim() && ex.venue.trim())
        .map(ex => ({
          artist_id: artist.id,
          title: ex.title,
          venue: ex.venue,
          location: ex.location || null,
          exhibition_type: ex.exhibition_type || null,
          start_date: ex.start_date || null,
          end_date: ex.end_date || null,
          description: ex.description || null,
          url: ex.url || null
        }))

      if (exhibitionData.length > 0) {
        const { error: exhibitionError } = await supabase!
          .from('artist_exhibitions')
          .insert(exhibitionData)
        if (exhibitionError) throw exhibitionError
      }

      // Add residency records
      const residencyData = residencies
        .filter(res => res.program_name.trim() && res.organization.trim())
        .map(res => ({
          artist_id: artist.id,
          program_name: res.program_name,
          organization: res.organization,
          location: res.location || null,
          start_date: res.start_date || null,
          end_date: res.end_date || null,
          description: res.description || null,
          url: res.url || null
        }))

      if (residencyData.length > 0) {
        const { error: residencyError } = await supabase!
          .from('artist_residencies')
          .insert(residencyData)
        if (residencyError) throw residencyError
      }

      // Add artwork records
      const artworkData = artworks
        .filter(art => art.title.trim())
        .map(art => ({
          artist_id: artist.id,
          title: art.title,
          description: art.description || null,
          medium: art.medium || null,
          dimensions: art.dimensions || null,
          year_created: art.year_created ? parseInt(art.year_created) : null,
          image_url: art.image_file ? `https://example.com/artworks/${slug}-${art.title.toLowerCase().replace(/\s+/g, '-')}.jpg` : null,
          price: art.price ? parseFloat(art.price) : null,
          is_for_sale: art.is_for_sale,
          is_featured: art.is_featured
        }))

      if (artworkData.length > 0) {
        const { error: artworkError } = await supabase!
          .from('artist_artworks')
          .insert(artworkData)
        if (artworkError) throw artworkError
      }

      // Redirect to artist profile
      router.push(`/artists/${slug}`)
    } catch (err: any) {
      setError(err.message || 'Failed to create profile')
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
              You need to be signed in to create an artist profile
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

  const steps = [
    { id: 1, title: 'Basic Information', description: 'Tell us about yourself' },
    { id: 2, title: 'Education', description: 'Your academic background' },
    { id: 3, title: 'Exhibitions', description: 'Shows and exhibitions' },
    { id: 4, title: 'Residencies', description: 'Artist residencies' },
    { id: 5, title: 'Portfolio', description: 'Your artworks' },
    { id: 6, title: 'Review', description: 'Complete your profile' }
  ]

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
          <h1 className="text-4xl font-bold mb-2">Create Your Artist Profile</h1>
          <p className="text-lg text-muted-foreground">
            Complete your profile to start creating campaigns and showcasing your work
          </p>
        </motion.div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                  currentStep >= step.id ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                }`}>
                  {step.id}
                </div>
                <div className="ml-2 hidden md:block">
                  <div className={`text-sm font-medium ${currentStep >= step.id ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {step.title}
                  </div>
                  <div className="text-xs text-muted-foreground">{step.description}</div>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-12 h-0.5 mx-4 ${currentStep > step.id ? 'bg-primary' : 'bg-muted'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 text-sm text-destructive-foreground bg-destructive/10 border border-destructive/20 rounded-md">
            {error}
          </div>
        )}

        {/* Step Content */}
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="max-w-2xl mx-auto"
        >
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>
                  Tell us about yourself and your artistic practice
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Artist Name *</label>
                    <Input
                      placeholder="Your artist name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Location</label>
                    <Input
                      placeholder="City, Country"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Bio</label>
                  <textarea
                    placeholder="Tell your story and describe your artistic practice..."
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    disabled={isLoading}
                    className="w-full min-h-[120px] px-3 py-2 border border-input bg-background rounded-md text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-vertical"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Website</label>
                    <Input
                      placeholder="https://yourwebsite.com"
                      value={websiteUrl}
                      onChange={(e) => setWebsiteUrl(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Instagram</label>
                    <Input
                      placeholder="@username"
                      value={instagramHandle}
                      onChange={(e) => setInstagramHandle(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Twitter</label>
                    <Input
                      placeholder="@username"
                      value={twitterHandle}
                      onChange={(e) => setTwitterHandle(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">LinkedIn</label>
                    <Input
                      placeholder="https://linkedin.com/in/username"
                      value={linkedinUrl}
                      onChange={(e) => setLinkedinUrl(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Profile Image Upload */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Profile Image</label>
                  <div className="flex items-center gap-4">
                    {profileImagePreview ? (
                      <img
                        src={profileImagePreview}
                        alt="Profile preview"
                        className="w-16 h-16 object-cover rounded-full border-2 border-border"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full border-2 border-dashed border-border bg-muted/50 flex items-center justify-center">
                        <Upload className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageChange(e, 'profile')}
                        disabled={isLoading}
                        className="hidden"
                        id="profile-image"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => document.getElementById('profile-image')?.click()}
                        disabled={isLoading}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Profile Image
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Banner Image Upload */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Banner Image</label>
                  <div className="space-y-3">
                    {bannerImagePreview ? (
                      <img
                        src={bannerImagePreview}
                        alt="Banner preview"
                        className="w-full h-32 object-cover rounded-lg border-2 border-border"
                      />
                    ) : (
                      <div className="w-full h-32 border-2 border-dashed border-border rounded-lg bg-muted/50 flex items-center justify-center">
                        <div className="text-center">
                          <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                          <p className="text-sm text-muted-foreground">No banner image</p>
                        </div>
                      </div>
                    )}
                    <div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageChange(e, 'banner')}
                        disabled={isLoading}
                        className="hidden"
                        id="banner-image"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => document.getElementById('banner-image')?.click()}
                        disabled={isLoading}
                        className="w-full max-w-xs"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Banner Image
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Education */}
          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle>Education</CardTitle>
                <CardDescription>
                  Add your educational background and formal training
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {education.map((edu, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-4">
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium">Education {index + 1}</h4>
                      {education.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeEducation(index)}
                          disabled={isLoading}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Institution</label>
                        <Input
                          placeholder="University or School name"
                          value={edu.institution}
                          onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                          disabled={isLoading}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Degree Type</label>
                        <Input
                          placeholder="BFA, MFA, PhD, Certificate, etc."
                          value={edu.degree_type}
                          onChange={(e) => updateEducation(index, 'degree_type', e.target.value)}
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Field of Study</label>
                      <Input
                        placeholder="Fine Arts, Digital Media, Painting, etc."
                        value={edu.field_of_study}
                        onChange={(e) => updateEducation(index, 'field_of_study', e.target.value)}
                        disabled={isLoading}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Start Year</label>
                        <Input
                          type="number"
                          placeholder="2018"
                          value={edu.start_year}
                          onChange={(e) => updateEducation(index, 'start_year', e.target.value)}
                          disabled={isLoading}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">End Year</label>
                        <Input
                          type="number"
                          placeholder="2022"
                          value={edu.end_year}
                          onChange={(e) => updateEducation(index, 'end_year', e.target.value)}
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Description</label>
                      <textarea
                        placeholder="Describe your studies, achievements, or notable projects..."
                        value={edu.description}
                        onChange={(e) => updateEducation(index, 'description', e.target.value)}
                        disabled={isLoading}
                        className="w-full min-h-[80px] px-3 py-2 border border-input bg-background rounded-md text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-vertical"
                      />
                    </div>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  onClick={addEducation}
                  disabled={isLoading}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Another Education
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Exhibitions */}
          {currentStep === 3 && (
            <Card>
              <CardHeader>
                <CardTitle>Exhibitions</CardTitle>
                <CardDescription>
                  Add exhibitions, shows, and other displays of your work
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {exhibitions.map((ex, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-4">
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium">Exhibition {index + 1}</h4>
                      {exhibitions.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeExhibition(index)}
                          disabled={isLoading}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Exhibition Title</label>
                        <Input
                          placeholder="Name of the exhibition"
                          value={ex.title}
                          onChange={(e) => updateExhibition(index, 'title', e.target.value)}
                          disabled={isLoading}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Venue</label>
                        <Input
                          placeholder="Gallery, Museum, or Space name"
                          value={ex.venue}
                          onChange={(e) => updateExhibition(index, 'venue', e.target.value)}
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Location</label>
                        <Input
                          placeholder="City, Country"
                          value={ex.location}
                          onChange={(e) => updateExhibition(index, 'location', e.target.value)}
                          disabled={isLoading}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Type</label>
                        <Input
                          placeholder="Solo, Group, Online, etc."
                          value={ex.exhibition_type}
                          onChange={(e) => updateExhibition(index, 'exhibition_type', e.target.value)}
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Start Date</label>
                        <Input
                          type="date"
                          value={ex.start_date}
                          onChange={(e) => updateExhibition(index, 'start_date', e.target.value)}
                          disabled={isLoading}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">End Date</label>
                        <Input
                          type="date"
                          value={ex.end_date}
                          onChange={(e) => updateExhibition(index, 'end_date', e.target.value)}
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Description</label>
                        <textarea
                          placeholder="Describe the exhibition and your participation..."
                          value={ex.description}
                          onChange={(e) => updateExhibition(index, 'description', e.target.value)}
                          disabled={isLoading}
                          className="w-full min-h-[80px] px-3 py-2 border border-input bg-background rounded-md text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-vertical"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">URL</label>
                        <Input
                          placeholder="https://exhibition-website.com"
                          value={ex.url}
                          onChange={(e) => updateExhibition(index, 'url', e.target.value)}
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  onClick={addExhibition}
                  disabled={isLoading}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Another Exhibition
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Step 4: Residencies */}
          {currentStep === 4 && (
            <Card>
              <CardHeader>
                <CardTitle>Artist Residencies</CardTitle>
                <CardDescription>
                  Add artist residencies and fellowships you've participated in
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {residencies.map((res, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-4">
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium">Residency {index + 1}</h4>
                      {residencies.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeResidency(index)}
                          disabled={isLoading}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Program Name</label>
                        <Input
                          placeholder="Name of the residency program"
                          value={res.program_name}
                          onChange={(e) => updateResidency(index, 'program_name', e.target.value)}
                          disabled={isLoading}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Organization</label>
                        <Input
                          placeholder="Host organization or institution"
                          value={res.organization}
                          onChange={(e) => updateResidency(index, 'organization', e.target.value)}
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Location</label>
                      <Input
                        placeholder="City, Country"
                        value={res.location}
                        onChange={(e) => updateResidency(index, 'location', e.target.value)}
                        disabled={isLoading}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Start Date</label>
                        <Input
                          type="date"
                          value={res.start_date}
                          onChange={(e) => updateResidency(index, 'start_date', e.target.value)}
                          disabled={isLoading}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">End Date</label>
                        <Input
                          type="date"
                          value={res.end_date}
                          onChange={(e) => updateResidency(index, 'end_date', e.target.value)}
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Description</label>
                        <textarea
                          placeholder="Describe your experience and what you created..."
                          value={res.description}
                          onChange={(e) => updateResidency(index, 'description', e.target.value)}
                          disabled={isLoading}
                          className="w-full min-h-[80px] px-3 py-2 border border-input bg-background rounded-md text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-vertical"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">URL</label>
                        <Input
                          placeholder="https://residency-website.com"
                          value={res.url}
                          onChange={(e) => updateResidency(index, 'url', e.target.value)}
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  onClick={addResidency}
                  disabled={isLoading}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Another Residency
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Step 5: Portfolio */}
          {currentStep === 5 && (
            <Card>
              <CardHeader>
                <CardTitle>Portfolio</CardTitle>
                <CardDescription>
                  Upload your artworks to showcase your creative practice
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {artworks.map((art, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-4">
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium">Artwork {index + 1}</h4>
                      {artworks.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeArtwork(index)}
                          disabled={isLoading}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    {/* Image Upload */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Artwork Image</label>
                      <div className="flex items-center gap-4">
                        {art.image_preview ? (
                          <img
                            src={art.image_preview}
                            alt="Artwork preview"
                            className="w-24 h-24 object-cover rounded-lg border-2 border-border"
                          />
                        ) : (
                          <div className="w-24 h-24 border-2 border-dashed border-border rounded-lg bg-muted/50 flex items-center justify-center">
                            <Upload className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                        <div>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageChange(e, { artwork: index })}
                            disabled={isLoading}
                            className="hidden"
                            id={`artwork-image-${index}`}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => document.getElementById(`artwork-image-${index}`)?.click()}
                            disabled={isLoading}
                          >
                            <Upload className="h-4 w-4 mr-2" />
                            Upload Image
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Title</label>
                        <Input
                          placeholder="Artwork title"
                          value={art.title}
                          onChange={(e) => updateArtwork(index, 'title', e.target.value)}
                          disabled={isLoading}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Year Created</label>
                        <Input
                          type="number"
                          placeholder="2023"
                          value={art.year_created}
                          onChange={(e) => updateArtwork(index, 'year_created', e.target.value)}
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Medium</label>
                        <Input
                          placeholder="Oil on canvas, Digital, Mixed media, etc."
                          value={art.medium}
                          onChange={(e) => updateArtwork(index, 'medium', e.target.value)}
                          disabled={isLoading}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Dimensions</label>
                        <Input
                          placeholder="24 x 36 inches, 1920 x 1080 px, etc."
                          value={art.dimensions}
                          onChange={(e) => updateArtwork(index, 'dimensions', e.target.value)}
                          disabled={isLoading}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Description</label>
                      <textarea
                        placeholder="Describe the artwork, inspiration, technique..."
                        value={art.description}
                        onChange={(e) => updateArtwork(index, 'description', e.target.value)}
                        disabled={isLoading}
                        className="w-full min-h-[80px] px-3 py-2 border border-input bg-background rounded-md text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-vertical"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Price (USDT) - Optional</label>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={art.price}
                          onChange={(e) => updateArtwork(index, 'price', e.target.value)}
                          disabled={isLoading}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Options</label>
                        <div className="flex gap-4">
                          <label className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={art.is_for_sale}
                              onChange={(e) => updateArtwork(index, 'is_for_sale', e.target.checked)}
                              disabled={isLoading}
                            />
                            <span className="text-sm">For Sale</span>
                          </label>
                          <label className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={art.is_featured}
                              onChange={(e) => updateArtwork(index, 'is_featured', e.target.checked)}
                              disabled={isLoading}
                            />
                            <span className="text-sm">Featured</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  onClick={addArtwork}
                  disabled={isLoading}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Another Artwork
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Step 6: Review */}
          {currentStep === 6 && (
            <Card>
              <CardHeader>
                <CardTitle>Review Your Profile</CardTitle>
                <CardDescription>
                  Review all information before completing your artist profile
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium">Basic Information</h4>
                    <div className="text-sm space-y-1">
                      <p><strong>Name:</strong> {name || 'Not provided'}</p>
                      <p><strong>Location:</strong> {location || 'Not provided'}</p>
                      <p><strong>Bio:</strong> {bio ? `${bio.slice(0, 100)}${bio.length > 100 ? '...' : ''}` : 'Not provided'}</p>
                      <p><strong>Website:</strong> {websiteUrl || 'Not provided'}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-medium">Portfolio Summary</h4>
                    <div className="text-sm space-y-1">
                      <p><strong>Education Records:</strong> {education.filter(e => e.institution.trim()).length}</p>
                      <p><strong>Exhibitions:</strong> {exhibitions.filter(e => e.title.trim() && e.venue.trim()).length}</p>
                      <p><strong>Residencies:</strong> {residencies.filter(r => r.program_name.trim()).length}</p>
                      <p><strong>Artworks:</strong> {artworks.filter(a => a.title.trim()).length}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 p-4 bg-muted/50 rounded-lg">
                  <Eye className="h-5 w-5 text-muted-foreground" />
                  <div className="text-sm">
                    <p className="font-medium">Ready to create your profile?</p>
                    <p className="text-muted-foreground">
                      Once completed, you'll be able to create campaigns and showcase your work.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1 || isLoading}
            >
              Previous
            </Button>
            
            {currentStep < 6 ? (
              <Button
                onClick={() => setCurrentStep(currentStep + 1)}
                disabled={isLoading || (currentStep === 1 && !name.trim())}
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isLoading || !name.trim()}
              >
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? 'Creating Profile...' : 'Complete Profile'}
              </Button>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
