-- ============================================================================
-- STRING PLATFORM - EXPAND LOCAL LOCATIONS IN AGO-IWOYE
-- ============================================================================

-- 1. Correct the spelling of Okomerin -> Opomerin
UPDATE public.location_areas 
SET name = 'Opomerin', slug = 'opomerin' 
WHERE slug = 'okomerin';

UPDATE public.location_streets 
SET name = 'Opomerin Road', slug = 'opomerin-road' 
WHERE slug = 'okomerin-road';

UPDATE public.location_streets 
SET name = 'Opomerin Hostel Road', slug = 'opomerin-hostel-road' 
WHERE slug = 'okomerin-hostel-road';

UPDATE public.location_landmarks 
SET name = 'Opomerin Junction', slug = 'opomerin-junction' 
WHERE slug = 'okomerin-junction';

UPDATE public.location_landmarks 
SET name = 'Opomerin Hostel Axis', slug = 'opomerin-hostel-axis' 
WHERE slug = 'okomerin-hostel-axis';

UPDATE public.location_landmarks 
SET name = 'Opomerin Shops', slug = 'opomerin-shops' 
WHERE slug = 'okomerin-shops';


-- 2. Seed the new areas, streets, and landmarks
DO $$
DECLARE
  v_area_id UUID;
  v_street_id UUID;
