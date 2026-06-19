-- ============================================================================
-- STRING PLATFORM - EXPAND ALL STREETS AND LANDMARKS IN AGO-IWOYE (OOU)
-- ============================================================================

DO $$
DECLARE
  v_area_id UUID;
  v_street_id UUID;
BEGIN
  -- ==========================================
  -- AREA: Lagos Garage
  -- ==========================================
  SELECT id INTO v_area_id FROM public.location_areas WHERE slug = 'lagos-garage';
  
  -- Add new streets
  INSERT INTO public.location_streets (area_id, name, slug, sort_order)
  VALUES
    (v_area_id, 'Ijebu Road', 'ijebu-road', 40),
    (v_area_id, 'Oba Ademuyiwa Street', 'oba-ademuyiwa-street', 50)
  ON CONFLICT (area_id, slug) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order, is_active = true;

  -- Add landmarks to Ibadan Road
  SELECT id INTO v_street_id FROM public.location_streets WHERE area_id = v_area_id AND slug = 'ibadan-road';
  INSERT INTO public.location_landmarks (street_id, name, slug, latitude, longitude, kind, sort_order)
  VALUES
    (v_street_id, 'Garage Petrol Station', 'garage-petrol-station', 6.9372, 3.9235, 'landmark', 40),
    (v_street_id, 'Lagos Garage Market', 'lagos-garage-market', 6.9360, 3.9220, 'market', 50)
  ON CONFLICT (street_id, slug) DO UPDATE SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, kind = EXCLUDED.kind, sort_order = EXCLUDED.sort_order, is_active = true;


  -- ==========================================
  -- AREA: OOU Main Campus
  -- ==========================================
  SELECT id INTO v_area_id FROM public.location_areas WHERE slug = 'oou-main-campus';

  -- Add new streets
  INSERT INTO public.location_streets (area_id, name, slug, sort_order)
  VALUES
    (v_area_id, 'Faculty Road', 'faculty-road', 40),
    (v_area_id, 'Sycamore Lane', 'sycamore-lane', 50)
  ON CONFLICT (area_id, slug) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order, is_active = true;

  -- Add landmarks to Sycamore Lane
  SELECT id INTO v_street_id FROM public.location_streets WHERE area_id = v_area_id AND slug = 'sycamore-lane';
  INSERT INTO public.location_landmarks (street_id, name, slug, latitude, longitude, kind, sort_order)
  VALUES
    (v_street_id, 'Sycamore House', 'sycamore-house', 6.9550, 3.9330, 'hostel', 10)
  ON CONFLICT (street_id, slug) DO UPDATE SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, kind = EXCLUDED.kind, sort_order = EXCLUDED.sort_order, is_active = true;

  -- Add landmarks to Permanent Site Road
  SELECT id INTO v_street_id FROM public.location_streets WHERE area_id = v_area_id AND slug = 'permanent-site-road';
  INSERT INTO public.location_landmarks (street_id, name, slug, latitude, longitude, kind, sort_order)
  VALUES
    (v_street_id, 'BVERS Hostel', 'bvers-hostel', 6.9535, 3.9322, 'hostel', 40),
    (v_street_id, 'OOU Ventures Hostel', 'oou-ventures-hostel', 6.9542, 3.9325, 'hostel', 50),
    (v_street_id, 'OOU Stadium', 'oou-stadium', 6.9515, 3.9310, 'landmark', 60)
  ON CONFLICT (street_id, slug) DO UPDATE SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, kind = EXCLUDED.kind, sort_order = EXCLUDED.sort_order, is_active = true;


  -- ==========================================
  -- AREA: Mini Campus
  -- ==========================================
  SELECT id INTO v_area_id FROM public.location_areas WHERE slug = 'mini-campus';

  -- Add new streets
  INSERT INTO public.location_streets (area_id, name, slug, sort_order)
  VALUES
    (v_area_id, 'Ijesha Road', 'ijesha-road', 30),
    (v_area_id, 'Juliana Villa Line', 'juliana-villa-line', 40)
  ON CONFLICT (area_id, slug) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order, is_active = true;

  -- Add landmarks to Juliana Villa Line
  SELECT id INTO v_street_id FROM public.location_streets WHERE area_id = v_area_id AND slug = 'juliana-villa-line';
  INSERT INTO public.location_landmarks (street_id, name, slug, latitude, longitude, kind, sort_order)
  VALUES
    (v_street_id, 'Juliana Villa', 'juliana-villa', 6.9423, 3.9302, 'hostel', 10)
  ON CONFLICT (street_id, slug) DO UPDATE SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, kind = EXCLUDED.kind, sort_order = EXCLUDED.sort_order, is_active = true;

  -- Add landmarks to Mini Campus Road
  SELECT id INTO v_street_id FROM public.location_streets WHERE area_id = v_area_id AND slug = 'mini-campus-road';
  INSERT INTO public.location_landmarks (street_id, name, slug, latitude, longitude, kind, sort_order)
  VALUES
    (v_street_id, 'Wosam Cinemas', 'wosam-cinemas', 6.9412, 3.9290, 'landmark', 40)
  ON CONFLICT (street_id, slug) DO UPDATE SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, kind = EXCLUDED.kind, sort_order = EXCLUDED.sort_order, is_active = true;


  -- ==========================================
  -- AREA: Itamerin
  -- ==========================================
  SELECT id INTO v_area_id FROM public.location_areas WHERE slug = 'itamerin';

  -- Add new streets
  INSERT INTO public.location_streets (area_id, name, slug, sort_order)
  VALUES
    (v_area_id, 'Y2K Hostel Line', 'y2k-hostel-line', 30),
    (v_area_id, 'Aduke Street', 'aduke-street', 40)
  ON CONFLICT (area_id, slug) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order, is_active = true;

  -- Add landmarks to Y2K Hostel Line
  SELECT id INTO v_street_id FROM public.location_streets WHERE area_id = v_area_id AND slug = 'y2k-hostel-line';
  INSERT INTO public.location_landmarks (street_id, name, slug, latitude, longitude, kind, sort_order)
  VALUES
    (v_street_id, 'Y2K Hostel', 'y2k-hostel', 6.9392, 3.9222, 'hostel', 10)
  ON CONFLICT (street_id, slug) DO UPDATE SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, kind = EXCLUDED.kind, sort_order = EXCLUDED.sort_order, is_active = true;

  -- Add landmarks to Itamerin Road
  SELECT id INTO v_street_id FROM public.location_streets WHERE area_id = v_area_id AND slug = 'itamerin-road';
  INSERT INTO public.location_landmarks (street_id, name, slug, latitude, longitude, kind, sort_order)
  VALUES
    (v_street_id, 'Islamic Hall', 'islamic-hall', 6.9382, 3.9218, 'landmark', 40),
    (v_street_id, 'Vindication Hall', 'vindication-hall', 6.9396, 3.9224, 'landmark', 50)
  ON CONFLICT (street_id, slug) DO UPDATE SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, kind = EXCLUDED.kind, sort_order = EXCLUDED.sort_order, is_active = true;


  -- ==========================================
  -- AREA: Ago Town
  -- ==========================================
  SELECT id INTO v_area_id FROM public.location_areas WHERE slug = 'ago-town';

  -- Add new streets
  INSERT INTO public.location_streets (area_id, name, slug, sort_order)
  VALUES
    (v_area_id, 'Odenusi Street', 'odenusi-street', 30),
    (v_area_id, 'Fibigbade Street', 'fibigbade-street', 40),
    (v_area_id, 'Awotele Street', 'awotele-street', 50),
    (v_area_id, 'Station Road', 'station-road', 60)
  ON CONFLICT (area_id, slug) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order, is_active = true;

  -- Add landmarks to Palace Road
  SELECT id INTO v_street_id FROM public.location_streets WHERE area_id = v_area_id AND slug = 'palace-road';
  INSERT INTO public.location_landmarks (street_id, name, slug, latitude, longitude, kind, sort_order)
  VALUES
    (v_street_id, 'Aafin Ebumawe (Palace)', 'aafin-ebumawe-palace', 6.9312, 3.9192, 'landmark', 10)
  ON CONFLICT (street_id, slug) DO UPDATE SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, kind = EXCLUDED.kind, sort_order = EXCLUDED.sort_order, is_active = true;

  -- Add landmarks to Market Road
  SELECT id INTO v_street_id FROM public.location_streets WHERE area_id = v_area_id AND slug = 'market-road';
  INSERT INTO public.location_landmarks (street_id, name, slug, latitude, longitude, kind, sort_order)
  VALUES
    (v_street_id, 'Ijebu North LGA Secretariat', 'ijebu-north-lga-secretariat', 6.9302, 3.9212, 'landmark', 40)
  ON CONFLICT (street_id, slug) DO UPDATE SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, kind = EXCLUDED.kind, sort_order = EXCLUDED.sort_order, is_active = true;


  -- ==========================================
  -- AREA: Konigba
  -- ==========================================
  SELECT id INTO v_area_id FROM public.location_areas WHERE slug = 'konigba';

  -- Add new streets
  INSERT INTO public.location_streets (area_id, name, slug, sort_order)
  VALUES
    (v_area_id, 'Success Lane', 'success-lane', 40)
  ON CONFLICT (area_id, slug) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order, is_active = true;

  -- Add landmarks to Success Lane
  SELECT id INTO v_street_id FROM public.location_streets WHERE area_id = v_area_id AND slug = 'success-lane';
  INSERT INTO public.location_landmarks (street_id, name, slug, latitude, longitude, kind, sort_order)
  VALUES
    (v_street_id, 'His Delight Castle', 'his-delight-castle', 6.9416, 3.9224, 'hostel', 10)
  ON CONFLICT (street_id, slug) DO UPDATE SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, kind = EXCLUDED.kind, sort_order = EXCLUDED.sort_order, is_active = true;

  -- Add landmarks to Oke Odo Road
  SELECT id INTO v_street_id FROM public.location_streets WHERE area_id = v_area_id AND slug = 'oke-odo-road';
  INSERT INTO public.location_landmarks (street_id, name, slug, latitude, longitude, kind, sort_order)
  VALUES
    (v_street_id, 'Peace Hostel', 'peace-hostel', 6.9418, 3.9221, 'hostel', 40)
  ON CONFLICT (street_id, slug) DO UPDATE SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, kind = EXCLUDED.kind, sort_order = EXCLUDED.sort_order, is_active = true;


  -- ==========================================
  -- AREA: Maryam
  -- ==========================================
  SELECT id INTO v_area_id FROM public.location_areas WHERE slug = 'maryam';

  -- Add new streets
  INSERT INTO public.location_streets (area_id, name, slug, sort_order)
  VALUES
    (v_area_id, 'Motigbo Street', 'motigbo-street', 30)
  ON CONFLICT (area_id, slug) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order, is_active = true;

  -- Add landmarks to Motigbo Street
  SELECT id INTO v_street_id FROM public.location_streets WHERE area_id = v_area_id AND slug = 'motigbo-street';
  INSERT INTO public.location_landmarks (street_id, name, slug, latitude, longitude, kind, sort_order)
  VALUES
    (v_street_id, 'Motigbo Hostel', 'motigbo-hostel', 6.9432, 3.9360, 'hostel', 10)
  ON CONFLICT (street_id, slug) DO UPDATE SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, kind = EXCLUDED.kind, sort_order = EXCLUDED.sort_order, is_active = true;


  -- ==========================================
  -- AREA: Pepsi Alwo
  -- ==========================================
  SELECT id INTO v_area_id FROM public.location_areas WHERE slug = 'pepsi-alwo';

  -- Add new streets
  INSERT INTO public.location_streets (area_id, name, slug, sort_order)
  VALUES
    (v_area_id, 'Lakeside Line', 'lakeside-line', 30)
  ON CONFLICT (area_id, slug) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order, is_active = true;

  -- Add landmarks to Lakeside Line
  SELECT id INTO v_street_id FROM public.location_streets WHERE area_id = v_area_id AND slug = 'lakeside-line';
  INSERT INTO public.location_landmarks (street_id, name, slug, latitude, longitude, kind, sort_order)
  VALUES
    (v_street_id, 'Lakeside Hostel', 'lakeside-hostel', 6.9482, 3.9272, 'hostel', 10)
  ON CONFLICT (street_id, slug) DO UPDATE SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, kind = EXCLUDED.kind, sort_order = EXCLUDED.sort_order, is_active = true;


  -- ==========================================
  -- AREA: Sabo
  -- ==========================================
  SELECT id INTO v_area_id FROM public.location_areas WHERE slug = 'sabo';

  -- Add new streets
  INSERT INTO public.location_streets (area_id, name, slug, sort_order)
  VALUES
    (v_area_id, 'Syllabod Line', 'syllabod-line', 30)
  ON CONFLICT (area_id, slug) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order, is_active = true;

  -- Add landmarks to Syllabod Line
  SELECT id INTO v_street_id FROM public.location_streets WHERE area_id = v_area_id AND slug = 'syllabod-line';
  INSERT INTO public.location_landmarks (street_id, name, slug, latitude, longitude, kind, sort_order)
  VALUES
    (v_street_id, 'Syllabod Hostel', 'syllabod-hostel', 6.9352, 3.9148, 'hostel', 10)
  ON CONFLICT (street_id, slug) DO UPDATE SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, kind = EXCLUDED.kind, sort_order = EXCLUDED.sort_order, is_active = true;


  -- ==========================================
  -- AREA: St. Mary
  -- ==========================================
  SELECT id INTO v_area_id FROM public.location_areas WHERE slug = 'st-mary';

  -- Add new streets
  INSERT INTO public.location_streets (area_id, name, slug, sort_order)
  VALUES
    (v_area_id, 'Eye Hospital Bypass', 'eye-hospital-bypass', 30)
  ON CONFLICT (area_id, slug) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order, is_active = true;

END $$;
