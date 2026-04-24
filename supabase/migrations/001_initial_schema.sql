-- Enable PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;

-- Enums
CREATE TYPE court_type AS ENUM ('indoor', 'outdoor', 'covered');
CREATE TYPE booking_method AS ENUM ('playtomic', 'own_app', 'website', 'phone');
CREATE TYPE court_status AS ENUM ('open', 'coming_soon', 'closed');
CREATE TYPE skill_level AS ENUM ('beginner', 'intermediate', 'advanced');
CREATE TYPE post_skill_level AS ENUM ('beginner', 'intermediate', 'advanced', 'any');
CREATE TYPE post_status AS ENUM ('open', 'full', 'cancelled', 'expired');
CREATE TYPE contact_preference AS ENUM ('in_app', 'whatsapp');

-- Courts table
CREATE TABLE courts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  address TEXT NOT NULL,
  eircode TEXT,
  latitude DECIMAL(10, 7) NOT NULL,
  longitude DECIMAL(10, 7) NOT NULL,
  location GEOGRAPHY(POINT, 4326) GENERATED ALWAYS AS (
    ST_SetSRID(ST_MakePoint(longitude::float8, latitude::float8), 4326)::geography
  ) STORED,
  court_count INTEGER NOT NULL,
  court_type court_type NOT NULL,
  price_peak_eur DECIMAL(6, 2),
  price_offpeak_eur DECIMAL(6, 2),
  membership_required BOOLEAN NOT NULL DEFAULT FALSE,
  booking_url TEXT,
  booking_method booking_method,
  website TEXT,
  phone TEXT,
  email TEXT,
  hours JSONB,
  amenities TEXT[],
  status court_status NOT NULL DEFAULT 'open',
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  skill_level skill_level NOT NULL DEFAULT 'beginner',
  area TEXT,
  avatar_url TEXT,
  contact_preference contact_preference NOT NULL DEFAULT 'in_app',
  notification_prefs JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Posts table
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES users(id),
  court_id UUID REFERENCES courts(id),
  court_name_override TEXT,
  play_date DATE NOT NULL,
  play_time TIME NOT NULL,
  skill_level post_skill_level NOT NULL DEFAULT 'any',
  players_needed INTEGER NOT NULL,
  players_joined INTEGER NOT NULL DEFAULT 0,
  message TEXT,
  status post_status NOT NULL DEFAULT 'open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Responses table
CREATE TABLE responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- Indexes
CREATE INDEX idx_courts_location ON courts USING GIST (location);
CREATE INDEX idx_courts_slug ON courts (slug);
CREATE INDEX idx_courts_status ON courts (status);
CREATE INDEX idx_posts_status_date ON posts (status, play_date);
CREATE INDEX idx_posts_author ON posts (author_id);
CREATE INDEX idx_posts_court ON posts (court_id);
CREATE INDEX idx_responses_post ON responses (post_id);
CREATE INDEX idx_responses_user ON responses (user_id);

-- Row Level Security
ALTER TABLE courts ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE responses ENABLE ROW LEVEL SECURITY;

-- Courts: public read
CREATE POLICY "Courts are public" ON courts FOR SELECT USING (true);

-- Users: public read, own write
CREATE POLICY "Users are public" ON users FOR SELECT USING (true);
CREATE POLICY "Users insert own" ON users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users update own" ON users FOR UPDATE USING (auth.uid() = id);

-- Posts: public read, own write
CREATE POLICY "Posts are public" ON posts FOR SELECT USING (true);
CREATE POLICY "Posts insert own" ON posts FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Posts update own" ON posts FOR UPDATE USING (auth.uid() = author_id);

-- Responses: public read, own write/delete
CREATE POLICY "Responses are public" ON responses FOR SELECT USING (true);
CREATE POLICY "Responses insert own" ON responses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Responses delete own" ON responses FOR DELETE USING (auth.uid() = user_id);

-- Auto-update players_joined on response insert/delete
CREATE OR REPLACE FUNCTION update_players_joined()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET
      players_joined = players_joined + 1,
      status = CASE WHEN players_joined + 1 >= players_needed THEN 'full'::post_status ELSE status END,
      updated_at = NOW()
    WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET
      players_joined = GREATEST(players_joined - 1, 0),
      status = CASE WHEN status = 'full'::post_status THEN 'open'::post_status ELSE status END,
      updated_at = NOW()
    WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_response_change
  AFTER INSERT OR DELETE ON responses
  FOR EACH ROW EXECUTE FUNCTION update_players_joined();

-- Auto-create user profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Enable realtime for posts table
ALTER PUBLICATION supabase_realtime ADD TABLE posts;
