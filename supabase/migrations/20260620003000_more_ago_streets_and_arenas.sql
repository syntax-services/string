-- ============================================================================
-- STRING PLATFORM - MORE AGO-IWOYE STREETS & ARENAS
-- ============================================================================

DO $$
DECLARE
  v_area_id UUID;
  v_street_id UUID;
BEGIN
  -- 1. Add streets to Ago Town
  SELECT id INTO v_area_id FROM public.location_areas WHERE slug = 'ago-town';
  INSERT INTO public.location_streets (area_id, name, slug, sort_order)
  VALUES
    (v_area_id, 'Obafemi Awolowo Road', 'obafemi-awolowo-road', 70),
    (v_area_id, 'Griffin Adekoya Street', 'griffin-adekoya-street', 80)
  ON CONFLICT (area_id, slug) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order, is_active = true;

  -- Landmark for Obafemi Awolowo Road
  SELECT id INTO v_street_id FROM public.location_streets WHERE area_id = v_area_id AND slug = 'obafemi-awolowo-road';
  INSERT INTO public.location_landmarks (street_id, name, slug, latitude, longitude, kind, sort_order)
  VALUES
    (v_street_id, 'WosAm Arena', 'wosam-arena', 6.9342, 3.9182, 'landmark', 10)
  ON CONFLICT (street_id, slug) DO UPDATE SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, kind = EXCLUDED.kind, sort_order = EXCLUDED.sort_order, is_active = true;

  -- 2. Add street to Isamuro
  SELECT id INTO v_area_id FROM public.location_areas WHERE slug = 'isamuro';
  INSERT INTO public.location_streets (area_id, name, slug, sort_order)
  VALUES
    (v_area_id, 'Major General Sansadeen Awosanya Way', 'major-general-sansadeen-awosanya-way', 50)
  ON CONFLICT (area_id, slug) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order, is_active = true;

  -- 3. Add street to Lagos Garage
  SELECT id INTO v_area_id FROM public.location_areas WHERE slug = 'lagos-garage';
  INSERT INTO public.location_streets (area_id, name, slug, sort_order)
  VALUES
    (v_area_id, 'Ago-Iwoye - Ilisan Road', 'ago-iwoye-ilisan-road', 60)
  ON CONFLICT (area_id, slug) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order, is_active = true;

END $$;
