-- ============================================================================
-- STRING PLATFORM - EXPAND ALL REMAINING QUARTERS, STREETS, AND LANDMARKS
-- ============================================================================

DO $$
DECLARE
  v_area_id UUID;
  v_street_id UUID;
BEGIN
  -- Insert New Location Areas (Traditional Quarters & Student Neighborhoods)
  INSERT INTO public.location_areas (name, slug, sort_order)
  VALUES
    ('Aiyegbami', 'aiyegbami', 160),
    ('Ibipe', 'ibipe', 170),
    ('Isamuro', 'isamuro', 180),
    ('Idode', 'idode', 190),
    ('Igan', 'igan', 200),
    ('Imere', 'imere', 210),
    ('Imosu', 'imosu', 220),
    ('Abobi', 'abobi', 230),
    ('Computer Village', 'computer-village', 240)
  ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    sort_order = EXCLUDED.sort_order,
    is_active = true;

  -- ==========================================
  -- AREA: Aiyegbami
  -- ==========================================
  SELECT id INTO v_area_id FROM public.location_areas WHERE slug = 'aiyegbami';
  INSERT INTO public.location_streets (area_id, name, slug, sort_order)
  VALUES
    (v_area_id, 'Martins Kuye Street', 'martins-kuye-street', 10),
    (v_area_id, 'Adefuwa Street', 'adefuwa-street', 20)
  ON CONFLICT (area_id, slug) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order, is_active = true;

  -- Landmarks/Hostels for Martins Kuye Street
  SELECT id INTO v_street_id FROM public.location_streets WHERE area_id = v_area_id AND slug = 'martins-kuye-street';
  INSERT INTO public.location_landmarks (street_id, name, slug, latitude, longitude, kind, sort_order)
  VALUES
    (v_street_id, 'Senator Jubril Martins-Kuye Country Home', 'senator-jubril-martins-kuye-country-home', 6.9318, 3.9248, 'landmark', 10),
    (v_street_id, 'Diamond Nursery and Primary School', 'diamond-nursery-and-primary-school', 6.9312, 3.9242, 'landmark', 20)
  ON CONFLICT (street_id, slug) DO UPDATE SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, kind = EXCLUDED.kind, sort_order = EXCLUDED.sort_order, is_active = true;

  -- Landmarks/Hostels for Adefuwa Street
  SELECT id INTO v_street_id FROM public.location_streets WHERE area_id = v_area_id AND slug = 'adefuwa-street';
  INSERT INTO public.location_landmarks (street_id, name, slug, latitude, longitude, kind, sort_order)
  VALUES
    (v_street_id, 'St. Anthony''s Catholic Church', 'st-anthonys-catholic-church', 6.9328, 3.9258, 'landmark', 10),
    (v_street_id, 'Aiyegbami Student Lodge', 'aiyegbami-student-lodge', 6.9324, 3.9252, 'hostel', 20)
  ON CONFLICT (street_id, slug) DO UPDATE SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, kind = EXCLUDED.kind, sort_order = EXCLUDED.sort_order, is_active = true;


  -- ==========================================
  -- AREA: Ibipe
  -- ==========================================
  SELECT id INTO v_area_id FROM public.location_areas WHERE slug = 'ibipe';
  INSERT INTO public.location_streets (area_id, name, slug, sort_order)
  VALUES
    (v_area_id, 'Ibipe Road', 'ibipe-road', 10),
    (v_area_id, 'Ebumawe Palace Road', 'ebumawe-palace-road', 20),
    (v_area_id, 'Orile Ibipe Road', 'orile-ibipe-road', 30),
    (v_area_id, 'Odubela Street', 'odubela-street', 40)
  ON CONFLICT (area_id, slug) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order, is_active = true;

  -- Landmarks for Ibipe Road
  SELECT id INTO v_street_id FROM public.location_streets WHERE area_id = v_area_id AND slug = 'ibipe-road';
  INSERT INTO public.location_landmarks (street_id, name, slug, latitude, longitude, kind, sort_order)
  VALUES
    (v_street_id, 'Ibipe Methodist Church', 'ibipe-methodist-church', 6.9358, 3.9188, 'landmark', 10),
    (v_street_id, 'Ibipe Town Hall', 'ibipe-town-hall', 6.9365, 3.9195, 'landmark', 20)
  ON CONFLICT (street_id, slug) DO UPDATE SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, kind = EXCLUDED.kind, sort_order = EXCLUDED.sort_order, is_active = true;

  -- Landmarks for Orile Ibipe Road
  SELECT id INTO v_street_id FROM public.location_streets WHERE area_id = v_area_id AND slug = 'orile-ibipe-road';
  INSERT INTO public.location_landmarks (street_id, name, slug, latitude, longitude, kind, sort_order)
  VALUES
    (v_street_id, 'Orile Ibipe Village', 'orile-ibipe-village', 6.9375, 3.9205, 'landmark', 10)
  ON CONFLICT (street_id, slug) DO UPDATE SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, kind = EXCLUDED.kind, sort_order = EXCLUDED.sort_order, is_active = true;


  -- ==========================================
  -- AREA: Isamuro
  -- ==========================================
  SELECT id INTO v_area_id FROM public.location_areas WHERE slug = 'isamuro';
  INSERT INTO public.location_streets (area_id, name, slug, sort_order)
  VALUES
    (v_area_id, 'Isamuro Road', 'isamuro-road', 10),
    (v_area_id, 'Idikanga Road', 'idikanga-road', 20),
    (v_area_id, 'Onireke Street', 'onireke-street', 30),
    (v_area_id, 'Sule-Odu Street', 'sule-odu-street', 40)
  ON CONFLICT (area_id, slug) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order, is_active = true;

  -- Landmarks for Isamuro Road
  SELECT id INTO v_street_id FROM public.location_streets WHERE area_id = v_area_id AND slug = 'isamuro-road';
  INSERT INTO public.location_landmarks (street_id, name, slug, latitude, longitude, kind, sort_order)
  VALUES
    (v_street_id, 'Idikanga Night Market', 'idikanga-night-market', 6.9335, 3.9185, 'market', 10),
    (v_street_id, 'Isamuro Mosque', 'isamuro-mosque', 6.9328, 3.9178, 'landmark', 20),
    (v_street_id, 'Old Burial Ground', 'old-burial-ground', 6.9340, 3.9190, 'landmark', 30),
    (v_street_id, 'Isamuro Palace Lodge', 'isamuro-palace-lodge', 6.9332, 3.9182, 'hostel', 40)
  ON CONFLICT (street_id, slug) DO UPDATE SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, kind = EXCLUDED.kind, sort_order = EXCLUDED.sort_order, is_active = true;


  -- ==========================================
  -- AREA: Idode
  -- ==========================================
  SELECT id INTO v_area_id FROM public.location_areas WHERE slug = 'idode';
  INSERT INTO public.location_streets (area_id, name, slug, sort_order)
  VALUES
    (v_area_id, 'Idode Road', 'idode-road', 10),
    (v_area_id, 'Wesley School Road', 'wesley-school-road', 20),
    (v_area_id, 'Attacker Avenue', 'attacker-avenue', 30),
    (v_area_id, 'Olipede Street', 'olipede-street', 40)
  ON CONFLICT (area_id, slug) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order, is_active = true;

  -- Landmarks for Idode Road
  SELECT id INTO v_street_id FROM public.location_streets WHERE area_id = v_area_id AND slug = 'idode-road';
  INSERT INTO public.location_landmarks (street_id, name, slug, latitude, longitude, kind, sort_order)
  VALUES
    (v_street_id, 'Idode Junction', 'idode-junction', 6.9425, 3.9268, 'junction', 10),
    (v_street_id, 'Idode Wesley School', 'idode-wesley-school', 6.9428, 3.9270, 'landmark', 20)
  ON CONFLICT (street_id, slug) DO UPDATE SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, kind = EXCLUDED.kind, sort_order = EXCLUDED.sort_order, is_active = true;

  -- Landmarks for Attacker Avenue
  SELECT id INTO v_street_id FROM public.location_streets WHERE area_id = v_area_id AND slug = 'attacker-avenue';
  INSERT INTO public.location_landmarks (street_id, name, slug, latitude, longitude, kind, sort_order)
  VALUES
    (v_street_id, 'Attacker Villa', 'attacker-villa', 6.9436, 3.9282, 'hostel', 10)
  ON CONFLICT (street_id, slug) DO UPDATE SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, kind = EXCLUDED.kind, sort_order = EXCLUDED.sort_order, is_active = true;


  -- ==========================================
  -- AREA: Igan
  -- ==========================================
  SELECT id INTO v_area_id FROM public.location_areas WHERE slug = 'igan';
  INSERT INTO public.location_streets (area_id, name, slug, sort_order)
  VALUES
    (v_area_id, 'Igan Road', 'igan-road', 10),
    (v_area_id, 'Quarry Road', 'quarry-road', 20),
    (v_area_id, 'Bale Street', 'bale-street', 30)
  ON CONFLICT (area_id, slug) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order, is_active = true;

  -- Landmarks for Igan Road
  SELECT id INTO v_street_id FROM public.location_streets WHERE area_id = v_area_id AND slug = 'igan-road';
  INSERT INTO public.location_landmarks (street_id, name, slug, latitude, longitude, kind, sort_order)
  VALUES
    (v_street_id, 'Local Government School Igan', 'local-government-school-igan', 6.9475, 3.9110, 'landmark', 10),
    (v_street_id, 'Igan Market', 'igan-market', 6.9480, 3.9115, 'market', 20)
  ON CONFLICT (street_id, slug) DO UPDATE SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, kind = EXCLUDED.kind, sort_order = EXCLUDED.sort_order, is_active = true;


  -- ==========================================
  -- AREA: Imere
  -- ==========================================
  SELECT id INTO v_area_id FROM public.location_areas WHERE slug = 'imere';
  INSERT INTO public.location_streets (area_id, name, slug, sort_order)
  VALUES
    (v_area_id, 'Imere Road', 'imere-road', 10),
    (v_area_id, 'Loloye Street', 'loloye-street', 20)
  ON CONFLICT (area_id, slug) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order, is_active = true;

  -- Landmarks for Imere Road
  SELECT id INTO v_street_id FROM public.location_streets WHERE area_id = v_area_id AND slug = 'imere-road';
  INSERT INTO public.location_landmarks (street_id, name, slug, latitude, longitude, kind, sort_order)
  VALUES
    (v_street_id, 'Imere Moslem School', 'imere-moslem-school', 6.9325, 3.9042, 'landmark', 10),
    (v_street_id, 'St. Paul''s Primary School Imere', 'st-pauls-primary-school-imere', 6.9332, 3.9055, 'landmark', 20)
  ON CONFLICT (street_id, slug) DO UPDATE SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, kind = EXCLUDED.kind, sort_order = EXCLUDED.sort_order, is_active = true;

  -- Landmarks for Loloye Street
  SELECT id INTO v_street_id FROM public.location_streets WHERE area_id = v_area_id AND slug = 'loloye-street';
  INSERT INTO public.location_landmarks (street_id, name, slug, latitude, longitude, kind, sort_order)
  VALUES
    (v_street_id, 'Loloye Lodge', 'loloye-lodge', 6.9320, 3.9035, 'hostel', 10)
  ON CONFLICT (street_id, slug) DO UPDATE SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, kind = EXCLUDED.kind, sort_order = EXCLUDED.sort_order, is_active = true;


  -- ==========================================
  -- AREA: Imosu
  -- ==========================================
  SELECT id INTO v_area_id FROM public.location_areas WHERE slug = 'imosu';
  INSERT INTO public.location_streets (area_id, name, slug, sort_order)
  VALUES
    (v_area_id, 'Imosu Road', 'imosu-road', 10),
    (v_area_id, 'Agbola Street', 'agbola-street', 20)
  ON CONFLICT (area_id, slug) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order, is_active = true;

  -- Landmarks for Imosu Road
  SELECT id INTO v_street_id FROM public.location_streets WHERE area_id = v_area_id AND slug = 'imosu-road';
  INSERT INTO public.location_landmarks (street_id, name, slug, latitude, longitude, kind, sort_order)
  VALUES
    (v_street_id, 'Imosu Town Hall', 'imosu-town-hall', 6.9245, 3.9112, 'landmark', 10),
    (v_street_id, 'Imosu Mosque', 'imosu-mosque', 6.9252, 3.9122, 'landmark', 20)
  ON CONFLICT (street_id, slug) DO UPDATE SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, kind = EXCLUDED.kind, sort_order = EXCLUDED.sort_order, is_active = true;


  -- ==========================================
  -- AREA: Abobi
  -- ==========================================
  SELECT id INTO v_area_id FROM public.location_areas WHERE slug = 'abobi';
  INSERT INTO public.location_streets (area_id, name, slug, sort_order)
  VALUES
    (v_area_id, 'Raimi Ajanoku Street', 'raimi-ajanoku-street', 10),
    (v_area_id, 'Oyinkiikoro Street', 'oyinkiikoro-street', 20)
  ON CONFLICT (area_id, slug) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order, is_active = true;

  -- Landmarks for Raimi Ajanoku Street
  SELECT id INTO v_street_id FROM public.location_streets WHERE area_id = v_area_id AND slug = 'raimi-ajanoku-street';
  INSERT INTO public.location_landmarks (street_id, name, slug, latitude, longitude, kind, sort_order)
  VALUES
    (v_street_id, 'Oyinkoro Junction', 'oyinkoro-junction', 6.9395, 3.9305, 'junction', 10)
  ON CONFLICT (street_id, slug) DO UPDATE SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, kind = EXCLUDED.kind, sort_order = EXCLUDED.sort_order, is_active = true;


  -- ==========================================
  -- AREA: Computer Village
  -- ==========================================
  SELECT id INTO v_area_id FROM public.location_areas WHERE slug = 'computer-village';
  INSERT INTO public.location_streets (area_id, name, slug, sort_order)
  VALUES
    (v_area_id, 'Aremo Segun Adekoya Crescent', 'aremo-segun-adekoya-crescent', 10),
    (v_area_id, 'Mojeed Sanni Street', 'mojeed-sanni-street', 20)
  ON CONFLICT (area_id, slug) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order, is_active = true;

  -- Landmarks for Aremo Segun Adekoya Crescent
  SELECT id INTO v_street_id FROM public.location_streets WHERE area_id = v_area_id AND slug = 'aremo-segun-adekoya-crescent';
  INSERT INTO public.location_landmarks (street_id, name, slug, latitude, longitude, kind, sort_order)
  VALUES
    (v_street_id, 'Computer Village Hostel', 'computer-village-hostel', 6.9442, 3.9382, 'hostel', 10)
  ON CONFLICT (street_id, slug) DO UPDATE SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, kind = EXCLUDED.kind, sort_order = EXCLUDED.sort_order, is_active = true;

  -- Landmarks for Mojeed Sanni Street
  SELECT id INTO v_street_id FROM public.location_streets WHERE area_id = v_area_id AND slug = 'mojeed-sanni-street';
  INSERT INTO public.location_landmarks (street_id, name, slug, latitude, longitude, kind, sort_order)
  VALUES
    (v_street_id, 'Mojeed Sanni Lodge', 'mojeed-sanni-lodge', 6.9446, 3.9387, 'hostel', 10)
  ON CONFLICT (street_id, slug) DO UPDATE SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, kind = EXCLUDED.kind, sort_order = EXCLUDED.sort_order, is_active = true;


  -- ==========================================
  -- AREA: Opomerin (Olopomerin Expansion)
  -- ==========================================
  SELECT id INTO v_area_id FROM public.location_areas WHERE slug = 'opomerin';
  INSERT INTO public.location_streets (area_id, name, slug, sort_order)
  VALUES
    (v_area_id, 'Akindehinde Lane', 'akindehinde-lane', 30)
  ON CONFLICT (area_id, slug) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order, is_active = true;

  -- Landmarks for Akindehinde Lane
  SELECT id INTO v_street_id FROM public.location_streets WHERE area_id = v_area_id AND slug = 'akindehinde-lane';
  INSERT INTO public.location_landmarks (street_id, name, slug, latitude, longitude, kind, sort_order)
  VALUES
    (v_street_id, 'Okanlawon Junction', 'okanlawon-junction', 6.9320, 3.9318, 'junction', 10)
  ON CONFLICT (street_id, slug) DO UPDATE SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, kind = EXCLUDED.kind, sort_order = EXCLUDED.sort_order, is_active = true;

END $$;
