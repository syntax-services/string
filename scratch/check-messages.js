import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://kxynwcuhgawnhqoexpti.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt4eW53Y3VoZ2F3bmhxb2V4cHRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5NDAxNDYsImV4cCI6MjA4NTUxNjE0Nn0.W7p6v78dZBMGKIYWlrnFWMeSgzVHXWXSapudY-qgAEI";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

async function check() {
  console.log("Fetching last 20 messages...");
  const { data, error } = await supabase
    .from('messages')
    .select('id, conversation_id, content, sender_type, created_at')
    .order('created_at', { ascending: false })
    .limit(20);
  
  if (error) {
    console.error("Error querying messages:", error);
  } else {
    console.log("Success! Last 20 messages:");
    console.log(JSON.stringify(data, null, 2));
  }
}

check();
