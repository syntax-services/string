const { createClient } = require('@supabase/supabase-js');
const SUPABASE_URL = "https://kxynwcuhgawnhqoexpti.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt4eW53Y3VoZ2F3bmhxb2V4cHRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5NDAxNDYsImV4cCI6MjA4NTUxNjE0Nn0.W7p6v78dZBMGKIYWlrnFWMeSgzVHXWXSapudY-qgAEI";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

const userIds = [
  '607ca803-534f-4ab7-be6d-f29e5b52749e', // BigAnon Private Chef owner
  'c5f427e0-e22a-4a93-9bb8-474b62ee17ff'  // syntax owner
];

async function run() {
  for (const userId of userIds) {
    console.log(`\nQuerying business for user_id: ${userId}...`);
    try {
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      
      console.log('Result:', data ? `Success: ${data.company_name} (id: ${data.id})` : 'No record found', error);
    } catch (e) {
      console.error('Catastrophic query failure:', e);
    }
  }
}

run();
