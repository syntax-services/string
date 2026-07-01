const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://kxynwcuhgawnhqoexpti.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt4eW53Y3VoZ2F3bmhxb2V4cHRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5NDAxNDYsImV4cCI6MjA4NTUxNjE0Nn0.W7p6v78dZBMGKIYWlrnFWMeSgzVHXWXSapudY-qgAEI";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

const accounts = [
  { email: "string_customer_prod@string.demo", password: "StringProdPass123!", role: "customer" },
  { email: "string_merchant_prod@string.demo", password: "StringProdPass123!", role: "merchant" }
];

async function check() {
  console.log("Checking login status of test accounts...");
  for (const acc of accounts) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: acc.email,
      password: acc.password
    });
    if (error) {
      console.log(`[FAILED] ${acc.role} (${acc.email}): ${error.message}`);
    } else {
      console.log(`[SUCCESS] ${acc.role} (${acc.email}): Logged in successfully! Session ID: ${data.session.access_token.substring(0, 15)}...`);
    }
  }
}

check();
