const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://kxynwcuhgawnhqoexpti.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt4eW53Y3VoZ2F3bmhxb2V4cHRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5NDAxNDYsImV4cCI6MjA4NTUxNjE0Nn0.W7p6v78dZBMGKIYWlrnFWMeSgzVHXWXSapudY-qgAEI";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

const accounts = [
  {
    email: "string_customer_prod@string.demo",
    password: "StringProdPass123!",
    name: "John Customer Prod",
    type: "customer"
  },
  {
    email: "string_merchant_prod@string.demo",
    password: "StringProdPass123!",
    name: "Mary Merchant Prod",
    type: "business"
  }
];

async function registerAccounts() {
  console.log("Registering accounts on live Supabase backend...");
  
  for (const acc of accounts) {
    console.log(`\nRegistering ${acc.type}: ${acc.email}...`);
    const { data, error } = await supabase.auth.signUp({
      email: acc.email,
      password: acc.password,
      options: {
        data: {
          full_name: acc.name,
          account_type: acc.type === "business" ? "customer" : "customer" // Onboarding handles role switch
        }
      }
    });

    if (error) {
      if (error.message.includes("already registered") || error.message.includes("User already exists")) {
        console.log(`[ALREADY REGISTERED] Account ${acc.email} exists.`);
      } else {
        console.error(`[ERROR] Registration failed:`, error.message);
      }
    } else {
      console.log(`[SUCCESS] Account registered.`);
      console.log(`User ID: ${data.user.id}`);
      console.log(`Status: ${data.session ? "Verified & Logged In" : "Pending Verification (Email Sent)"}`);
    }
  }
}

registerAccounts();
