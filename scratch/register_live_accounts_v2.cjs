const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://kxynwcuhgawnhqoexpti.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt4eW53Y3VoZ2F3bmhxb2V4cHRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5NDAxNDYsImV4cCI6MjA4NTUxNjE0Nn0.W7p6v78dZBMGKIYWlrnFWMeSgzVHXWXSapudY-qgAEI";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

const accounts = [
  {
    email: "string_customer_live@string.demo",
    password: "StringProdPass123!",
    name: "John Customer Live",
    type: "customer"
  },
  {
    email: "string_merchant_live@string.demo",
    password: "StringProdPass123!",
    name: "Mary Merchant Live",
    type: "business"
  }
];

async function run() {
  console.log("Registering and testing new accounts with confirmation disabled...");
  
  for (const acc of accounts) {
    console.log(`\nRegistering ${acc.type}: ${acc.email}...`);
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: acc.email,
      password: acc.password,
      options: {
        data: {
          full_name: acc.name,
          account_type: acc.type === "business" ? "customer" : "customer"
        }
      }
    });

    if (signUpError) {
      if (signUpError.message.includes("already registered") || signUpError.message.includes("User already exists")) {
        console.log(`[EXISTED] Account already exists.`);
      } else {
        console.error(`[ERROR] Registration failed:`, signUpError.message);
        continue;
      }
    } else {
      console.log(`[SUCCESS] Account registered. User ID: ${signUpData.user.id}`);
    }

    // Attempt login to verify
    const { data: logData, error: logError } = await supabase.auth.signInWithPassword({
      email: acc.email,
      password: acc.password
    });

    if (logError) {
      console.error(`[LOGIN FAILED] ${acc.email}: ${logError.message}`);
    } else {
      console.log(`[LOGIN SUCCESS] ${acc.email}: Session Active!`);
    }
  }
}

run();
