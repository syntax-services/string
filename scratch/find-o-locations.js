import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://kxynwcuhgawnhqoexpti.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt4eW53Y3VoZ2F3bmhxb2V4cHRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5NDAxNDYsImV4cCI6MjA4NTUxNjE0Nn0.W7p6v78dZBMGKIYWlrnFWMeSgzVHXWXSapudY-qgAEI";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

async function findOLocations() {
  const { data: areas } = await supabase.from('location_areas').select('*');
  const { data: streets } = await supabase.from('location_streets').select('*');
  const { data: landmarks } = await supabase.from('location_landmarks').select('*');

  console.log("=== AREAS STARTING WITH O ===");
  areas.filter(a => a.name.toLowerCase().startsWith('o')).forEach(a => {
    console.log(`- ${a.name} (${a.slug})`);
  });

  console.log("\n=== STREETS STARTING WITH O ===");
  streets.filter(s => s.name.toLowerCase().startsWith('o')).forEach(s => {
    const area = areas.find(a => a.id === s.area_id);
    console.log(`- ${s.name} (Area: ${area ? area.name : 'Unknown'})`);
  });

  console.log("\n=== LANDMARKS STARTING WITH O ===");
  landmarks.filter(l => l.name.toLowerCase().startsWith('o')).forEach(l => {
    const street = streets.find(s => s.id === l.street_id);
    const area = street ? areas.find(a => a.id === street.area_id) : null;
    console.log(`- ${l.name} (Street: ${street ? street.name : 'Unknown'}, Area: ${area ? area.name : 'Unknown'}) [Coords: ${l.latitude}, ${l.longitude}]`);
  });
}

findOLocations();
