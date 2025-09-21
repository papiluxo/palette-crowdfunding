-- Palette Crowdfunding Database Migration
-- Run this INSTEAD of the full schema if you get column errors

-- First, let's check and update existing tables
-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Add profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    is_artist BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add campaigns table if it doesn't exist
CREATE TABLE IF NOT EXISTS campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    artist_id UUID NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    blurb TEXT,
    fundraising_goal NUMERIC NOT NULL DEFAULT 0,
    token_symbol TEXT NOT NULL,
    token_address TEXT,
    supply NUMERIC NOT NULL DEFAULT 1000000,
    price NUMERIC NOT NULL DEFAULT 0.01,
    thumbnail_url TEXT,
    images TEXT[],
    end_date TIMESTAMP WITH TIME ZONE,
    supporter_count INTEGER DEFAULT 0,
    raised_amount NUMERIC DEFAULT 0,
    status TEXT DEFAULT 'active' CHECK (status IN ('draft', 'active', 'completed', 'paused')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Check if perks table has the old structure and migrate it
DO $$
BEGIN
    -- Check if perks table exists and has artist_id column
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'perks' AND column_name = 'artist_id'
    ) THEN
        -- Drop existing policies first
        DROP POLICY IF EXISTS "Perks are viewable by everyone" ON perks;
        DROP POLICY IF EXISTS "Artists can manage their own perks" ON perks;
        
        -- Add campaign_id column if it doesn't exist
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'perks' AND column_name = 'campaign_id'
        ) THEN
            ALTER TABLE perks ADD COLUMN campaign_id UUID;
        END IF;
        
        -- Update campaign_id based on artist_id (assuming one campaign per artist for now)
        UPDATE perks SET campaign_id = (
            SELECT c.id FROM campaigns c WHERE c.artist_id = perks.artist_id LIMIT 1
        ) WHERE campaign_id IS NULL;
        
        -- Drop the old artist_id column
        ALTER TABLE perks DROP COLUMN IF EXISTS artist_id;
        
        -- Add the foreign key constraint
        ALTER TABLE perks ADD CONSTRAINT fk_perks_campaign 
            FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Create perks table if it doesn't exist at all
CREATE TABLE IF NOT EXISTS perks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    token_threshold NUMERIC NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add new tables
CREATE TABLE IF NOT EXISTS artist_education (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    artist_id UUID NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
    institution TEXT NOT NULL,
    degree_type TEXT,
    field_of_study TEXT,
    start_year INTEGER,
    end_year INTEGER,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS artist_exhibitions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    artist_id UUID NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    venue TEXT NOT NULL,
    location TEXT,
    exhibition_type TEXT,
    start_date DATE,
    end_date DATE,
    description TEXT,
    url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS artist_residencies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    artist_id UUID NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
    program_name TEXT NOT NULL,
    organization TEXT NOT NULL,
    location TEXT,
    start_date DATE,
    end_date DATE,
    description TEXT,
    url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS artist_artworks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    artist_id UUID NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    medium TEXT,
    dimensions TEXT,
    year_created INTEGER,
    image_url TEXT,
    video_url TEXT,
    price NUMERIC,
    is_for_sale BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Update purchases table to reference campaigns instead of artists
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'purchases' AND column_name = 'artist_id'
    ) THEN
        -- Add campaign_id column
        ALTER TABLE purchases ADD COLUMN IF NOT EXISTS campaign_id UUID;
        
        -- Update campaign_id based on artist_id
        UPDATE purchases SET campaign_id = (
            SELECT c.id FROM campaigns c WHERE c.artist_id = purchases.artist_id LIMIT 1
        ) WHERE campaign_id IS NULL;
        
        -- Drop old artist_id column
        ALTER TABLE purchases DROP COLUMN IF EXISTS artist_id;
        
        -- Add foreign key constraint
        ALTER TABLE purchases ADD CONSTRAINT fk_purchases_campaign 
            FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_artists_email ON artists(email);
CREATE INDEX IF NOT EXISTS idx_artists_slug ON artists(slug);
CREATE INDEX IF NOT EXISTS idx_campaigns_artist_id ON campaigns(artist_id);
CREATE INDEX IF NOT EXISTS idx_perks_campaign_id ON perks(campaign_id);
CREATE INDEX IF NOT EXISTS idx_purchases_campaign_id ON purchases(campaign_id);
CREATE INDEX IF NOT EXISTS idx_purchases_collector_wallet ON purchases(collector_wallet);
CREATE INDEX IF NOT EXISTS idx_posts_artist_id ON posts(artist_id);
CREATE INDEX IF NOT EXISTS idx_catalog_items_artist_id ON catalog_items(artist_id);
CREATE INDEX IF NOT EXISTS idx_artist_education_artist_id ON artist_education(artist_id);
CREATE INDEX IF NOT EXISTS idx_artist_exhibitions_artist_id ON artist_exhibitions(artist_id);
CREATE INDEX IF NOT EXISTS idx_artist_residencies_artist_id ON artist_residencies(artist_id);
CREATE INDEX IF NOT EXISTS idx_artist_artworks_artist_id ON artist_artworks(artist_id);

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE artists ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE perks ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalog_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE artist_education ENABLE ROW LEVEL SECURITY;
ALTER TABLE artist_exhibitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE artist_residencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE artist_artworks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Profiles policies
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

CREATE POLICY "Users can view their own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Artists policies
DROP POLICY IF EXISTS "Artists are viewable by everyone" ON artists;
DROP POLICY IF EXISTS "Users can insert their own artist profile" ON artists;
DROP POLICY IF EXISTS "Users can update their own artist profile" ON artists;

