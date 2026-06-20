-- ============================================================================
-- STRING PLATFORM - 120 MORE AGO-IWOYE STREETS
-- ============================================================================

DO $$
DECLARE
  v_area_id UUID;
BEGIN
  -- 1. Lagos Garage
  SELECT id INTO v_area_id FROM public.location_areas WHERE slug = 'lagos-garage';
  INSERT INTO public.location_streets (area_id, name, slug, sort_order)
  VALUES
    (v_area_id, 'Garage Close', 'garage-close', 100),
    (v_area_id, 'Motor Park Road', 'motor-park-road', 110),
    (v_area_id, 'Adenugba Crescent', 'adenugba-crescent', 120),
    (v_area_id, 'Oduwole Lane', 'oduwole-lane', 130),
    (v_area_id, 'Adelaja Close', 'adelaja-close', 140)
  ON CONFLICT (area_id, slug) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order, is_active = true;

  -- 2. OOU Main Campus
  SELECT id INTO v_area_id FROM public.location_areas WHERE slug = 'oou-main-campus';
  INSERT INTO public.location_streets (area_id, name, slug, sort_order)
  VALUES
    (v_area_id, 'University Crescent', 'university-crescent', 100),
    (v_area_id, 'Academic Way', 'academic-way', 110),
    (v_area_id, 'Chancellor Road', 'chancellor-road', 120),
    (v_area_id, 'Shuttle Line', 'shuttle-line', 130),
    (v_area_id, 'BVERS Avenue', 'bvers-avenue', 140)
  ON CONFLICT (area_id, slug) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order, is_active = true;

  -- 3. Mini Campus
  SELECT id INTO v_area_id FROM public.location_areas WHERE slug = 'mini-campus';
  INSERT INTO public.location_streets (area_id, name, slug, sort_order)
  VALUES
    (v_area_id, 'Mini Campus Lane', 'mini-campus-lane', 100),
    (v_area_id, 'Fimide Street', 'fimide-street', 110),
    (v_area_id, 'Science Annex Road', 'science-annex-road', 120),
    (v_area_id, 'Law Faculty Road', 'law-faculty-road', 130),
    (v_area_id, 'College Road', 'college-road', 140)
  ON CONFLICT (area_id, slug) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order, is_active = true;

  -- 4. Itamerin
  SELECT id INTO v_area_id FROM public.location_areas WHERE slug = 'itamerin';
  INSERT INTO public.location_streets (area_id, name, slug, sort_order)
  VALUES
    (v_area_id, 'Fakunfakun Street', 'fakunfakun-street', 100),
    (v_area_id, 'Koroko Road', 'koroko-road', 110),
    (v_area_id, 'Fagbamila Street', 'fagbamila-street', 120),
    (v_area_id, 'Adegberin Street', 'adegberin-street', 130),
    (v_area_id, 'Itamerin Lane', 'itamerin-lane', 140)
  ON CONFLICT (area_id, slug) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order, is_active = true;

  -- 5. Oru
  SELECT id INTO v_area_id FROM public.location_areas WHERE slug = 'oru';
  INSERT INTO public.location_streets (area_id, name, slug, sort_order)
  VALUES
    (v_area_id, 'Oru Clinic Road', 'oru-clinic-road', 100),
    (v_area_id, 'Refugee Camp Road', 'refugee-camp-road', 110),
    (v_area_id, 'Osoba Street', 'osoba-street', 120),
    (v_area_id, 'Odutola Avenue', 'odutola-avenue', 130),
    (v_area_id, 'Balogun Street', 'balogun-street', 140)
  ON CONFLICT (area_id, slug) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order, is_active = true;

  -- 6. Chips
  SELECT id INTO v_area_id FROM public.location_areas WHERE slug = 'chips';
  INSERT INTO public.location_streets (area_id, name, slug, sort_order)
  VALUES
    (v_area_id, 'Chips Filling Station Road', 'chips-filling-station-road', 100),
    (v_area_id, 'Chips Lane', 'chips-lane', 110),
    (v_area_id, 'Oshodi Street', 'oshodi-street', 120),
    (v_area_id, 'Adetayo Street', 'adetayo-street', 130),
    (v_area_id, 'Adenaike Street', 'adenaike-street', 140)
  ON CONFLICT (area_id, slug) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order, is_active = true;

  -- 7. Opomerin
  SELECT id INTO v_area_id FROM public.location_areas WHERE slug = 'opomerin';
  INSERT INTO public.location_streets (area_id, name, slug, sort_order)
  VALUES
    (v_area_id, 'Opomerin Crescent', 'opomerin-crescent', 100),
    (v_area_id, 'Sotunde Street', 'sotunde-street', 110),
    (v_area_id, 'Ogunlana Lane', 'ogunlana-lane', 120),
    (v_area_id, 'Sotunbo Street', 'sotunbo-street', 130),
    (v_area_id, 'Adewunmi Close', 'adewunmi-close', 140)
  ON CONFLICT (area_id, slug) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order, is_active = true;

  -- 8. Ago Town
  SELECT id INTO v_area_id FROM public.location_areas WHERE slug = 'ago-town';
  INSERT INTO public.location_streets (area_id, name, slug, sort_order)
  VALUES
    (v_area_id, 'Ebumawe Street', 'ebumawe-street', 100),
    (v_area_id, 'Adesina Road', 'adesina-road', 110),
    (v_area_id, 'Adesanya Street', 'adesanya-street', 120),
    (v_area_id, 'Osiyemi Street', 'osiyemi-street', 130),
    (v_area_id, 'Oseni Street', 'oseni-street', 140)
  ON CONFLICT (area_id, slug) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order, is_active = true;

  -- 9. Konigba
  SELECT id INTO v_area_id FROM public.location_areas WHERE slug = 'konigba';
  INSERT INTO public.location_streets (area_id, name, slug, sort_order)
  VALUES
    (v_area_id, 'Oke-Odo Close', 'oke-odo-close', 100),
    (v_area_id, 'Konigba Lane', 'konigba-lane', 110),
    (v_area_id, 'Ogunmosu Street', 'ogunmosu-street', 120),
    (v_area_id, 'Mabinu Street', 'mabinu-street', 130),
    (v_area_id, 'Onanuga Street', 'onanuga-street', 140)
  ON CONFLICT (area_id, slug) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order, is_active = true;

  -- 10. Old Konigba
  SELECT id INTO v_area_id FROM public.location_areas WHERE slug = 'old-konigba';
  INSERT INTO public.location_streets (area_id, name, slug, sort_order)
  VALUES
    (v_area_id, 'Well Lane', 'well-lane', 100),
    (v_area_id, 'Ancient Road', 'ancient-road', 110),
    (v_area_id, 'Oshinowo Street', 'oshinowo-street', 120),
    (v_area_id, 'Solaja Street', 'solaja-street', 130),
    (v_area_id, 'Olaiya Close', 'olaiya-close', 140)
  ON CONFLICT (area_id, slug) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order, is_active = true;

  -- 11. Maryam
  SELECT id INTO v_area_id FROM public.location_areas WHERE slug = 'maryam';
  INSERT INTO public.location_streets (area_id, name, slug, sort_order)
  VALUES
    (v_area_id, 'Maryam Crescent', 'maryam-crescent', 100),
    (v_area_id, 'Olowo Igbo Street', 'olowo-igbo-street', 110),
    (v_area_id, 'Osibodu Lane', 'osibodu-lane', 120),
    (v_area_id, 'Fakoya Street', 'fakoya-street', 130),
    (v_area_id, 'Akinsola Street', 'akinsola-street', 140)
  ON CONFLICT (area_id, slug) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order, is_active = true;

  -- 12. WWA
  SELECT id INTO v_area_id FROM public.location_areas WHERE slug = 'wwa';
  INSERT INTO public.location_streets (area_id, name, slug, sort_order)
  VALUES
    (v_area_id, 'WWA Close', 'wwa-close', 100),
    (v_area_id, 'Adex Lane', 'adex-lane', 110),
    (v_area_id, 'Agbolade Street', 'agbolade-street', 120),
    (v_area_id, 'Sotunde Close', 'sotunde-close', 130),
    (v_area_id, 'Kunkusi Street', 'kunkusi-street', 140)
  ON CONFLICT (area_id, slug) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order, is_active = true;

  -- 13. Pepsi Alwo
  SELECT id INTO v_area_id FROM public.location_areas WHERE slug = 'pepsi-alwo';
  INSERT INTO public.location_streets (area_id, name, slug, sort_order)
  VALUES
    (v_area_id, 'Pepsi Crescent', 'pepsi-crescent', 100),
    (v_area_id, 'Alwo Crescent', 'alwo-crescent', 110),
    (v_area_id, 'Lakeside Close', 'lakeside-close', 120),
    (v_area_id, 'Sanni Lane', 'sanni-lane', 130),
    (v_area_id, 'Banjo Street', 'banjo-street', 140)
  ON CONFLICT (area_id, slug) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order, is_active = true;

  -- 14. Sabo
  SELECT id INTO v_area_id FROM public.location_areas WHERE slug = 'sabo';
  INSERT INTO public.location_streets (area_id, name, slug, sort_order)
  VALUES
    (v_area_id, 'Sabo Close', 'sabo-close', 100),
    (v_area_id, 'Hausa Quarter Line', 'hausa-quarter-line', 110),
    (v_area_id, 'Seriki Street', 'seriki-street', 120),
    (v_area_id, 'Shagari Road', 'shagari-road', 130),
    (v_area_id, 'Gbindin Street', 'gbindin-street', 140)
  ON CONFLICT (area_id, slug) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order, is_active = true;

  -- 15. St. Mary
  SELECT id INTO v_area_id FROM public.location_areas WHERE slug = 'st-mary';
  INSERT INTO public.location_streets (area_id, name, slug, sort_order)
  VALUES
    (v_area_id, 'Hospital Road', 'hospital-road', 100),
    (v_area_id, 'Catholic Church Road', 'catholic-church-road', 110),
    (v_area_id, 'Sister''s Lane', 'sisters-lane', 120),
    (v_area_id, 'Mercy Close', 'mercy-close', 130),
    (v_area_id, 'St. Mary Close', 'st-mary-close', 140)
  ON CONFLICT (area_id, slug) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order, is_active = true;

  -- 16. Aiyegbami
  SELECT id INTO v_area_id FROM public.location_areas WHERE slug = 'aiyegbami';
  INSERT INTO public.location_streets (area_id, name, slug, sort_order)
  VALUES
    (v_area_id, 'Aiyegbami Road', 'aiyegbami-road', 100),
    (v_area_id, 'Diamond School Road', 'diamond-school-road', 110),
    (v_area_id, 'St. Anthony''s Lane', 'st-anthonys-lane', 120),
    (v_area_id, 'Osiyoku Street', 'osiyoku-street', 130),
    (v_area_id, 'Odo Yangburin Road', 'odo-yangburin-road', 140)
  ON CONFLICT (area_id, slug) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order, is_active = true;

  -- 17. Ibipe
  SELECT id INTO v_area_id FROM public.location_areas WHERE slug = 'ibipe';
  INSERT INTO public.location_streets (area_id, name, slug, sort_order)
  VALUES
    (v_area_id, 'Methodist School Road', 'methodist-school-road', 100),
    (v_area_id, 'Orile Ibipe Lane', 'orile-ibipe-lane', 110),
    (v_area_id, 'Ebumawe Palace Lane', 'ebumawe-palace-lane', 120),
    (v_area_id, 'Town Hall Road', 'town-hall-road', 130),
    (v_area_id, 'Oba Adenugba Street', 'oba-adenugba-street', 140)
  ON CONFLICT (area_id, slug) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order, is_active = true;

  -- 18. Isamuro
  SELECT id INTO v_area_id FROM public.location_areas WHERE slug = 'isamuro';
  INSERT INTO public.location_streets (area_id, name, slug, sort_order)
  VALUES
    (v_area_id, 'Isamuro Crescent', 'isamuro-crescent', 100),
    (v_area_id, 'Idikanga Street', 'idikanga-street', 110),
    (v_area_id, 'Burial Ground Lane', 'burial-ground-lane', 120),
    (v_area_id, 'Osiyoku Imoisisi Road', 'osiyoku-imoisisi-road', 130),
    (v_area_id, 'Femi Kuti Street', 'femi-kuti-street', 140)
  ON CONFLICT (area_id, slug) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order, is_active = true;

  -- 19. Idode
  SELECT id INTO v_area_id FROM public.location_areas WHERE slug = 'idode';
  INSERT INTO public.location_streets (area_id, name, slug, sort_order)
  VALUES
    (v_area_id, 'Idode Lane', 'idode-lane', 100),
    (v_area_id, 'Attacker Close', 'attacker-close', 110),
    (v_area_id, 'Olipede Close', 'olipede-close', 120),
    (v_area_id, 'Attacker Avenue Close', 'attacker-avenue-close', 130),
    (v_area_id, 'Wesley School Lane', 'wesley-school-lane', 140)
  ON CONFLICT (area_id, slug) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order, is_active = true;

  -- 20. Igan
  SELECT id INTO v_area_id FROM public.location_areas WHERE slug = 'igan';
  INSERT INTO public.location_streets (area_id, name, slug, sort_order)
  VALUES
    (v_area_id, 'Igan Crescent', 'igan-crescent', 100),
    (v_area_id, 'Quarry Lane', 'quarry-lane', 110),
    (v_area_id, 'LG School Road', 'lg-school-road', 120),
    (v_area_id, 'Bale Close', 'bale-close', 130),
    (v_area_id, 'Ojude Olooto Street', 'ojude-olooto-street', 140)
  ON CONFLICT (area_id, slug) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order, is_active = true;

  -- 21. Imere
  SELECT id INTO v_area_id FROM public.location_areas WHERE slug = 'imere';
  INSERT INTO public.location_streets (area_id, name, slug, sort_order)
  VALUES
    (v_area_id, 'Imere Crescent', 'imere-crescent', 100),
    (v_area_id, 'Loloye Close', 'loloye-close', 110),
    (v_area_id, 'Moslem School Road', 'moslem-school-road', 120),
    (v_area_id, 'St. Paul''s School Road', 'st-pauls-school-road', 130),
    (v_area_id, 'Adenuga Street', 'adenuga-street', 140)
  ON CONFLICT (area_id, slug) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order, is_active = true;

  -- 22. Imosu
  SELECT id INTO v_area_id FROM public.location_areas WHERE slug = 'imosu';
  INSERT INTO public.location_streets (area_id, name, slug, sort_order)
  VALUES
    (v_area_id, 'Imosu Crescent', 'imosu-crescent', 100),
    (v_area_id, 'Agbola Lane', 'agbola-lane', 110),
    (v_area_id, 'Imosu Mosque Road', 'imosu-mosque-road', 120),
    (v_area_id, 'Town Hall Close', 'town-hall-close', 130),
    (v_area_id, 'Babatunde Street', 'babatunde-street', 140)
  ON CONFLICT (area_id, slug) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order, is_active = true;

  -- 23. Abobi
  SELECT id INTO v_area_id FROM public.location_areas WHERE slug = 'abobi';
  INSERT INTO public.location_streets (area_id, name, slug, sort_order)
  VALUES
    (v_area_id, 'Abobi Road', 'abobi-road', 100),
    (v_area_id, 'Raimi Ajanoku Crescent', 'raimi-ajanoku-crescent', 110),
    (v_area_id, 'Oyinkiikoro Crescent', 'oyinkiikoro-crescent', 120),
    (v_area_id, 'Oyinkoro Road', 'oyinkoro-road', 130),
    (v_area_id, 'Abobi High School Road', 'abobi-high-school-road', 140)
  ON CONFLICT (area_id, slug) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order, is_active = true;

  -- 24. Computer Village
  SELECT id INTO v_area_id FROM public.location_areas WHERE slug = 'computer-village';
  INSERT INTO public.location_streets (area_id, name, slug, sort_order)
  VALUES
    (v_area_id, 'Computer Village Crescent', 'computer-village-crescent', 100),
    (v_area_id, 'Mojeed Sanni Crescent', 'mojeed-sanni-crescent', 110),
    (v_area_id, 'Aremo Segun Crescent', 'aremo-segun-crescent', 120),
    (v_area_id, 'Oke-Yesha Road', 'oke-yesha-road', 130),
    (v_area_id, 'Geek Lane', 'geek-lane', 140)
  ON CONFLICT (area_id, slug) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order, is_active = true;

END $$;
