-- ============================================================================
-- STRING PLATFORM - STRUCTURED LOCAL LOCATIONS & DELIVERY FEES
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.location_areas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.location_streets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  area_id UUID NOT NULL REFERENCES public.location_areas(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(area_id, slug)
);

CREATE TABLE IF NOT EXISTS public.location_landmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  street_id UUID NOT NULL REFERENCES public.location_streets(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  kind TEXT NOT NULL DEFAULT 'landmark' CHECK (kind IN ('hostel', 'gate', 'junction', 'market', 'campus', 'landmark', 'street')),
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(street_id, slug)
);

ALTER TABLE public.location_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.location_streets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.location_landmarks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view location areas" ON public.location_areas;
CREATE POLICY "Anyone can view location areas"
  ON public.location_areas FOR SELECT
  USING (is_active = true);

DROP POLICY IF EXISTS "Anyone can view location streets" ON public.location_streets;
CREATE POLICY "Anyone can view location streets"
  ON public.location_streets FOR SELECT
  USING (is_active = true);

DROP POLICY IF EXISTS "Anyone can view location landmarks" ON public.location_landmarks;
CREATE POLICY "Anyone can view location landmarks"
  ON public.location_landmarks FOR SELECT
  USING (is_active = true);

DROP POLICY IF EXISTS "Admins can manage location areas" ON public.location_areas;
CREATE POLICY "Admins can manage location areas"
  ON public.location_areas FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can manage location streets" ON public.location_streets;
CREATE POLICY "Admins can manage location streets"
  ON public.location_streets FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Admins can manage location landmarks" ON public.location_landmarks;
CREATE POLICY "Admins can manage location landmarks"
  ON public.location_landmarks FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE INDEX IF NOT EXISTS idx_location_streets_area_id ON public.location_streets(area_id);
CREATE INDEX IF NOT EXISTS idx_location_landmarks_street_id ON public.location_landmarks(street_id);
CREATE INDEX IF NOT EXISTS idx_location_landmarks_coords ON public.location_landmarks(latitude, longitude);

ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS location_area_id UUID REFERENCES public.location_areas(id) ON DELETE SET NULL;
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS location_street_id UUID REFERENCES public.location_streets(id) ON DELETE SET NULL;
ALTER TABLE public.businesses ADD COLUMN IF NOT EXISTS location_landmark_id UUID REFERENCES public.location_landmarks(id) ON DELETE SET NULL;

ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS location_area_id UUID REFERENCES public.location_areas(id) ON DELETE SET NULL;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS location_street_id UUID REFERENCES public.location_streets(id) ON DELETE SET NULL;
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS location_landmark_id UUID REFERENCES public.location_landmarks(id) ON DELETE SET NULL;

ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS delivery_landmark_id UUID REFERENCES public.location_landmarks(id) ON DELETE SET NULL;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS delivery_distance_km NUMERIC(8, 2);
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS delivery_pricing JSONB NOT NULL DEFAULT '{}'::jsonb;

INSERT INTO public.system_settings (key, value)
VALUES
  ('delivery_rate_per_km', '250'::jsonb),
  ('delivery_min_fee', '300'::jsonb),
  ('delivery_curvature_multiplier', '1.3'::jsonb),
  ('delivery_extra_stop_fee', '150'::jsonb)
ON CONFLICT (key) DO NOTHING;

CREATE OR REPLACE FUNCTION public.haversine_distance_km(
  p_from_lat DOUBLE PRECISION,
  p_from_lng DOUBLE PRECISION,
  p_to_lat DOUBLE PRECISION,
  p_to_lng DOUBLE PRECISION
)
RETURNS DOUBLE PRECISION
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  v_radius CONSTANT DOUBLE PRECISION := 6371;
  v_dlat DOUBLE PRECISION;
  v_dlng DOUBLE PRECISION;
  v_a DOUBLE PRECISION;
BEGIN
  v_dlat := radians(p_to_lat - p_from_lat);
  v_dlng := radians(p_to_lng - p_from_lng);

  v_a :=
    sin(v_dlat / 2) * sin(v_dlat / 2) +
    cos(radians(p_from_lat)) * cos(radians(p_to_lat)) *
    sin(v_dlng / 2) * sin(v_dlng / 2);

  RETURN v_radius * (2 * atan2(sqrt(v_a), sqrt(1 - v_a)));
END;
$$;

