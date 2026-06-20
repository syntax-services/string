import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://kxynwcuhgawnhqoexpti.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt4eW53Y3VoZ2F3bmhxb2V4cHRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5NDAxNDYsImV4cCI6MjA4NTUxNjE0Nn0.W7p6v78dZBMGKIYWlrnFWMeSgzVHXWXSapudY-qgAEI";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

async function printAllStreets() {
  const { data: areas } = await supabase.from('location_areas').select('*').eq('is_active', true).order('sort_order');
  const { data: streets } = await supabase.from('location_streets').select('*').eq('is_active', true).order('sort_order');
  const { data: landmarks } = await supabase.from('location_landmarks').select('*').eq('is_active', true).order('sort_order');

  console.log("=== ALL REGISTERED STREETS AND LANDMARKS ===");
  for (const area of areas) {
    console.log(`\n📍 AREA: ${area.name} (${area.slug})`);
    const areaStreets = streets.filter(s => s.area_id === area.id);
    if (areaStreets.length === 0) {
      console.log("  (No streets defined)");
      continue;
    }
    for (const street of areaStreets) {
      console.log(`  🛣️ STREET: ${street.name} (${street.slug})`);
      const streetLandmarks = landmarks.filter(l => l.street_id === street.id);
      for (const landmark of streetLandmarks) {
        console.log(`    🏢 LANDMARK: ${landmark.name} [Coords: ${landmark.latitude}, ${landmark.longitude}]`);
      }
    }
  }
}

printAllStreets();
