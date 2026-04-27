-- =====================================================
-- LODHI VIVAH - Complete Database Schema
-- Run this ONCE in Supabase SQL Editor
-- =====================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- PROFILES TABLE
CREATE TABLE IF NOT EXISTS profiles (
  id                UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id           UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  name              TEXT NOT NULL,
  gender            TEXT NOT NULL CHECK (gender IN ('male','female')),
  date_of_birth     DATE NOT NULL,
  height_cm         INTEGER DEFAULT 160,
  complexion        TEXT DEFAULT 'fair',
  marital_status    TEXT DEFAULT 'never_married',
  about_me          TEXT DEFAULT '',
  education         TEXT DEFAULT '',
  education_detail  TEXT DEFAULT '',
  occupation        TEXT DEFAULT '',
  occupation_detail TEXT DEFAULT '',
  annual_income     TEXT DEFAULT '',
  city              TEXT DEFAULT '',
  district          TEXT DEFAULT '',
  state             TEXT DEFAULT 'Madhya Pradesh',
  father_name       TEXT DEFAULT '',
  father_occupation TEXT DEFAULT '',
  mother_name       TEXT DEFAULT '',
  gotra             TEXT DEFAULT '',
  manglik           BOOLEAN DEFAULT false,
  phone             TEXT NOT NULL,
  whatsapp          TEXT DEFAULT '',
  photo_url         TEXT DEFAULT '',
  status            TEXT DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  is_premium        BOOLEAN DEFAULT false,
  plan              TEXT DEFAULT 'free' CHECK (plan IN ('free','silver','gold')),
  premium_until     TIMESTAMPTZ,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  updated_at        TIMESTAMPTZ DEFAULT NOW()
);

-- INTERESTS TABLE
CREATE TABLE IF NOT EXISTS interests (
  id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  sender_id   UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  receiver_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  status      TEXT DEFAULT 'pending' CHECK (status IN ('pending','accepted','rejected')),
  message     TEXT DEFAULT '',
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(sender_id, receiver_id)
);

-- ADMIN USERS TABLE
CREATE TABLE IF NOT EXISTS admin_users (
  id         UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id    UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- AUTO UPDATE updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ language 'plpgsql';

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- INDEXES for fast search
CREATE INDEX IF NOT EXISTS idx_profiles_gender  ON profiles(gender);
CREATE INDEX IF NOT EXISTS idx_profiles_status  ON profiles(status);
CREATE INDEX IF NOT EXISTS idx_profiles_state   ON profiles(state);
CREATE INDEX IF NOT EXISTS idx_profiles_city    ON profiles(city);

-- ROW LEVEL SECURITY
ALTER TABLE profiles    ENABLE ROW LEVEL SECURITY;
ALTER TABLE interests   ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Anyone can view approved profiles
CREATE POLICY "view_approved_profiles" ON profiles
  FOR SELECT USING (status = 'approved');

-- Users can view their own profile
CREATE POLICY "view_own_profile" ON profiles
  FOR SELECT USING (auth.uid() = user_id);

-- Users can create their own profile
CREATE POLICY "create_own_profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own profile
CREATE POLICY "update_own_profile" ON profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Interests: users can view their own
CREATE POLICY "view_own_interests" ON interests
  FOR SELECT USING (
    sender_id IN (SELECT id FROM profiles WHERE user_id = auth.uid()) OR
    receiver_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "send_interest" ON interests
  FOR INSERT WITH CHECK (
    sender_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  );

CREATE POLICY "respond_interest" ON interests
  FOR UPDATE USING (
    receiver_id IN (SELECT id FROM profiles WHERE user_id = auth.uid())
  );

-- =====================================================
-- AFTER RUNNING: 
-- 1. Go to Supabase > Storage > New bucket: "profile-photos" (public)
-- 2. Register on your website
-- 3. Then insert your user_id into admin_users table to become admin
-- =====================================================