CREATE POLICY "Artists are viewable by everyone" ON artists FOR SELECT USING (true);
CREATE POLICY "Users can insert their own artist profile" ON artists FOR INSERT WITH CHECK (auth.email() = email);
CREATE POLICY "Users can update their own artist profile" ON artists FOR UPDATE USING (auth.email() = email);

-- Campaigns policies
DROP POLICY IF EXISTS "Campaigns are viewable by everyone" ON campaigns;
DROP POLICY IF EXISTS "Artists can manage their own campaigns" ON campaigns;

CREATE POLICY "Campaigns are viewable by everyone" ON campaigns FOR SELECT USING (true);
CREATE POLICY "Artists can manage their own campaigns" ON campaigns FOR ALL USING (
    EXISTS (SELECT 1 FROM artists WHERE artists.id = campaigns.artist_id AND artists.email = auth.email())
);

-- Perks policies
DROP POLICY IF EXISTS "Perks are viewable by everyone" ON perks;
DROP POLICY IF EXISTS "Artists can manage their own perks" ON perks;

CREATE POLICY "Perks are viewable by everyone" ON perks FOR SELECT USING (true);
CREATE POLICY "Artists can manage their own perks" ON perks FOR ALL USING (
    EXISTS (SELECT 1 FROM campaigns JOIN artists ON artists.id = campaigns.artist_id 
            WHERE campaigns.id = perks.campaign_id AND artists.email = auth.email())
);

-- Purchases policies
DROP POLICY IF EXISTS "Purchases are viewable by everyone" ON purchases;
DROP POLICY IF EXISTS "Anyone can insert purchases" ON purchases;

CREATE POLICY "Purchases are viewable by everyone" ON purchases FOR SELECT USING (true);
CREATE POLICY "Anyone can insert purchases" ON purchases FOR INSERT WITH CHECK (true);

-- Posts policies
DROP POLICY IF EXISTS "Posts are viewable by everyone" ON posts;
DROP POLICY IF EXISTS "Artists can manage their own posts" ON posts;

CREATE POLICY "Posts are viewable by everyone" ON posts FOR SELECT USING (true);
CREATE POLICY "Artists can manage their own posts" ON posts FOR ALL USING (
    EXISTS (SELECT 1 FROM artists WHERE artists.id = posts.artist_id AND artists.email = auth.email())
);

-- Catalog items policies
DROP POLICY IF EXISTS "Catalog items are viewable by everyone" ON catalog_items;
DROP POLICY IF EXISTS "Artists can manage their own catalog items" ON catalog_items;

CREATE POLICY "Catalog items are viewable by everyone" ON catalog_items FOR SELECT USING (true);
CREATE POLICY "Artists can manage their own catalog items" ON catalog_items FOR ALL USING (
    EXISTS (SELECT 1 FROM artists WHERE artists.id = catalog_items.artist_id AND artists.email = auth.email())
);

-- Artist education policies
DROP POLICY IF EXISTS "Artist education is viewable by everyone" ON artist_education;
DROP POLICY IF EXISTS "Artists can manage their own education" ON artist_education;

CREATE POLICY "Artist education is viewable by everyone" ON artist_education FOR SELECT USING (true);
CREATE POLICY "Artists can manage their own education" ON artist_education FOR ALL USING (
    EXISTS (SELECT 1 FROM artists WHERE artists.id = artist_education.artist_id AND artists.email = auth.email())
);

-- Artist exhibitions policies
DROP POLICY IF EXISTS "Artist exhibitions are viewable by everyone" ON artist_exhibitions;
DROP POLICY IF EXISTS "Artists can manage their own exhibitions" ON artist_exhibitions;

CREATE POLICY "Artist exhibitions are viewable by everyone" ON artist_exhibitions FOR SELECT USING (true);
CREATE POLICY "Artists can manage their own exhibitions" ON artist_exhibitions FOR ALL USING (
    EXISTS (SELECT 1 FROM artists WHERE artists.id = artist_exhibitions.artist_id AND artists.email = auth.email())
);

-- Artist residencies policies
DROP POLICY IF EXISTS "Artist residencies are viewable by everyone" ON artist_residencies;
DROP POLICY IF EXISTS "Artists can manage their own residencies" ON artist_residencies;

CREATE POLICY "Artist residencies are viewable by everyone" ON artist_residencies FOR SELECT USING (true);
CREATE POLICY "Artists can manage their own residencies" ON artist_residencies FOR ALL USING (
    EXISTS (SELECT 1 FROM artists WHERE artists.id = artist_residencies.artist_id AND artists.email = auth.email())
);

-- Artist artworks policies
DROP POLICY IF EXISTS "Artist artworks are viewable by everyone" ON artist_artworks;
DROP POLICY IF EXISTS "Artists can manage their own artworks" ON artist_artworks;

CREATE POLICY "Artist artworks are viewable by everyone" ON artist_artworks FOR SELECT USING (true);
CREATE POLICY "Artists can manage their own artworks" ON artist_artworks FOR ALL USING (
    EXISTS (SELECT 1 FROM artists WHERE artists.id = artist_artworks.artist_id AND artists.email = auth.email())
);

-- Function to generate slug from name
CREATE OR REPLACE FUNCTION generate_slug(input_name TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN LOWER(REGEXP_REPLACE(TRIM(input_name), '[^a-zA-Z0-9]+', '-', 'g'));
END;
$$ LANGUAGE plpgsql;
