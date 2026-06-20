-- ============================================================================
-- STRING PLATFORM - 50 MORE CLUSTERED AND INTERCONNECTED STREETS & LANDMARKS
-- ============================================================================

DO $$
DECLARE
  v_area_id UUID;
  v_street_id UUID;
BEGIN
  -- ==========================================
  -- CLUSTER: Aiyegbami Axis
  -- ==========================================
  SELECT id INTO v_area_id FROM public.location_areas WHERE slug = 'aiyegbami';

  -- 1. Fawoseje Street
  INSERT INTO public.location_streets (area_id, name, slug, sort_order)
  VALUES (v_area_id, 'Fawoseje Street', 'fawoseje-street', 50)
  ON CONFLICT (area_id, slug) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order, is_active = true
  RETURNING id INTO v_street_id;
  INSERT INTO public.location_landmarks (street_id, name, slug, latitude, longitude, kind, sort_order)
  VALUES (v_street_id, 'Fowoseje School Junction', 'fowoseje-school-junction', 6.9305, 3.9238, 'junction', 10)
  ON CONFLICT (street_id, slug) DO UPDATE SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, kind = EXCLUDED.kind, sort_order = EXCLUDED.sort_order, is_active = true;

  -- 2. Kunkusi Lane
  INSERT INTO public.location_streets (area_id, name, slug, sort_order)
  VALUES (v_area_id, 'Kunkusi Lane', 'kunkusi-lane', 60)
  ON CONFLICT (area_id, slug) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order, is_active = true
  RETURNING id INTO v_street_id;
  INSERT INTO public.location_landmarks (street_id, name, slug, latitude, longitude, kind, sort_order)
  VALUES (v_street_id, 'Kunkusi House Junction', 'kunkusi-house-junction', 6.9312, 3.9248, 'junction', 10)
  ON CONFLICT (street_id, slug) DO UPDATE SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, kind = EXCLUDED.kind, sort_order = EXCLUDED.sort_order, is_active = true;

  -- 3. Mabinu Crescent
  INSERT INTO public.location_streets (area_id, name, slug, sort_order)
  VALUES (v_area_id, 'Mabinu Crescent', 'mabinu-crescent', 70)
  ON CONFLICT (area_id, slug) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order, is_active = true
  RETURNING id INTO v_street_id;
  INSERT INTO public.location_landmarks (street_id, name, slug, latitude, longitude, kind, sort_order)
  VALUES (v_street_id, 'Baale Mabinu House Junction', 'baale-mabinu-house-junction', 6.9325, 3.9254, 'junction', 10)
  ON CONFLICT (street_id, slug) DO UPDATE SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, kind = EXCLUDED.kind, sort_order = EXCLUDED.sort_order, is_active = true;

  -- 4. Odekomaiya Street
  INSERT INTO public.location_streets (area_id, name, slug, sort_order)
  VALUES (v_area_id, 'Odekomaiya Street', 'odekomaiya-street', 80)
  ON CONFLICT (area_id, slug) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order, is_active = true
  RETURNING id INTO v_street_id;
  INSERT INTO public.location_landmarks (street_id, name, slug, latitude, longitude, kind, sort_order)
  VALUES (v_street_id, 'Odekomaiya Compound Junction', 'odekomaiya-compound-junction', 6.9318, 3.9232, 'junction', 10)
  ON CONFLICT (street_id, slug) DO UPDATE SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, kind = EXCLUDED.kind, sort_order = EXCLUDED.sort_order, is_active = true;

  -- 5. Olowo Igbo Lane
  INSERT INTO public.location_streets (area_id, name, slug, sort_order)
  VALUES (v_area_id, 'Olowo Igbo Lane', 'olowo-igbo-lane', 90)
  ON CONFLICT (area_id, slug) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order, is_active = true
  RETURNING id INTO v_street_id;
  INSERT INTO public.location_landmarks (street_id, name, slug, latitude, longitude, kind, sort_order)
  VALUES (v_street_id, 'Olowo Igbo Compound', 'olowo-igbo-compound', 6.9328, 3.9242, 'landmark', 10)
  ON CONFLICT (street_id, slug) DO UPDATE SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, kind = EXCLUDED.kind, sort_order = EXCLUDED.sort_order, is_active = true;

  -- 6. Adegberin Lane
  INSERT INTO public.location_streets (area_id, name, slug, sort_order)
  VALUES (v_area_id, 'Adegberin Lane', 'adegberin-lane', 100)
  ON CONFLICT (area_id, slug) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order, is_active = true
  RETURNING id INTO v_street_id;
  INSERT INTO public.location_landmarks (street_id, name, slug, latitude, longitude, kind, sort_order)
  VALUES (v_street_id, 'Adegberin Compound', 'adegberin-compound', 6.9332, 3.9246, 'landmark', 10)
  ON CONFLICT (street_id, slug) DO UPDATE SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, kind = EXCLUDED.kind, sort_order = EXCLUDED.sort_order, is_active = true;

  -- 7. Osiyoku Lane
  INSERT INTO public.location_streets (area_id, name, slug, sort_order)
  VALUES (v_area_id, 'Osiyoku Lane', 'osiyoku-lane', 110)
  ON CONFLICT (area_id, slug) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order, is_active = true
  RETURNING id INTO v_street_id;
  INSERT INTO public.location_landmarks (street_id, name, slug, latitude, longitude, kind, sort_order)
  VALUES (v_street_id, 'Osiyoku House Line', 'osiyoku-house-line', 6.9320, 3.9238, 'landmark', 10)
  ON CONFLICT (street_id, slug) DO UPDATE SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, kind = EXCLUDED.kind, sort_order = EXCLUDED.sort_order, is_active = true;

  -- 8. Diamond School Crescent
  INSERT INTO public.location_streets (area_id, name, slug, sort_order)
  VALUES (v_area_id, 'Diamond School Crescent', 'diamond-school-crescent', 120)
  ON CONFLICT (area_id, slug) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order, is_active = true
  RETURNING id INTO v_street_id;
  INSERT INTO public.location_landmarks (street_id, name, slug, latitude, longitude, kind, sort_order)
  VALUES (v_street_id, 'Diamond School Gate', 'diamond-school-gate', 6.9312, 3.9241, 'gate', 10)
  ON CONFLICT (street_id, slug) DO UPDATE SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, kind = EXCLUDED.kind, sort_order = EXCLUDED.sort_order, is_active = true;

  -- 9. Awobodu Street
  INSERT INTO public.location_streets (area_id, name, slug, sort_order)
  VALUES (v_area_id, 'Awobodu Street', 'awobodu-street', 130)
  ON CONFLICT (area_id, slug) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order, is_active = true
  RETURNING id INTO v_street_id;
  INSERT INTO public.location_landmarks (street_id, name, slug, latitude, longitude, kind, sort_order)
  VALUES (v_street_id, 'Awobodu House', 'awobodu-house', 6.9302, 3.9235, 'landmark', 10)
  ON CONFLICT (street_id, slug) DO UPDATE SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, kind = EXCLUDED.kind, sort_order = EXCLUDED.sort_order, is_active = true;

  -- 10. Sanni Close
  INSERT INTO public.location_streets (area_id, name, slug, sort_order)
  VALUES (v_area_id, 'Sanni Close', 'sanni-close', 140)
  ON CONFLICT (area_id, slug) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order, is_active = true
  RETURNING id INTO v_street_id;
  INSERT INTO public.location_landmarks (street_id, name, slug, latitude, longitude, kind, sort_order)
  VALUES (v_street_id, 'Sanni Compound', 'sanni-compound', 6.9309, 3.9239, 'landmark', 10)
  ON CONFLICT (street_id, slug) DO UPDATE SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, kind = EXCLUDED.kind, sort_order = EXCLUDED.sort_order, is_active = true;

  -- 11. Onasanya Close
  INSERT INTO public.location_streets (area_id, name, slug, sort_order)
  VALUES (v_area_id, 'Onasanya Close', 'onasanya-close', 150)
  ON CONFLICT (area_id, slug) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order, is_active = true
  RETURNING id INTO v_street_id;
  INSERT INTO public.location_landmarks (street_id, name, slug, latitude, longitude, kind, sort_order)
  VALUES (v_street_id, 'Onasanya Compound', 'onasanya-compound', 6.9326, 3.9249, 'landmark', 10)
  ON CONFLICT (street_id, slug) DO UPDATE SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, kind = EXCLUDED.kind, sort_order = EXCLUDED.sort_order, is_active = true;

  -- 12. Badero Street
  INSERT INTO public.location_streets (area_id, name, slug, sort_order)
  VALUES (v_area_id, 'Badero Street', 'badero-street', 160)
  ON CONFLICT (area_id, slug) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order, is_active = true
  RETURNING id INTO v_street_id;
  INSERT INTO public.location_landmarks (street_id, name, slug, latitude, longitude, kind, sort_order)
  VALUES (v_street_id, 'Badero Compound', 'badero-compound', 6.9322, 3.9233, 'landmark', 10)
  ON CONFLICT (street_id, slug) DO UPDATE SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, kind = EXCLUDED.kind, sort_order = EXCLUDED.sort_order, is_active = true;

  -- 13. Fakoya Lane
  INSERT INTO public.location_streets (area_id, name, slug, sort_order)
  VALUES (v_area_id, 'Fakoya Lane', 'fakoya-lane', 170)
  ON CONFLICT (area_id, slug) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order, is_active = true
  RETURNING id INTO v_street_id;
  INSERT INTO public.location_landmarks (street_id, name, slug, latitude, longitude, kind, sort_order)
  VALUES (v_street_id, 'Fakoya Compound', 'fakoya-compound', 6.9328, 3.9239, 'landmark', 10)
  ON CONFLICT (street_id, slug) DO UPDATE SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, kind = EXCLUDED.kind, sort_order = EXCLUDED.sort_order, is_active = true;

  -- 14. Folorunsho Street
  INSERT INTO public.location_streets (area_id, name, slug, sort_order)
  VALUES (v_area_id, 'Folorunsho Street', 'folorunsho-street', 180)
  ON CONFLICT (area_id, slug) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order, is_active = true
  RETURNING id INTO v_street_id;
  INSERT INTO public.location_landmarks (street_id, name, slug, latitude, longitude, kind, sort_order)
  VALUES (v_street_id, 'Folorunsho Compound', 'folorunsho-compound', 6.9310, 3.9246, 'landmark', 10)
  ON CONFLICT (street_id, slug) DO UPDATE SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, kind = EXCLUDED.kind, sort_order = EXCLUDED.sort_order, is_active = true;

  -- 15. Olubajo Street
  INSERT INTO public.location_streets (area_id, name, slug, sort_order)
  VALUES (v_area_id, 'Olubajo Street', 'olubajo-street', 190)
  ON CONFLICT (area_id, slug) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order, is_active = true
  RETURNING id INTO v_street_id;
  INSERT INTO public.location_landmarks (street_id, name, slug, latitude, longitude, kind, sort_order)
  VALUES (v_street_id, 'Olubajo Compound', 'olubajo-compound', 6.9307, 3.9252, 'landmark', 10)
  ON CONFLICT (street_id, slug) DO UPDATE SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, kind = EXCLUDED.kind, sort_order = EXCLUDED.sort_order, is_active = true;

  -- 16. Adefala Street
  INSERT INTO public.location_streets (area_id, name, slug, sort_order)
  VALUES (v_area_id, 'Adefala Street', 'adefala-street', 200)
  ON CONFLICT (area_id, slug) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order, is_active = true
  RETURNING id INTO v_street_id;
  INSERT INTO public.location_landmarks (street_id, name, slug, latitude, longitude, kind, sort_order)
  VALUES (v_street_id, 'Adefala Compound', 'adefala-compound', 6.9321, 3.9255, 'landmark', 10)
  ON CONFLICT (street_id, slug) DO UPDATE SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, kind = EXCLUDED.kind, sort_order = EXCLUDED.sort_order, is_active = true;


  -- ==========================================
  -- CLUSTER: Pepsi Alwo Axis
  -- ==========================================
  SELECT id INTO v_area_id FROM public.location_areas WHERE slug = 'pepsi-alwo';

  -- 17. Pepsi Lakeside Crescent
  INSERT INTO public.location_streets (area_id, name, slug, sort_order)
  VALUES (v_area_id, 'Pepsi Lakeside Crescent', 'pepsi-lakeside-crescent', 50)
  ON CONFLICT (area_id, slug) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order, is_active = true
  RETURNING id INTO v_street_id;
  INSERT INTO public.location_landmarks (street_id, name, slug, latitude, longitude, kind, sort_order)
  VALUES (v_street_id, 'Lakeside Junction', 'lakeside-junction', 6.9483, 3.9274, 'junction', 10)
  ON CONFLICT (street_id, slug) DO UPDATE SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, kind = EXCLUDED.kind, sort_order = EXCLUDED.sort_order, is_active = true;

  -- 18. Pepsi Alwo Lane
  INSERT INTO public.location_streets (area_id, name, slug, sort_order)
  VALUES (v_area_id, 'Pepsi Alwo Lane', 'pepsi-alwo-lane', 60)
  ON CONFLICT (area_id, slug) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order, is_active = true
  RETURNING id INTO v_street_id;
  INSERT INTO public.location_landmarks (street_id, name, slug, latitude, longitude, kind, sort_order)
  VALUES (v_street_id, 'Alwo Street Junction', 'alwo-street-junction', 6.9491, 3.9271, 'junction', 10)
  ON CONFLICT (street_id, slug) DO UPDATE SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, kind = EXCLUDED.kind, sort_order = EXCLUDED.sort_order, is_active = true;

  -- 19. Pepsi Avenue
  INSERT INTO public.location_streets (area_id, name, slug, sort_order)
  VALUES (v_area_id, 'Pepsi Avenue', 'pepsi-avenue', 70)
  ON CONFLICT (area_id, slug) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order, is_active = true
  RETURNING id INTO v_street_id;
  INSERT INTO public.location_landmarks (street_id, name, slug, latitude, longitude, kind, sort_order)
  VALUES (v_street_id, 'Pepsi Avenue Point', 'pepsi-avenue-point', 6.9478, 3.9256, 'landmark', 10)
  ON CONFLICT (street_id, slug) DO UPDATE SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, kind = EXCLUDED.kind, sort_order = EXCLUDED.sort_order, is_active = true;

  -- 20. Shobowale Lane
  INSERT INTO public.location_streets (area_id, name, slug, sort_order)
  VALUES (v_area_id, 'Shobowale Lane', 'shobowale-lane', 80)
  ON CONFLICT (area_id, slug) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order, is_active = true
  RETURNING id INTO v_street_id;
  INSERT INTO public.location_landmarks (street_id, name, slug, latitude, longitude, kind, sort_order)
  VALUES (v_street_id, 'Shobowale Compound', 'shobowale-compound', 6.9472, 3.9253, 'landmark', 10)
  ON CONFLICT (street_id, slug) DO UPDATE SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, kind = EXCLUDED.kind, sort_order = EXCLUDED.sort_order, is_active = true;

  -- 21. Oyenuga Lane
  INSERT INTO public.location_streets (area_id, name, slug, sort_order)
  VALUES (v_area_id, 'Oyenuga Lane', 'oyenuga-lane', 90)
  ON CONFLICT (area_id, slug) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order, is_active = true
  RETURNING id INTO v_street_id;
  INSERT INTO public.location_landmarks (street_id, name, slug, latitude, longitude, kind, sort_order)
  VALUES (v_street_id, 'Oyenuga Compound', 'oyenuga-compound', 6.9493, 3.9276, 'landmark', 10)
  ON CONFLICT (street_id, slug) DO UPDATE SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, kind = EXCLUDED.kind, sort_order = EXCLUDED.sort_order, is_active = true;

  -- 22. Banjo Crescent
  INSERT INTO public.location_streets (area_id, name, slug, sort_order)
  VALUES (v_area_id, 'Banjo Crescent', 'banjo-crescent', 100)
  ON CONFLICT (area_id, slug) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order, is_active = true
  RETURNING id INTO v_street_id;
  INSERT INTO public.location_landmarks (street_id, name, slug, latitude, longitude, kind, sort_order)
  VALUES (v_street_id, 'Banjo Compound', 'banjo-compound', 6.9488, 3.9265, 'landmark', 10)
  ON CONFLICT (street_id, slug) DO UPDATE SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, kind = EXCLUDED.kind, sort_order = EXCLUDED.sort_order, is_active = true;

  -- 23. Pepsi Court
  INSERT INTO public.location_streets (area_id, name, slug, sort_order)
  VALUES (v_area_id, 'Pepsi Court', 'pepsi-court', 110)
  ON CONFLICT (area_id, slug) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order, is_active = true
  RETURNING id INTO v_street_id;
  INSERT INTO public.location_landmarks (street_id, name, slug, latitude, longitude, kind, sort_order)
  VALUES (v_street_id, 'Pepsi Lodge Close', 'pepsi-lodge-close', 6.9479, 3.9259, 'hostel', 10)
  ON CONFLICT (street_id, slug) DO UPDATE SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, kind = EXCLUDED.kind, sort_order = EXCLUDED.sort_order, is_active = true;

  -- 24. Alwo Close
  INSERT INTO public.location_streets (area_id, name, slug, sort_order)
  VALUES (v_area_id, 'Alwo Close', 'alwo-close', 120)
  ON CONFLICT (area_id, slug) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order, is_active = true
  RETURNING id INTO v_street_id;
  INSERT INTO public.location_landmarks (street_id, name, slug, latitude, longitude, kind, sort_order)
  VALUES (v_street_id, 'Alwo Compound Point', 'alwo-compound-point', 6.9490, 3.9269, 'landmark', 10)
  ON CONFLICT (street_id, slug) DO UPDATE SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, kind = EXCLUDED.kind, sort_order = EXCLUDED.sort_order, is_active = true;

  -- 25. Pepsi Lakeside Close
  INSERT INTO public.location_streets (area_id, name, slug, sort_order)
  VALUES (v_area_id, 'Pepsi Lakeside Close', 'pepsi-lakeside-close', 130)
  ON CONFLICT (area_id, slug) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order, is_active = true
  RETURNING id INTO v_street_id;
  INSERT INTO public.location_landmarks (street_id, name, slug, latitude, longitude, kind, sort_order)
  VALUES (v_street_id, 'Lakeside Point', 'lakeside-point', 6.9482, 3.9271, 'landmark', 10)
  ON CONFLICT (street_id, slug) DO UPDATE SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, kind = EXCLUDED.kind, sort_order = EXCLUDED.sort_order, is_active = true;

  -- 26. Sanni Crescent
  INSERT INTO public.location_streets (area_id, name, slug, sort_order)
  VALUES (v_area_id, 'Sanni Crescent', 'sanni-crescent', 140)
  ON CONFLICT (area_id, slug) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order, is_active = true
  RETURNING id INTO v_street_id;
  INSERT INTO public.location_landmarks (street_id, name, slug, latitude, longitude, kind, sort_order)
  VALUES (v_street_id, 'Sanni Point', 'sanni-point', 6.9476, 3.9262, 'landmark', 10)
  ON CONFLICT (street_id, slug) DO UPDATE SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, kind = EXCLUDED.kind, sort_order = EXCLUDED.sort_order, is_active = true;

  -- 27. Market Square Road
  INSERT INTO public.location_streets (area_id, name, slug, sort_order)
  VALUES (v_area_id, 'Market Square Road', 'market-square-road', 150)
  ON CONFLICT (area_id, slug) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order, is_active = true
  RETURNING id INTO v_street_id;
  INSERT INTO public.location_landmarks (street_id, name, slug, latitude, longitude, kind, sort_order)
  VALUES (v_street_id, 'Market Square Point', 'market-square-point', 6.9485, 3.9267, 'landmark', 10)
  ON CONFLICT (street_id, slug) DO UPDATE SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, kind = EXCLUDED.kind, sort_order = EXCLUDED.sort_order, is_active = true;

  -- 28. Alwo Bypass Road
  INSERT INTO public.location_streets (area_id, name, slug, sort_order)
  VALUES (v_area_id, 'Alwo Bypass Road', 'alwo-bypass-road', 160)
  ON CONFLICT (area_id, slug) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order, is_active = true
  RETURNING id INTO v_street_id;
  INSERT INTO public.location_landmarks (street_id, name, slug, latitude, longitude, kind, sort_order)
  VALUES (v_street_id, 'Alwo Bypass Point', 'alwo-bypass-point', 6.9492, 3.9263, 'landmark', 10)
  ON CONFLICT (street_id, slug) DO UPDATE SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, kind = EXCLUDED.kind, sort_order = EXCLUDED.sort_order, is_active = true;

  -- 29. Adetayo Lane
  INSERT INTO public.location_streets (area_id, name, slug, sort_order)
  VALUES (v_area_id, 'Adetayo Lane', 'adetayo-lane', 170)
  ON CONFLICT (area_id, slug) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order, is_active = true
  RETURNING id INTO v_street_id;
  INSERT INTO public.location_landmarks (street_id, name, slug, latitude, longitude, kind, sort_order)
  VALUES (v_street_id, 'Adetayo Compound', 'adetayo-compound', 6.9474, 3.9259, 'landmark', 10)
  ON CONFLICT (street_id, slug) DO UPDATE SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, kind = EXCLUDED.kind, sort_order = EXCLUDED.sort_order, is_active = true;

  -- 30. Adenaike Lane
  INSERT INTO public.location_streets (area_id, name, slug, sort_order)
  VALUES (v_area_id, 'Adenaike Lane', 'adenaike-lane', 180)
  ON CONFLICT (area_id, slug) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order, is_active = true
  RETURNING id INTO v_street_id;
  INSERT INTO public.location_landmarks (street_id, name, slug, latitude, longitude, kind, sort_order)
  VALUES (v_street_id, 'Adenaike Compound', 'adenaike-compound', 6.9480, 3.9251, 'landmark', 10)
  ON CONFLICT (street_id, slug) DO UPDATE SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, kind = EXCLUDED.kind, sort_order = EXCLUDED.sort_order, is_active = true;

  -- 31. Oshodi Lane
  INSERT INTO public.location_streets (area_id, name, slug, sort_order)
  VALUES (v_area_id, 'Oshodi Lane', 'oshodi-lane', 190)
  ON CONFLICT (area_id, slug) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order, is_active = true
  RETURNING id INTO v_street_id;
  INSERT INTO public.location_landmarks (street_id, name, slug, latitude, longitude, kind, sort_order)
  VALUES (v_street_id, 'Oshodi Compound', 'oshodi-compound', 6.9495, 3.9260, 'landmark', 10)
  ON CONFLICT (street_id, slug) DO UPDATE SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, kind = EXCLUDED.kind, sort_order = EXCLUDED.sort_order, is_active = true;

  -- 32. Okusanya Street
  INSERT INTO public.location_streets (area_id, name, slug, sort_order)
  VALUES (v_area_id, 'Okusanya Street', 'okusanya-street', 200)
  ON CONFLICT (area_id, slug) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order, is_active = true
  RETURNING id INTO v_street_id;
  INSERT INTO public.location_landmarks (street_id, name, slug, latitude, longitude, kind, sort_order)
  VALUES (v_street_id, 'Okusanya Compound', 'okusanya-compound', 6.9487, 3.9257, 'landmark', 10)
  ON CONFLICT (street_id, slug) DO UPDATE SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, kind = EXCLUDED.kind, sort_order = EXCLUDED.sort_order, is_active = true;

  -- 33. Oduwole Crescent
  INSERT INTO public.location_streets (area_id, name, slug, sort_order)
  VALUES (v_area_id, 'Oduwole Crescent', 'oduwole-crescent', 210)
  ON CONFLICT (area_id, slug) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order, is_active = true
  RETURNING id INTO v_street_id;
  INSERT INTO public.location_landmarks (street_id, name, slug, latitude, longitude, kind, sort_order)
  VALUES (v_street_id, 'Oduwole Compound', 'oduwole-compound', 6.9477, 3.9270, 'landmark', 10)
  ON CONFLICT (street_id, slug) DO UPDATE SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, kind = EXCLUDED.kind, sort_order = EXCLUDED.sort_order, is_active = true;


  -- ==========================================
  -- CLUSTER: Ago Town Axis
  -- ==========================================
  SELECT id INTO v_area_id FROM public.location_areas WHERE slug = 'ago-town';

  -- 34. Palace Crescent
  INSERT INTO public.location_streets (area_id, name, slug, sort_order)
  VALUES (v_area_id, 'Palace Crescent', 'palace-crescent', 90)
  ON CONFLICT (area_id, slug) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order, is_active = true
  RETURNING id INTO v_street_id;
  INSERT INTO public.location_landmarks (street_id, name, slug, latitude, longitude, kind, sort_order)
  VALUES (v_street_id, 'Palace Gate Point', 'palace-gate-point', 6.9313, 3.9193, 'landmark', 10)
  ON CONFLICT (street_id, slug) DO UPDATE SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, kind = EXCLUDED.kind, sort_order = EXCLUDED.sort_order, is_active = true;

  -- 35. Secretariat Crescent
  INSERT INTO public.location_streets (area_id, name, slug, sort_order)
  VALUES (v_area_id, 'Secretariat Crescent', 'secretariat-crescent', 100)
  ON CONFLICT (area_id, slug) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order, is_active = true
  RETURNING id INTO v_street_id;
  INSERT INTO public.location_landmarks (street_id, name, slug, latitude, longitude, kind, sort_order)
  VALUES (v_street_id, 'Secretariat Gate Point', 'secretariat-gate-point', 6.9304, 3.9213, 'landmark', 10)
  ON CONFLICT (street_id, slug) DO UPDATE SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, kind = EXCLUDED.kind, sort_order = EXCLUDED.sort_order, is_active = true;

  -- 36. Post Office Close
  INSERT INTO public.location_streets (area_id, name, slug, sort_order)
  VALUES (v_area_id, 'Post Office Close', 'post-office-close', 110)
  ON CONFLICT (area_id, slug) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order, is_active = true
  RETURNING id INTO v_street_id;
  INSERT INTO public.location_landmarks (street_id, name, slug, latitude, longitude, kind, sort_order)
  VALUES (v_street_id, 'Post Office Line Point', 'post-office-line-point', 6.9310, 3.9205, 'landmark', 10)
  ON CONFLICT (street_id, slug) DO UPDATE SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, kind = EXCLUDED.kind, sort_order = EXCLUDED.sort_order, is_active = true;

  -- 37. Market Lane
  INSERT INTO public.location_streets (area_id, name, slug, sort_order)
  VALUES (v_area_id, 'Market Lane', 'market-lane', 120)
  ON CONFLICT (area_id, slug) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order, is_active = true
  RETURNING id INTO v_street_id;
  INSERT INTO public.location_landmarks (street_id, name, slug, latitude, longitude, kind, sort_order)
  VALUES (v_street_id, 'Ago Market Close Point', 'ago-market-close-point', 6.9321, 3.9190, 'market', 10)
  ON CONFLICT (street_id, slug) DO UPDATE SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, kind = EXCLUDED.kind, sort_order = EXCLUDED.sort_order, is_active = true;

  -- 38. Adesina Crescent
  INSERT INTO public.location_streets (area_id, name, slug, sort_order)
  VALUES (v_area_id, 'Adesina Crescent', 'adesina-crescent', 130)
  ON CONFLICT (area_id, slug) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order, is_active = true
  RETURNING id INTO v_street_id;
  INSERT INTO public.location_landmarks (street_id, name, slug, latitude, longitude, kind, sort_order)
  VALUES (v_street_id, 'Adesina Point', 'adesina-point', 6.9317, 3.9198, 'landmark', 10)
  ON CONFLICT (street_id, slug) DO UPDATE SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, kind = EXCLUDED.kind, sort_order = EXCLUDED.sort_order, is_active = true;

  -- 39. Osiyemi Crescent
  INSERT INTO public.location_streets (area_id, name, slug, sort_order)
  VALUES (v_area_id, 'Osiyemi Crescent', 'osiyemi-crescent', 140)
  ON CONFLICT (area_id, slug) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order, is_active = true
  RETURNING id INTO v_street_id;
  INSERT INTO public.location_landmarks (street_id, name, slug, latitude, longitude, kind, sort_order)
  VALUES (v_street_id, 'Osiyemi Point', 'osiyemi-point', 6.9325, 3.9214, 'landmark', 10)
  ON CONFLICT (street_id, slug) DO UPDATE SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, kind = EXCLUDED.kind, sort_order = EXCLUDED.sort_order, is_active = true;

  -- 40. Oseni Close
  INSERT INTO public.location_streets (area_id, name, slug, sort_order)
  VALUES (v_area_id, 'Oseni Close', 'oseni-close', 150)
  ON CONFLICT (area_id, slug) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order, is_active = true
  RETURNING id INTO v_street_id;
  INSERT INTO public.location_landmarks (street_id, name, slug, latitude, longitude, kind, sort_order)
  VALUES (v_street_id, 'Oseni Point', 'oseni-point', 6.9329, 3.9191, 'landmark', 10)
  ON CONFLICT (street_id, slug) DO UPDATE SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, kind = EXCLUDED.kind, sort_order = EXCLUDED.sort_order, is_active = true;

  -- 41. Adesanya Crescent
  INSERT INTO public.location_streets (area_id, name, slug, sort_order)
  VALUES (v_area_id, 'Adesanya Crescent', 'adesanya-crescent', 160)
  ON CONFLICT (area_id, slug) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order, is_active = true
  RETURNING id INTO v_street_id;
  INSERT INTO public.location_landmarks (street_id, name, slug, latitude, longitude, kind, sort_order)
  VALUES (v_street_id, 'Adesanya Point', 'adesanya-point', 6.9320, 3.9207, 'landmark', 10)
  ON CONFLICT (street_id, slug) DO UPDATE SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, kind = EXCLUDED.kind, sort_order = EXCLUDED.sort_order, is_active = true;

  -- 42. Town Hall Lane
  INSERT INTO public.location_streets (area_id, name, slug, sort_order)
  VALUES (v_area_id, 'Town Hall Lane', 'town-hall-lane', 170)
  ON CONFLICT (area_id, slug) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order, is_active = true
  RETURNING id INTO v_street_id;
  INSERT INTO public.location_landmarks (street_id, name, slug, latitude, longitude, kind, sort_order)
  VALUES (v_street_id, 'Town Hall Point', 'town-hall-point', 6.9324, 3.9201, 'landmark', 10)
  ON CONFLICT (street_id, slug) DO UPDATE SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, kind = EXCLUDED.kind, sort_order = EXCLUDED.sort_order, is_active = true;

  -- 43. Ebumawe Crescent
  INSERT INTO public.location_streets (area_id, name, slug, sort_order)
  VALUES (v_area_id, 'Ebumawe Crescent', 'ebumawe-crescent', 180)
  ON CONFLICT (area_id, slug) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order, is_active = true
  RETURNING id INTO v_street_id;
  INSERT INTO public.location_landmarks (street_id, name, slug, latitude, longitude, kind, sort_order)
  VALUES (v_street_id, 'Ebumawe Close Point', 'ebumawe-close-point', 6.9315, 3.9188, 'landmark', 10)
  ON CONFLICT (street_id, slug) DO UPDATE SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, kind = EXCLUDED.kind, sort_order = EXCLUDED.sort_order, is_active = true;

  -- 44. Adenuga Lane
  INSERT INTO public.location_streets (area_id, name, slug, sort_order)
  VALUES (v_area_id, 'Adenuga Lane', 'adenuga-lane', 190)
  ON CONFLICT (area_id, slug) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order, is_active = true
  RETURNING id INTO v_street_id;
  INSERT INTO public.location_landmarks (street_id, name, slug, latitude, longitude, kind, sort_order)
  VALUES (v_street_id, 'Adenuga Compound Point', 'adenuga-compound-point', 6.9308, 3.9203, 'landmark', 10)
  ON CONFLICT (street_id, slug) DO UPDATE SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, kind = EXCLUDED.kind, sort_order = EXCLUDED.sort_order, is_active = true;

  -- 45. Olatunji Street
  INSERT INTO public.location_streets (area_id, name, slug, sort_order)
  VALUES (v_area_id, 'Olatunji Street', 'olatunji-street', 200)
  ON CONFLICT (area_id, slug) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order, is_active = true
  RETURNING id INTO v_street_id;
  INSERT INTO public.location_landmarks (street_id, name, slug, latitude, longitude, kind, sort_order)
  VALUES (v_street_id, 'Olatunji Compound Point', 'olatunji-compound-point', 6.9327, 3.9209, 'landmark', 10)
  ON CONFLICT (street_id, slug) DO UPDATE SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, kind = EXCLUDED.kind, sort_order = EXCLUDED.sort_order, is_active = true;

  -- 46. Adebanjo Street
  INSERT INTO public.location_streets (area_id, name, slug, sort_order)
  VALUES (v_area_id, 'Adebanjo Street', 'adebanjo-street', 210)
  ON CONFLICT (area_id, slug) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order, is_active = true
  RETURNING id INTO v_street_id;
  INSERT INTO public.location_landmarks (street_id, name, slug, latitude, longitude, kind, sort_order)
  VALUES (v_street_id, 'Adebanjo Compound Point', 'adebanjo-compound-point', 6.9303, 3.9195, 'landmark', 10)
  ON CONFLICT (street_id, slug) DO UPDATE SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, kind = EXCLUDED.kind, sort_order = EXCLUDED.sort_order, is_active = true;

  -- 47. Ogunbayo Street
  INSERT INTO public.location_streets (area_id, name, slug, sort_order)
  VALUES (v_area_id, 'Ogunbayo Street', 'ogunbayo-street', 220)
  ON CONFLICT (area_id, slug) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order, is_active = true
  RETURNING id INTO v_street_id;
  INSERT INTO public.location_landmarks (street_id, name, slug, latitude, longitude, kind, sort_order)
  VALUES (v_street_id, 'Ogunbayo Compound Point', 'ogunbayo-compound-point', 6.9332, 3.9205, 'landmark', 10)
  ON CONFLICT (street_id, slug) DO UPDATE SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, kind = EXCLUDED.kind, sort_order = EXCLUDED.sort_order, is_active = true;

  -- 48. Sotunde Lane
  INSERT INTO public.location_streets (area_id, name, slug, sort_order)
  VALUES (v_area_id, 'Sotunde Lane', 'sotunde-lane', 230)
  ON CONFLICT (area_id, slug) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order, is_active = true
  RETURNING id INTO v_street_id;
  INSERT INTO public.location_landmarks (street_id, name, slug, latitude, longitude, kind, sort_order)
  VALUES (v_street_id, 'Sotunde Compound Point', 'sotunde-compound-point', 6.9323, 3.9185, 'landmark', 10)
  ON CONFLICT (street_id, slug) DO UPDATE SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, kind = EXCLUDED.kind, sort_order = EXCLUDED.sort_order, is_active = true;

  -- 49. Osiyemi Lane
  INSERT INTO public.location_streets (area_id, name, slug, sort_order)
  VALUES (v_area_id, 'Osiyemi Lane', 'osiyemi-lane', 240)
  ON CONFLICT (area_id, slug) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order, is_active = true
  RETURNING id INTO v_street_id;
  INSERT INTO public.location_landmarks (street_id, name, slug, latitude, longitude, kind, sort_order)
  VALUES (v_street_id, 'Osiyemi Compound Point', 'osiyemi-compound-point', 6.9312, 3.9189, 'landmark', 10)
  ON CONFLICT (street_id, slug) DO UPDATE SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, kind = EXCLUDED.kind, sort_order = EXCLUDED.sort_order, is_active = true;

  -- 50. Balogun Lane
  INSERT INTO public.location_streets (area_id, name, slug, sort_order)
  VALUES (v_area_id, 'Balogun Lane', 'balogun-lane', 250)
  ON CONFLICT (area_id, slug) DO UPDATE SET name = EXCLUDED.name, sort_order = EXCLUDED.sort_order, is_active = true
  RETURNING id INTO v_street_id;
  INSERT INTO public.location_landmarks (street_id, name, slug, latitude, longitude, kind, sort_order)
  VALUES (v_street_id, 'Balogun Compound Point', 'balogun-compound-point', 6.9309, 3.9200, 'landmark', 10)
  ON CONFLICT (street_id, slug) DO UPDATE SET latitude = EXCLUDED.latitude, longitude = EXCLUDED.longitude, kind = EXCLUDED.kind, sort_order = EXCLUDED.sort_order, is_active = true;

END $$;
