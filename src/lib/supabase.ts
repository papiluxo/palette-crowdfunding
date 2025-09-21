import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const isSupabaseConfigured = () => {
  return !!(supabaseUrl && supabaseAnonKey)
}

// Create Supabase client only if properly configured
export const supabase = isSupabaseConfigured() 
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null

// Database type definitions
export type Database = {
  public: {
    Tables: {
      artists: {
        Row: {
          id: string
          email: string
          name: string
          bio: string | null
          location: string | null
          website_url: string | null
          instagram_handle: string | null
          twitter_handle: string | null
          linkedin_url: string | null
          banner_image_url: string | null
          profile_image_url: string | null
          slug: string
          profile_completed: boolean
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          name: string
          bio?: string | null
          location?: string | null
          website_url?: string | null
          instagram_handle?: string | null
          twitter_handle?: string | null
          linkedin_url?: string | null
          banner_image_url?: string | null
          profile_image_url?: string | null
          slug: string
          profile_completed?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          bio?: string | null
          location?: string | null
          website_url?: string | null
          instagram_handle?: string | null
          twitter_handle?: string | null
          linkedin_url?: string | null
          banner_image_url?: string | null
          profile_image_url?: string | null
          slug?: string
          profile_completed?: boolean
          created_at?: string
        }
      }
      campaigns: {
        Row: {
          id: string
          artist_id: string
          title: string
          description: string | null
          blurb: string | null
          fundraising_goal: number
          token_symbol: string
          token_address: string | null
          supply: number
          price: number
          thumbnail_url: string | null
          images: string[] | null
          end_date: string | null
          supporter_count: number
          raised_amount: number
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          artist_id: string
          title: string
          description?: string | null
          blurb?: string | null
          fundraising_goal: number
          token_symbol: string
          token_address?: string | null
          supply?: number
          price: number
          thumbnail_url?: string | null
          images?: string[] | null
          end_date?: string | null
          supporter_count?: number
          raised_amount?: number
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          artist_id?: string
          title?: string
          description?: string | null
          blurb?: string | null
          fundraising_goal?: number
          token_symbol?: string
          token_address?: string | null
          supply?: number
          price?: number
          thumbnail_url?: string | null
          images?: string[] | null
          end_date?: string | null
          supporter_count?: number
          raised_amount?: number
          status?: string
          created_at?: string
        }
      }
      artist_education: {
        Row: {
          id: string
          artist_id: string
          institution: string
          degree_type: string | null
          field_of_study: string | null
          start_year: number | null
          end_year: number | null
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          artist_id: string
          institution: string
          degree_type?: string | null
          field_of_study?: string | null
          start_year?: number | null
          end_year?: number | null
          description?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          artist_id?: string
          institution?: string
          degree_type?: string | null
          field_of_study?: string | null
          start_year?: number | null
          end_year?: number | null
          description?: string | null
          created_at?: string
        }
      }
      artist_exhibitions: {
        Row: {
          id: string
          artist_id: string
          title: string
          venue: string
          location: string | null
          exhibition_type: string | null
          start_date: string | null
          end_date: string | null
          description: string | null
          url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          artist_id: string
          title: string
          venue: string
          location?: string | null
          exhibition_type?: string | null
          start_date?: string | null
          end_date?: string | null
          description?: string | null
          url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          artist_id?: string
          title?: string
          venue?: string
          location?: string | null
          exhibition_type?: string | null
          start_date?: string | null
          end_date?: string | null
          description?: string | null
          url?: string | null
          created_at?: string
        }
      }
      artist_residencies: {
        Row: {
          id: string
          artist_id: string
          program_name: string
          organization: string
          location: string | null
          start_date: string | null
          end_date: string | null
          description: string | null
          url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          artist_id: string
          program_name: string
          organization: string
          location?: string | null
          start_date?: string | null
          end_date?: string | null
          description?: string | null
          url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          artist_id?: string
          program_name?: string
          organization?: string
          location?: string | null
          start_date?: string | null
          end_date?: string | null
          description?: string | null
          url?: string | null
          created_at?: string
        }
      }
      artist_artworks: {
        Row: {
          id: string
          artist_id: string
          title: string
          description: string | null
          medium: string | null
          dimensions: string | null
          year_created: number | null
          image_url: string | null
          video_url: string | null
          price: number | null
          is_for_sale: boolean
          is_featured: boolean
          created_at: string
        }
        Insert: {
          id?: string
          artist_id: string
          title: string
          description?: string | null
          medium?: string | null
          dimensions?: string | null
          year_created?: number | null
          image_url?: string | null
          video_url?: string | null
          price?: number | null
          is_for_sale?: boolean
          is_featured?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          artist_id?: string
          title?: string
          description?: string | null
          medium?: string | null
          dimensions?: string | null
          year_created?: number | null
          image_url?: string | null
          video_url?: string | null
          price?: number | null
          is_for_sale?: boolean
          is_featured?: boolean
          created_at?: string
        }
      }
      perks: {
        Row: {
          id: string
          campaign_id: string
          title: string
          description: string
          token_threshold: number
          created_at: string
        }
        Insert: {
          id?: string
          campaign_id: string
          title: string
          description: string
          token_threshold?: number
          created_at?: string
        }
        Update: {
          id?: string
          campaign_id?: string
          title?: string
          description?: string
          token_threshold?: number
          created_at?: string
        }
      }
      purchases: {
        Row: {
          id: string
          campaign_id: string
          collector_wallet: string
          tokens_purchased: number
          usdt_paid: number
          transaction_hash: string
          timestamp: string
        }
        Insert: {
          id?: string
          campaign_id: string
          collector_wallet: string
          tokens_purchased: number
          usdt_paid: number
          transaction_hash: string
          timestamp?: string
        }
        Update: {
          id?: string
          campaign_id?: string
          collector_wallet?: string
          tokens_purchased?: number
          usdt_paid?: number
          transaction_hash?: string
          timestamp?: string
        }
      }
      posts: {
        Row: {
          id: string
          artist_id: string
          title: string
          content: string
          image_urls: string[] | null
          created_at: string
        }
        Insert: {
          id?: string
          artist_id: string
          title: string
          content: string
          image_urls?: string[] | null
          created_at?: string
        }
        Update: {
          id?: string
          artist_id?: string
          title?: string
          content?: string
          image_urls?: string[] | null
          created_at?: string
        }
      }
      catalog_items: {
        Row: {
          id: string
          artist_id: string
          title: string
          description: string
          price_usd: number
          image_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          artist_id: string
          title: string
          description: string
          price_usd?: number
          image_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          artist_id?: string
          title?: string
          description?: string
          price_usd?: number
          image_url?: string | null
          created_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          email: string
          is_artist: boolean
          created_at: string
        }
        Insert: {
          id: string
          email: string
          is_artist: boolean
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          is_artist?: boolean
          created_at?: string
        }
      }
    }
  }
}

export type Artist = Database['public']['Tables']['artists']['Row']
export type Campaign = Database['public']['Tables']['campaigns']['Row']
export type ArtistEducation = Database['public']['Tables']['artist_education']['Row']
export type ArtistExhibition = Database['public']['Tables']['artist_exhibitions']['Row']
export type ArtistResidency = Database['public']['Tables']['artist_residencies']['Row']
export type ArtistArtwork = Database['public']['Tables']['artist_artworks']['Row']
export type Perk = Database['public']['Tables']['perks']['Row']
export type Purchase = Database['public']['Tables']['purchases']['Row']
export type Post = Database['public']['Tables']['posts']['Row']
export type CatalogItem = Database['public']['Tables']['catalog_items']['Row']
export type Profile = Database['public']['Tables']['profiles']['Row']
