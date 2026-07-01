const { createClient } = require('@supabase/supabase-js');
const SUPABASE_URL = "https://kxynwcuhgawnhqoexpti.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt4eW53Y3VoZ2F3bmhxb2V4cHRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5NDAxNDYsImV4cCI6MjA4NTUxNjE0Nn0.W7p6v78dZBMGKIYWlrnFWMeSgzVHXWXSapudY-qgAEI";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

async function run() {
  const { data: profiles, error: pError } = await supabase.from('profiles').select('*');
  console.log('Profiles count:', profiles ? profiles.length : 0, pError);

  const { data: businesses, error: bError } = await supabase.from('businesses').select('id, user_id, company_name');
  console.log('Businesses count:', businesses ? businesses.length : 0, bError);

  const { data: customers, error: cError } = await supabase.from('customers').select('id, user_id');
  console.log('Customers count:', customers ? customers.length : 0, cError);

  if (profiles && businesses) {
    console.log('\n--- Profiles and their Business status ---');
    profiles.forEach(p => {
      const hasBiz = businesses.find(b => b.user_id === p.user_id);
      const hasCust = customers.find(c => c.user_id === p.user_id);
      console.log(`User: ${p.full_name} (${p.email})`);
      console.log(`  user_id: ${p.user_id}`);
      console.log(`  user_type: ${p.user_type}`);
      console.log(`  Has Business: ${hasBiz ? 'YES (' + hasBiz.company_name + ', id: ' + hasBiz.id + ')' : 'NO'}`);
      console.log(`  Has Customer: ${hasCust ? 'YES (id: ' + hasCust.id + ')' : 'NO'}`);
    });
  }
}

run();
