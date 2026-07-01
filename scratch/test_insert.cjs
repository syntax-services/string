const { createClient } = require('@supabase/supabase-js');
const SUPABASE_URL = "https://kxynwcuhgawnhqoexpti.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt4eW53Y3VoZ2F3bmhxb2V4cHRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5NDAxNDYsImV4cCI6MjA4NTUxNjE0Nn0.W7p6v78dZBMGKIYWlrnFWMeSgzVHXWXSapudY-qgAEI";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

const bizId = '554e3496-8208-437e-a6b5-1627fa58f33d'; // 'syntax' business

async function run() {
  console.log('Testing Product insert...');
  const { data: pData, error: pError } = await supabase.from('products').insert({
    business_id: bizId,
    name: 'Test Product ' + Date.now(),
    description: 'This is a test product',
    price: 100,
    in_stock: true
  }).select();
  console.log('Product insert result:', pData, pError);

  console.log('\nTesting Service insert...');
  const { data: sData, error: sError } = await supabase.from('services').insert({
    business_id: bizId,
    name: 'Test Service ' + Date.now(),
    description: 'This is a test service',
    price_min: 50,
    price_type: 'fixed',
    is_available: true
  }).select();
  console.log('Service insert result:', sData, sError);
}

run();
