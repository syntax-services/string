const { createClient } = require('@supabase/supabase-js');
const SUPABASE_URL = "https://kxynwcuhgawnhqoexpti.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt4eW53Y3VoZ2F3bmhxb2V4cHRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5NDAxNDYsImV4cCI6MjA4NTUxNjE0Nn0.W7p6v78dZBMGKIYWlrnFWMeSgzVHXWXSapudY-qgAEI";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

async function run() {
  const { data: businesses, error: bError } = await supabase.from('businesses').select('*').limit(5);
  console.log('Businesses:', businesses, bError);
  
  const { data: products, error: pError } = await supabase.from('products').select('*').limit(5);
  console.log('Products:', products, pError);

  const { data: services, error: sError } = await supabase.from('services').select('*').limit(5);
  console.log('Services:', services, sError);
}

run();