CREATE OR REPLACE FUNCTION public.calculate_delivery_fee(
  p_from_lat DOUBLE PRECISION,
  p_from_lng DOUBLE PRECISION,
  p_to_lat DOUBLE PRECISION,
  p_to_lng DOUBLE PRECISION,
  p_rate_per_km NUMERIC DEFAULT 250,
  p_min_fee NUMERIC DEFAULT 300,
  p_curvature_multiplier NUMERIC DEFAULT 1.3
)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  v_straight_km NUMERIC;
  v_road_km NUMERIC;
  v_fee NUMERIC;
BEGIN
  v_straight_km := public.haversine_distance_km(p_from_lat, p_from_lng, p_to_lat, p_to_lng);
  v_road_km := round(v_straight_km * p_curvature_multiplier, 2);
  v_fee := greatest(p_min_fee, ceil((v_road_km * p_rate_per_km) / 50) * 50);

  RETURN jsonb_build_object(
    'straight_distance_km', round(v_straight_km, 2),
    'estimated_road_distance_km', v_road_km,
    'curvature_multiplier', p_curvature_multiplier,
    'rate_per_km', p_rate_per_km,
    'min_fee', p_min_fee,
    'fee', v_fee
  );
END;
$$;

DO $$
DECLARE
  v_area_id UUID;
  v_street_id UUID;