BEGIN
  -- Insert New Location Areas
  INSERT INTO public.location_areas (name, slug, sort_order)
  VALUES
    ('Konigba', 'konigba', 90),
    ('Old Konigba', 'old-konigba', 100),
    ('Maryam', 'maryam', 110),
    ('WWA', 'wwa', 120),
    ('Pepsi Alwo', 'pepsi-alwo', 130),
    ('Sabo', 'sabo', 140),
    ('St. Mary', 'st-mary', 150)
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    sort_order = EXCLUDED.sort_order,
    is_active = true;

  -- ==========================================
  -- AREA: Konigba
  -- ==========================================
  SELECT id INTO v_area_id FROM public.location_areas WHERE slug = 'konigba';
  INSERT INTO public.location_streets (area_id, name, slug, sort_order)
  VALUES
    (v_area_id, 'Oke Odo Road', 'oke-odo-road', 10),
    (v_area_id, 'School Road', 'school-road', 20),
    (v_area_id, 'Konigba Street', 'konigba-street', 30)
  ON CONFLICT (area_id, slug) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order, is_active = true;

  -- Landmarks for Oke Odo Road
  SELECT id INTO v_street_id FROM public.location_streets WHERE area_id = v_area_id AND slug = 'oke-odo-road';
  INSERT INTO public.location_landmarks (street_id, name, slug, latitude, longitude, kind, sort_order)
  VALUES
    (v_street_id, 'Konigba Bus Stop', 'konigba-bus-stop', 6.9405, 3.9215, 'junction', 10),
    (v_street_id, 'Abike Ade Court', 'abike-ade-court', 6.9410, 3.9220, 'hostel', 20),
    (v_street_id, 'Success Villa', 'success-villa', 6.9412, 3.9222, 'hostel', 30)
  ON CONFLICT (street_id, slug) DO UPDATE SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, kind = EXCLUDED.kind, sort_order = EXCLUDED.sort_order, is_active = true;

  -- Landmarks for School Road
  SELECT id INTO v_street_id FROM public.location_streets WHERE area_id = v_area_id AND slug = 'school-road';
  INSERT INTO public.location_landmarks (street_id, name, slug, latitude, longitude, kind, sort_order)
  VALUES
    (v_street_id, 'Peace Lodge', 'peace-lodge', 6.9408, 3.9218, 'hostel', 10),
    (v_street_id, 'De-Grace Hostel', 'de-grace-hostel', 6.9415, 3.9225, 'hostel', 20)
  ON CONFLICT (street_id, slug) DO UPDATE SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, kind = EXCLUDED.kind, sort_order = EXCLUDED.sort_order, is_active = true;


  -- ==========================================
  -- AREA: Old Konigba
  -- ==========================================
  SELECT id INTO v_area_id FROM public.location_areas WHERE slug = 'old-konigba';
  INSERT INTO public.location_streets (area_id, name, slug, sort_order)
  VALUES
    (v_area_id, 'Old Konigba Road', 'old-konigba-road', 10),
    (v_area_id, 'Ancient Line', 'ancient-line', 20)
  ON CONFLICT (area_id, slug) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order, is_active = true;

  -- Landmarks for Old Konigba Road
  SELECT id INTO v_street_id FROM public.location_streets WHERE area_id = v_area_id AND slug = 'old-konigba-road';
  INSERT INTO public.location_landmarks (street_id, name, slug, latitude, longitude, kind, sort_order)
  VALUES
    (v_street_id, 'Old Konigba Junction', 'old-konigba-junction', 6.9395, 3.9230, 'junction', 10),
    (v_street_id, 'Old Konigba Well', 'old-konigba-well', 6.9398, 3.9235, 'landmark', 20),
    (v_street_id, 'Ancient Lodge', 'ancient-lodge', 6.9392, 3.9228, 'hostel', 30)
  ON CONFLICT (street_id, slug) DO UPDATE SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, kind = EXCLUDED.kind, sort_order = EXCLUDED.sort_order, is_active = true;


  -- ==========================================
  -- AREA: Maryam
  -- ==========================================
  SELECT id INTO v_area_id FROM public.location_areas WHERE slug = 'maryam';
  INSERT INTO public.location_streets (area_id, name, slug, sort_order)
  VALUES
    (v_area_id, 'Maryam Road', 'maryam-road', 10),
    (v_area_id, 'Akinfenwa Street', 'akinfenwa-street', 20)
  ON CONFLICT (area_id, slug) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order, is_active = true;

  -- Landmarks for Maryam Road
  SELECT id INTO v_street_id FROM public.location_streets WHERE area_id = v_area_id AND slug = 'maryam-road';
  INSERT INTO public.location_landmarks (street_id, name, slug, latitude, longitude, kind, sort_order)
  VALUES
    (v_street_id, 'Maryam Junction', 'maryam-junction', 6.9425, 3.9350, 'junction', 10),
    (v_street_id, 'Maryam Hostel', 'maryam-hostel', 6.9430, 3.9355, 'hostel', 20),
    (v_street_id, 'Aanuoluwapo Villa', 'aanuoluwapo-villa', 6.9420, 3.9348, 'hostel', 30),
    (v_street_id, 'Toluwani Lodge', 'toluwani-lodge', 6.9428, 3.9352, 'hostel', 40)
  ON CONFLICT (street_id, slug) DO UPDATE SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, kind = EXCLUDED.kind, sort_order = EXCLUDED.sort_order, is_active = true;


  -- ==========================================
  -- AREA: WWA
  -- ==========================================
  SELECT id INTO v_area_id FROM public.location_areas WHERE slug = 'wwa';
  INSERT INTO public.location_streets (area_id, name, slug, sort_order)
  VALUES
    (v_area_id, 'WWA Road', 'wwa-road', 10),
    (v_area_id, 'Adex Street', 'adex-street', 20)
  ON CONFLICT (area_id, slug) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order, is_active = true;

  -- Landmarks for WWA Road
  SELECT id INTO v_street_id FROM public.location_streets WHERE area_id = v_area_id AND slug = 'wwa-road';
  INSERT INTO public.location_landmarks (street_id, name, slug, latitude, longitude, kind, sort_order)
  VALUES
    (v_street_id, 'WWA Junction', 'wwa-junction', 6.9465, 3.9315, 'junction', 10),
    (v_street_id, 'WWA Hostel', 'wwa-hostel', 6.9470, 3.9320, 'hostel', 20),
    (v_street_id, 'Oasis Lodge', 'oasis-lodge', 6.9460, 3.9310, 'hostel', 30),
    (v_street_id, 'WWA Student Complex', 'wwa-student-complex', 6.9468, 3.9318, 'hostel', 40)
  ON CONFLICT (street_id, slug) DO UPDATE SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, kind = EXCLUDED.kind, sort_order = EXCLUDED.sort_order, is_active = true;


  -- ==========================================
  -- AREA: Pepsi Alwo
  -- ==========================================
  SELECT id INTO v_area_id FROM public.location_areas WHERE slug = 'pepsi-alwo';
  INSERT INTO public.location_streets (area_id, name, slug, sort_order)
  VALUES
    (v_area_id, 'Pepsi Road', 'pepsi-road', 10),
    (v_area_id, 'Alwo Road', 'alwo-road', 20)
  ON CONFLICT (area_id, slug) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order, is_active = true;

  -- Landmarks for Pepsi Road
  SELECT id INTO v_street_id FROM public.location_streets WHERE area_id = v_area_id AND slug = 'pepsi-road';
  INSERT INTO public.location_landmarks (street_id, name, slug, latitude, longitude, kind, sort_order)
  VALUES
    (v_street_id, 'Pepsi Junction', 'pepsi-junction', 6.9480, 3.9260, 'junction', 10),
    (v_street_id, 'Pepsi Alwo Market', 'pepsi-alwo-market', 6.9485, 3.9265, 'market', 20)
  ON CONFLICT (street_id, slug) DO UPDATE SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, kind = EXCLUDED.kind, sort_order = EXCLUDED.sort_order, is_active = true;

  -- Landmarks for Alwo Road
  SELECT id INTO v_street_id FROM public.location_streets WHERE area_id = v_area_id AND slug = 'alwo-road';
  INSERT INTO public.location_landmarks (street_id, name, slug, latitude, longitude, kind, sort_order)
  VALUES
    (v_street_id, 'Alwo Bus Stop', 'alwo-bus-stop', 6.9490, 3.9270, 'junction', 10),
    (v_street_id, 'Alwo Hostel Axis', 'alwo-hostel-axis', 6.9495, 3.9275, 'hostel', 20)
  ON CONFLICT (street_id, slug) DO UPDATE SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, kind = EXCLUDED.kind, sort_order = EXCLUDED.sort_order, is_active = true;


  -- ==========================================
  -- AREA: Sabo
  -- ==========================================
  SELECT id INTO v_area_id FROM public.location_areas WHERE slug = 'sabo';
  INSERT INTO public.location_streets (area_id, name, slug, sort_order)
  VALUES
    (v_area_id, 'Sabo Road', 'sabo-road', 10),
    (v_area_id, 'Sabo Street', 'sabo-street', 20)
  ON CONFLICT (area_id, slug) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order, is_active = true;

  -- Landmarks for Sabo Road
  SELECT id INTO v_street_id FROM public.location_streets WHERE area_id = v_area_id AND slug = 'sabo-road';
  INSERT INTO public.location_landmarks (street_id, name, slug, latitude, longitude, kind, sort_order)
  VALUES
    (v_street_id, 'Sabo Market', 'sabo-market', 6.9355, 3.9150, 'market', 10),
    (v_street_id, 'Sabo Mosque', 'sabo-mosque', 6.9360, 3.9155, 'landmark', 20),
    (v_street_id, 'Sabo Junction', 'sabo-junction', 6.9350, 3.9145, 'junction', 30),
    (v_street_id, 'Sabo Motor Park', 'sabo-motor-park', 6.9358, 3.9152, 'junction', 40)
  ON CONFLICT (street_id, slug) DO UPDATE SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, kind = EXCLUDED.kind, sort_order = EXCLUDED.sort_order, is_active = true;


  -- ==========================================
  -- AREA: St. Mary
  -- ==========================================
  SELECT id INTO v_area_id FROM public.location_areas WHERE slug = 'st-mary';
  INSERT INTO public.location_streets (area_id, name, slug, sort_order)
  VALUES
    (v_area_id, 'St. Mary Road', 'st-mary-road', 10),
    (v_area_id, 'Catholic Church Street', 'catholic-church-street', 20)
  ON CONFLICT (area_id, slug) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order, is_active = true;

  -- Landmarks for St. Mary Road
  SELECT id INTO v_street_id FROM public.location_streets WHERE area_id = v_area_id AND slug = 'st-mary-road';
  INSERT INTO public.location_landmarks (street_id, name, slug, latitude, longitude, kind, sort_order)
  VALUES
    (v_street_id, 'St. Mary''s Catholic Eye Hospital', 'st-marys-catholic-eye-hospital', 6.9370, 3.9180, 'landmark', 10),
    (v_street_id, 'St. Mary Junction', 'st-mary-junction', 6.9375, 3.9185, 'junction', 20),
    (v_street_id, 'Mary Lodge', 'mary-lodge', 6.9368, 3.9178, 'hostel', 30),
    (v_street_id, 'St. Mary Hostel', 'st-mary-hostel', 6.9372, 3.9182, 'hostel', 40)
  ON CONFLICT (street_id, slug) DO UPDATE SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, kind = EXCLUDED.kind, sort_order = EXCLUDED.sort_order, is_active = true;

END $$;
