-- Quick fix for RLS issue on users table
-- Run this in your Supabase SQL Editor

-- Disable RLS for users table
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- If the table doesn't exist, create it first
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  credits INTEGER DEFAULT 500,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Then disable RLS again (in case it was re-enabled)
ALTER TABLE users DISABLE ROW LEVEL SECURITY; 