BEGIN
  INSERT INTO public.location_areas (name, slug, sort_order)
  VALUES
    ('Lagos Garage', 'lagos-garage', 10),
    ('OOU Main Campus', 'oou-main-campus', 20),
    ('Mini Campus', 'mini-campus', 30),
    ('Itamerin', 'itamerin', 40),
    ('Oru', 'oru', 50),
    ('Chips', 'chips', 60),
    ('Okomerin', 'okomerin', 70),
    ('Ago Town', 'ago-town', 80)
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    sort_order = EXCLUDED.sort_order,
    is_active = true;

  SELECT id INTO v_area_id FROM public.location_areas WHERE slug = 'lagos-garage';
  INSERT INTO public.location_streets (area_id, name, slug, sort_order)
  VALUES
    (v_area_id, 'Ibadan Road', 'ibadan-road', 10),
    (v_area_id, 'Garage Road', 'garage-road', 20),
    (v_area_id, 'Ago-Iwoye Road', 'ago-iwoye-road', 30)
  ON CONFLICT (area_id, slug) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order, is_active = true;

  SELECT id INTO v_street_id FROM public.location_streets WHERE area_id = v_area_id AND slug = 'ibadan-road';
  INSERT INTO public.location_landmarks (street_id, name, slug, latitude, longitude, kind, sort_order)
  VALUES
    (v_street_id, 'Lagos Garage Motor Park', 'lagos-garage-motor-park', 6.9369, 3.9229, 'junction', 10),
    (v_street_id, 'Ibadan Road Junction', 'ibadan-road-junction', 6.9382, 3.9241, 'junction', 20),
    (v_street_id, 'OOU Mini Campus Gate', 'oou-mini-campus-gate-from-ibadan-road', 6.9417, 3.9297, 'gate', 30)
  ON CONFLICT (street_id, slug) DO UPDATE SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, kind = EXCLUDED.kind, sort_order = EXCLUDED.sort_order, is_active = true;

  SELECT id INTO v_street_id FROM public.location_streets WHERE area_id = v_area_id AND slug = 'garage-road';
  INSERT INTO public.location_landmarks (street_id, name, slug, latitude, longitude, kind, sort_order)
  VALUES
    (v_street_id, 'Ago Garage Roundabout', 'ago-garage-roundabout', 6.9348, 3.9216, 'junction', 10),
    (v_street_id, 'Garage Market Line', 'garage-market-line', 6.9335, 3.9208, 'market', 20)
  ON CONFLICT (street_id, slug) DO UPDATE SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, kind = EXCLUDED.kind, sort_order = EXCLUDED.sort_order, is_active = true;

  SELECT id INTO v_area_id FROM public.location_areas WHERE slug = 'oou-main-campus';
  INSERT INTO public.location_streets (area_id, name, slug, sort_order)
  VALUES
    (v_area_id, 'Permanent Site Road', 'permanent-site-road', 10),
    (v_area_id, 'Senate Road', 'senate-road', 20),
    (v_area_id, 'Science Road', 'science-road', 30)
  ON CONFLICT (area_id, slug) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order, is_active = true;

  SELECT id INTO v_street_id FROM public.location_streets WHERE area_id = v_area_id AND slug = 'permanent-site-road';
  INSERT INTO public.location_landmarks (street_id, name, slug, latitude, longitude, kind, sort_order)
  VALUES
    (v_street_id, 'OOU Main Gate', 'oou-main-gate', 6.9538, 3.9317, 'gate', 10),
    (v_street_id, 'Permanent Site Shuttle Park', 'permanent-site-shuttle-park', 6.9529, 3.9328, 'junction', 20),
    (v_street_id, 'OOU Library Axis', 'oou-library-axis', 6.9562, 3.9344, 'campus', 30)
  ON CONFLICT (street_id, slug) DO UPDATE SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, kind = EXCLUDED.kind, sort_order = EXCLUDED.sort_order, is_active = true;

  SELECT id INTO v_street_id FROM public.location_streets WHERE area_id = v_area_id AND slug = 'senate-road';
  INSERT INTO public.location_landmarks (street_id, name, slug, latitude, longitude, kind, sort_order)
  VALUES
    (v_street_id, 'Senate Building', 'senate-building', 6.9572, 3.9361, 'campus', 10),
    (v_street_id, 'Lecture Theatre Axis', 'lecture-theatre-axis', 6.9556, 3.9352, 'campus', 20)
  ON CONFLICT (street_id, slug) DO UPDATE SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, kind = EXCLUDED.kind, sort_order = EXCLUDED.sort_order, is_active = true;

  SELECT id INTO v_area_id FROM public.location_areas WHERE slug = 'mini-campus';
  INSERT INTO public.location_streets (area_id, name, slug, sort_order)
  VALUES
    (v_area_id, 'Mini Campus Road', 'mini-campus-road', 10),
    (v_area_id, 'Ibefun Road', 'ibefun-road', 20)
  ON CONFLICT (area_id, slug) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order, is_active = true;

  SELECT id INTO v_street_id FROM public.location_streets WHERE area_id = v_area_id AND slug = 'mini-campus-road';
  INSERT INTO public.location_landmarks (street_id, name, slug, latitude, longitude, kind, sort_order)
  VALUES
    (v_street_id, 'Mini Campus Main Gate', 'mini-campus-main-gate', 6.9421, 3.9298, 'gate', 10),
    (v_street_id, 'Mini Campus Hostel Line', 'mini-campus-hostel-line', 6.9430, 3.9305, 'hostel', 20),
    (v_street_id, 'Mini Campus Junction', 'mini-campus-junction', 6.9408, 3.9287, 'junction', 30)
  ON CONFLICT (street_id, slug) DO UPDATE SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, kind = EXCLUDED.kind, sort_order = EXCLUDED.sort_order, is_active = true;

  SELECT id INTO v_area_id FROM public.location_areas WHERE slug = 'itamerin';
  INSERT INTO public.location_streets (area_id, name, slug, sort_order)
  VALUES
    (v_area_id, 'Itamerin Road', 'itamerin-road', 10),
    (v_area_id, 'Itamerin Junction Road', 'itamerin-junction-road', 20)
  ON CONFLICT (area_id, slug) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order, is_active = true;

  SELECT id INTO v_street_id FROM public.location_streets WHERE area_id = v_area_id AND slug = 'itamerin-road';
  INSERT INTO public.location_landmarks (street_id, name, slug, latitude, longitude, kind, sort_order)
  VALUES
    (v_street_id, 'Itamerin Junction', 'itamerin-junction', 6.9388, 3.9212, 'junction', 10),
    (v_street_id, 'Itamerin Hostel Axis', 'itamerin-hostel-axis', 6.9401, 3.9226, 'hostel', 20),
    (v_street_id, 'Itamerin Shops Line', 'itamerin-shops-line', 6.9374, 3.9205, 'market', 30)
  ON CONFLICT (street_id, slug) DO UPDATE SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, kind = EXCLUDED.kind, sort_order = EXCLUDED.sort_order, is_active = true;

  SELECT id INTO v_area_id FROM public.location_areas WHERE slug = 'oru';
  INSERT INTO public.location_streets (area_id, name, slug, sort_order)
  VALUES
    (v_area_id, 'Oru Road', 'oru-road', 10),
    (v_area_id, 'Oru Junction Road', 'oru-junction-road', 20)
  ON CONFLICT (area_id, slug) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order, is_active = true;

  SELECT id INTO v_street_id FROM public.location_streets WHERE area_id = v_area_id AND slug = 'oru-road';
  INSERT INTO public.location_landmarks (street_id, name, slug, latitude, longitude, kind, sort_order)
  VALUES
    (v_street_id, 'Oru Junction', 'oru-junction', 6.9452, 3.9610, 'junction', 10),
    (v_street_id, 'Oru Town Center', 'oru-town-center', 6.9470, 3.9632, 'landmark', 20),
    (v_street_id, 'Oru Hostel Cluster', 'oru-hostel-cluster', 6.9436, 3.9587, 'hostel', 30)
  ON CONFLICT (street_id, slug) DO UPDATE SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, kind = EXCLUDED.kind, sort_order = EXCLUDED.sort_order, is_active = true;

  SELECT id INTO v_area_id FROM public.location_areas WHERE slug = 'chips';
  INSERT INTO public.location_streets (area_id, name, slug, sort_order)
  VALUES
    (v_area_id, 'Chips Road', 'chips-road', 10),
    (v_area_id, 'Chips Hostel Road', 'chips-hostel-road', 20)
  ON CONFLICT (area_id, slug) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order, is_active = true;

  SELECT id INTO v_street_id FROM public.location_streets WHERE area_id = v_area_id AND slug = 'chips-road';
  INSERT INTO public.location_landmarks (street_id, name, slug, latitude, longitude, kind, sort_order)
  VALUES
    (v_street_id, 'Chips Junction', 'chips-junction', 6.9487, 3.9278, 'junction', 10),
    (v_street_id, 'Chips Hostel Axis', 'chips-hostel-axis', 6.9494, 3.9293, 'hostel', 20),
    (v_street_id, 'Chips Shops Line', 'chips-shops-line', 6.9476, 3.9269, 'market', 30)
  ON CONFLICT (street_id, slug) DO UPDATE SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, kind = EXCLUDED.kind, sort_order = EXCLUDED.sort_order, is_active = true;

  SELECT id INTO v_area_id FROM public.location_areas WHERE slug = 'okomerin';
  INSERT INTO public.location_streets (area_id, name, slug, sort_order)
  VALUES
    (v_area_id, 'Okomerin Road', 'okomerin-road', 10),
    (v_area_id, 'Okomerin Hostel Road', 'okomerin-hostel-road', 20)
  ON CONFLICT (area_id, slug) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order, is_active = true;

  SELECT id INTO v_street_id FROM public.location_streets WHERE area_id = v_area_id AND slug = 'okomerin-road';
  INSERT INTO public.location_landmarks (street_id, name, slug, latitude, longitude, kind, sort_order)
  VALUES
    (v_street_id, 'Okomerin Junction', 'okomerin-junction', 6.9324, 3.9328, 'junction', 10),
    (v_street_id, 'Okomerin Hostel Axis', 'okomerin-hostel-axis', 6.9337, 3.9340, 'hostel', 20),
    (v_street_id, 'Okomerin Shops', 'okomerin-shops', 6.9316, 3.9315, 'market', 30)
  ON CONFLICT (street_id, slug) DO UPDATE SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, kind = EXCLUDED.kind, sort_order = EXCLUDED.sort_order, is_active = true;

  SELECT id INTO v_area_id FROM public.location_areas WHERE slug = 'ago-town';
  INSERT INTO public.location_streets (area_id, name, slug, sort_order)
  VALUES
    (v_area_id, 'Market Road', 'market-road', 10),
    (v_area_id, 'Palace Road', 'palace-road', 20)
  ON CONFLICT (area_id, slug) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order, is_active = true;

  SELECT id INTO v_street_id FROM public.location_streets WHERE area_id = v_area_id AND slug = 'market-road';
  INSERT INTO public.location_landmarks (street_id, name, slug, latitude, longitude, kind, sort_order)
  VALUES
    (v_street_id, 'Ago Market', 'ago-market', 6.9318, 3.9189, 'market', 10),
    (v_street_id, 'Post Office Axis', 'post-office-axis', 6.9309, 3.9204, 'landmark', 20),
    (v_street_id, 'Town Center', 'town-center', 6.9328, 3.9198, 'landmark', 30)
  ON CONFLICT (street_id, slug) DO UPDATE SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, kind = EXCLUDED.kind, sort_order = EXCLUDED.sort_order, is_active = true;
END $$;
