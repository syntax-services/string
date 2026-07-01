const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = "https://kxynwcuhgawnhqoexpti.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt4eW53Y3VoZ2F3bmhxb2V4cHRpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5NDAxNDYsImV4cCI6MjA4NTUxNjE0Nn0.W7p6v78dZBMGKIYWlrnFWMeSgzVHXWXSapudY-qgAEI";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function run() {
  try {
    // 1. Get Domain from mail.gw
    console.log("Fetching mail.gw domains...");
    const domainRes = await fetch("https://api.mail.gw/domains");
    const domainData = await domainRes.json();
    const domain = domainData["hydra:member"][0].domain;
    console.log(`Using domain: ${domain}`);

    // 2. Create account on mail.gw
    const emailUser = `string_tester_${Date.now()}`;
    const email = `${emailUser}@${domain}`;
    const password = "StringTestPass123!";
    
    console.log(`Creating email account: ${email}`);
    const accRes = await fetch("https://api.mail.gw/accounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address: email, password })
    });
    const accData = await accRes.json();
    if (accData.error) {
      throw new Error(`Failed to create mail.gw account: ${JSON.stringify(accData)}`);
    }

    // 3. Get JWT Token from mail.gw
    console.log("Logging into mail.gw to get token...");
    const tokenRes = await fetch("https://api.mail.gw/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address: email, password })
    });
    const tokenData = await tokenRes.json();
    const token = tokenData.token;
    console.log("mail.gw Token received successfully.");

    // 4. Trigger Supabase Sign Up
    console.log(`Signing up on Supabase with: ${email}`);
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: "John Live User",
          account_type: "customer"
        }
      }
    });

    if (authError) {
      throw authError;
    }
    console.log("Supabase signup triggered. Waiting 10 seconds for email delivery...");
    await delay(10000);

    // 5. Poll for message
    let messageId = null;
    let attempts = 0;
    while (attempts < 6 && !messageId) {
      attempts++;
      console.log(`Polling for verification email (Attempt ${attempts}/6)...`);
      const msgRes = await fetch("https://api.mail.gw/messages", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const msgData = await msgRes.json();
      const messages = msgData["hydra:member"] || [];
      console.log(`Found ${messages.length} messages.`);
      
      const verificationMsg = messages.find(m => m.subject.includes("Confirm your signup") || m.intro.includes("confirm") || m.intro.includes("verify"));
      if (verificationMsg) {
        messageId = verificationMsg.id;
        console.log(`Found confirmation email! Message ID: ${messageId}`);
      } else {
        await delay(5000);
      }
    }

    if (!messageId) {
      throw new Error("Verification email did not arrive in time.");
    }

    // 6. Fetch email body and extract verify link
    console.log("Fetching message details...");
    const detailsRes = await fetch(`https://api.mail.gw/messages/${messageId}`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    const detailsData = await detailsRes.json();
    const htmlBody = detailsData.html[0] || detailsData.text || "";

    // Extract confirmation link
    // Pattern: https://kxynwcuhgawnhqoexpti.supabase.co/auth/v1/verify?token=...&type=signup&redirect_to=...
    const urlPattern = /href="([^"]+verify[^"]+)"|"(https:\/\/[^"]+verify[^"]+)"/i;
    const match = htmlBody.match(urlPattern);
    const verifyUrl = match ? (match[1] || match[2]).replace(/&amp;/g, "&") : null;

    if (!verifyUrl) {
      console.log("HTML Body:", htmlBody);
      throw new Error("Could not extract verification URL from email body.");
    }

    console.log(`Extracted verification URL: ${verifyUrl}`);

    // 7. Call verifyUrl to confirm account
    console.log("Executing GET request to verification URL to activate account...");
    const verifyRes = await fetch(verifyUrl, { redirect: "follow" });
    console.log(`Verification request status: ${verifyRes.status}`);
    console.log(`Verification final URL: ${verifyRes.url}`);

    // 8. Attempt login on Supabase now!
    console.log("Attempting to log in to Supabase now that user is verified...");
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (loginError) {
      throw loginError;
    }

    console.log("Login SUCCESS!");
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    console.log(`User ID: ${loginData.user.id}`);
    console.log(`Session Active: ${!!loginData.session}`);

  } catch (error) {
    console.error("Workflow failed with error:", error);
  }
}

run();
