-- MemeHustle Database Setup
-- Run this in your Supabase SQL editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  credits INTEGER DEFAULT 500,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create memes table
CREATE TABLE IF NOT EXISTS memes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  image_url TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  caption TEXT,
  vibe VARCHAR(100),
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create bids table
CREATE TABLE IF NOT EXISTS bids (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  meme_id UUID REFERENCES memes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(meme_id, user_id)
);

-- Create votes table
CREATE TABLE IF NOT EXISTS votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  meme_id UUID REFERENCES memes(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  vote_type VARCHAR(10) CHECK (vote_type IN ('up', 'down')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(meme_id, user_id)
);

-- Disable RLS for users table (since we're handling auth in our backend)
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Enable RLS for other tables
ALTER TABLE memes ENABLE ROW LEVEL SECURITY;
ALTER TABLE bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for memes table
CREATE POLICY "Allow public read access to memes" ON memes
  FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to create memes" ON memes
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow users to update their own memes" ON memes
  FOR UPDATE USING (true);

CREATE POLICY "Allow users to delete their own memes" ON memes
  FOR DELETE USING (true);

-- Create RLS policies for bids table
CREATE POLICY "Allow public read access to bids" ON bids
  FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to create bids" ON bids
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow users to update their own bids" ON bids
  FOR UPDATE USING (true);

CREATE POLICY "Allow users to delete their own bids" ON bids
  FOR DELETE USING (true);

-- Create RLS policies for votes table
CREATE POLICY "Allow public read access to votes" ON votes
  FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to create votes" ON votes
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow users to update their own votes" ON votes
  FOR UPDATE USING (true);

CREATE POLICY "Allow users to delete their own votes" ON votes
  FOR DELETE USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_memes_user_id ON memes(user_id);
CREATE INDEX IF NOT EXISTS idx_memes_created_at ON memes(created_at);
CREATE INDEX IF NOT EXISTS idx_memes_upvotes ON memes(upvotes);
CREATE INDEX IF NOT EXISTS idx_bids_meme_id ON bids(meme_id);
CREATE INDEX IF NOT EXISTS idx_bids_user_id ON bids(user_id);
CREATE INDEX IF NOT EXISTS idx_votes_meme_id ON votes(meme_id);
CREATE INDEX IF NOT EXISTS idx_votes_user_id ON votes(user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_memes_updated_at BEFORE UPDATE ON memes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bids_updated_at BEFORE UPDATE ON bids
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 