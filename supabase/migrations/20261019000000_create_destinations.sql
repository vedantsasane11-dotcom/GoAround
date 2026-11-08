-- ==============================================================================
-- GoAround Database Migration: Destinations & Saved Trips
-- Schema for PostgreSQL / Supabase
-- ==============================================================================

-- 1. Create destinations table
CREATE TABLE IF NOT EXISTS public.destinations (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  source_osm_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  subcategory TEXT,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  area TEXT,
  description TEXT,
  tagline TEXT,
  cost_per_person NUMERIC,
  suggested_duration_minutes INTEGER,
  image_url TEXT,
  tags TEXT[] DEFAULT '{}'::text[],
  crowd_level TEXT,
  best_time_of_day TEXT,
  local_tip TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  verification_status TEXT NOT NULL DEFAULT 'candidate' CHECK (verification_status IN ('candidate', 'verified', 'published', 'archived')),
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Add spatial coordinate bounds validation
ALTER TABLE public.destinations DROP CONSTRAINT IF EXISTS chk_destinations_lat;
ALTER TABLE public.destinations ADD CONSTRAINT chk_destinations_lat CHECK (latitude >= -90 AND latitude <= 90);

ALTER TABLE public.destinations DROP CONSTRAINT IF EXISTS chk_destinations_lng;
ALTER TABLE public.destinations ADD CONSTRAINT chk_destinations_lng CHECK (longitude >= -180 AND longitude <= 180);

-- 3. Create high-efficiency indexes for querying and filtering
CREATE INDEX IF NOT EXISTS idx_destinations_category ON public.destinations(category);
CREATE INDEX IF NOT EXISTS idx_destinations_subcategory ON public.destinations(subcategory);
CREATE INDEX IF NOT EXISTS idx_destinations_published ON public.destinations(is_published) WHERE is_published = true;
CREATE INDEX IF NOT EXISTS idx_destinations_verification_status ON public.destinations(verification_status);
CREATE INDEX IF NOT EXISTS idx_destinations_source_osm_id ON public.destinations(source_osm_id);
CREATE INDEX IF NOT EXISTS idx_destinations_coordinates ON public.destinations(latitude, longitude);

-- 4. Enable Row Level Security (RLS) on destinations
ALTER TABLE public.destinations ENABLE ROW LEVEL SECURITY;

-- 5. Public read-only policy for published destinations
-- Anyone (anon and authenticated users) can view published destinations
DROP POLICY IF EXISTS "Allow public read access to published destinations" ON public.destinations;
CREATE POLICY "Allow public read access to published destinations"
  ON public.destinations
  FOR SELECT
  USING (is_published = true AND verification_status != 'archived');

-- Notice: No INSERT, UPDATE, or DELETE policies exist for anon or authenticated roles.
-- By PostgreSQL RLS design, all client-side mutations are denied.
-- Only the service_role key or direct SQL console can insert/update the destination catalogue.

-- 6. Trigger to automatically maintain updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_destinations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_destinations_updated_at ON public.destinations;
CREATE TRIGGER set_destinations_updated_at
  BEFORE UPDATE ON public.destinations
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_destinations_updated_at();

-- 7. Saved Trips Table (Supports future cloud sync while preserving guest trips)
CREATE TABLE IF NOT EXISTS public.saved_trips (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  starting_location TEXT NOT NULL,
  duration_hours NUMERIC,
  total_cost_per_person NUMERIC,
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.saved_trips ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own saved trips" ON public.saved_trips;
CREATE POLICY "Users can view their own saved trips"
  ON public.saved_trips
  FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own saved trips" ON public.saved_trips;
CREATE POLICY "Users can insert their own saved trips"
  ON public.saved_trips
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own saved trips" ON public.saved_trips;
CREATE POLICY "Users can update their own saved trips"
  ON public.saved_trips
  FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own saved trips" ON public.saved_trips;
CREATE POLICY "Users can delete their own saved trips"
  ON public.saved_trips
  FOR DELETE
  USING (auth.uid() = user_id);
