const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://kxynwcuhgawnhqoexpti.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt4eW53Y3VoZ2F3bmhxb2V4cHRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5NDAxNDYsImV4cCI6MjA4NTUxNjE0Nn0.W7p6v78dZBMGKIYWlrnFWMeSgzVHXWXSapudY-qgAEI";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

const email = "string_customer_live@string.demo";
const password = "StringProdPass123!";

async function test() {
  console.log("Logging in...");
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (authError) {
    console.error("Login failed:", authError.message);
    return;
  }

  const user = authData.user;
  console.log(`Logged in successfully! User ID: ${user.id}`);

  console.log("Calling complete_onboarding_setup RPC...");
  const { data, error } = await supabase.rpc("complete_onboarding_setup", {
    p_full_name: "John Customer Live",
    p_phone: null,
    p_user_type: "customer",
    p_business_data: null,
    p_customer_data: {
      streetAddress: "N/A",
      areaName: "N/A",
      location: "Nigeria"
    }
  });

  if (error) {
    console.error("RPC Failed with database error:", error);
  } else {
    console.log("RPC Success! Response data:", JSON.stringify(data));
  }
}

test();
