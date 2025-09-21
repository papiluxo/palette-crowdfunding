-- Safe Palette Crowdfunding Database Migration
-- This version only ADDS new tables and columns without dropping anything

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

-- Create indexes (safe to run multiple times)
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_artists_email ON artists(email);
CREATE INDEX IF NOT EXISTS idx_artists_slug ON artists(slug);
CREATE INDEX IF NOT EXISTS idx_campaigns_artist_id ON campaigns(artist_id);
CREATE INDEX IF NOT EXISTS idx_purchases_collector_wallet ON purchases(collector_wallet);
CREATE INDEX IF NOT EXISTS idx_posts_artist_id ON posts(artist_id);
CREATE INDEX IF NOT EXISTS idx_catalog_items_artist_id ON catalog_items(artist_id);
CREATE INDEX IF NOT EXISTS idx_artist_education_artist_id ON artist_education(artist_id);
CREATE INDEX IF NOT EXISTS idx_artist_exhibitions_artist_id ON artist_exhibitions(artist_id);
CREATE INDEX IF NOT EXISTS idx_artist_residencies_artist_id ON artist_residencies(artist_id);
CREATE INDEX IF NOT EXISTS idx_artist_artworks_artist_id ON artist_artworks(artist_id);

-- Enable RLS on new tables only
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE artist_education ENABLE ROW LEVEL SECURITY;
ALTER TABLE artist_exhibitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE artist_residencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE artist_artworks ENABLE ROW LEVEL SECURITY;

-- Add basic policies for new tables only
-- Profiles policies
CREATE POLICY "Users can view their own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Campaigns policies
CREATE POLICY "Campaigns are viewable by everyone" ON campaigns FOR SELECT USING (true);
CREATE POLICY "Artists can manage their own campaigns" ON campaigns FOR ALL USING (
    EXISTS (SELECT 1 FROM artists WHERE artists.id = campaigns.artist_id AND artists.email = auth.email())
);

-- Artist education policies
CREATE POLICY "Artist education is viewable by everyone" ON artist_education FOR SELECT USING (true);
CREATE POLICY "Artists can manage their own education" ON artist_education FOR ALL USING (
    EXISTS (SELECT 1 FROM artists WHERE artists.id = artist_education.artist_id AND artists.email = auth.email())
);

-- Artist exhibitions policies
CREATE POLICY "Artist exhibitions are viewable by everyone" ON artist_exhibitions FOR SELECT USING (true);
CREATE POLICY "Artists can manage their own exhibitions" ON artist_exhibitions FOR ALL USING (
    EXISTS (SELECT 1 FROM artists WHERE artists.id = artist_exhibitions.artist_id AND artists.email = auth.email())
);

-- Artist residencies policies
CREATE POLICY "Artist residencies are viewable by everyone" ON artist_residencies FOR SELECT USING (true);
CREATE POLICY "Artists can manage their own residencies" ON artist_residencies FOR ALL USING (
    EXISTS (SELECT 1 FROM artists WHERE artists.id = artist_residencies.artist_id AND artists.email = auth.email())
);

-- Artist artworks policies
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
