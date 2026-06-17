import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const PAYSTACK_SECRET_KEY = Deno.env.get("PAYSTACK_SECRET_KEY");
    if (!PAYSTACK_SECRET_KEY) {
      throw new Error("PAYSTACK_SECRET_KEY is not configured in the environment variables");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify authentication
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error("Unauthorized access");
    }

    const { withdrawalRequestId } = await req.json();
    if (!withdrawalRequestId) {
      throw new Error("Withdrawal request ID is required");
    }

    // Fetch withdrawal request details
    const { data: wdRequest, error: fetchError } = await supabase
      .from("withdrawal_requests")
      .select("*, profiles:user_id(full_name, email)")
      .eq("id", withdrawalRequestId)
      .single();

    if (fetchError || !wdRequest) {
      throw new Error("Withdrawal request not found");
    }

    // Security check: Must belong to requesting user or be processed by admin
    if (wdRequest.user_id !== user.id) {
      const { data: adminRole } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (!adminRole) {
        throw new Error("Unauthorized access to this withdrawal request");
      }
    }

    if (wdRequest.status !== "pending") {
      throw new Error("Withdrawal request is already processed or in progress");
    }

    const amountInKobo = Math.round(Number(wdRequest.amount) * 100);
    const bankCode = wdRequest.bank_name; // Store bank code in bank_name field for Paystack API compatibility
    const accountNumber = wdRequest.account_number;
    const accountName = wdRequest.account_name;

    console.log(`Processing payout for request ${wdRequest.id} of ₦${wdRequest.amount} to bank code ${bankCode}, acct ${accountNumber}`);

    // Step 1: Create Transfer Recipient on Paystack
    const recipientResponse = await fetch("https://api.paystack.co/transferrecipient", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "nuban",
        name: accountName,
        account_number: accountNumber,
        bank_code: bankCode,
        currency: "NGN",
        description: `Coupon Payout for ${wdRequest.profiles?.full_name || 'User'}`
      })
    });

    const recipientData = await recipientResponse.json();
    
    if (!recipientResponse.ok || !recipientData.status || !recipientData.data) {
      throw new Error(recipientData.message || "Failed to create transfer recipient on Paystack");
    }

    const recipientCode = recipientData.data.recipient_code;
    console.log(`Created Paystack recipient code: ${recipientCode}`);

    // Step 2: Initiate Transfer on Paystack
    const transferResponse = await fetch("https://api.paystack.co/transfer", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        source: "balance",
        amount: amountInKobo,
        recipient: recipientCode,
        reason: "String Coupon Withdrawal payout",
        reference: `WD-${wdRequest.id.substring(0, 8)}`
      })
    });

    const transferData = await transferResponse.json();

    if (!transferResponse.ok || !transferData.status || !transferData.data) {
      throw new Error(transferData.message || "Failed to initiate bank transfer on Paystack");
    }

    const transferCode = transferData.data.transfer_code;
    const transferStatus = transferData.data.status; // e.g. success, open, pending, processing, failed

    console.log(`Paystack transfer initiated: ${transferCode}, status: ${transferStatus}`);

    // Step 3: Update Withdrawal Request Status in Database
    const dbStatus = (transferStatus === "success" || transferStatus === "processing" || transferStatus === "pending")
      ? "processing"
      : "rejected";

    const { error: updateError } = await supabase
      .from("withdrawal_requests")
      .update({
        status: dbStatus,
        admin_notes: `Processed via Paystack transfer. Code: ${transferCode}. Status: ${transferStatus}.`,
        processed_at: new Date().toISOString()
      })
      .eq("id", wdRequest.id);

    if (updateError) {
      console.error("Failed to update withdrawal status in DB:", updateError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Paystack payout initiated successfully",
        transferCode,
        status: dbStatus
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error("Paystack payout edge function error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message || "Payout processing failed" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 400,
      }
    );
  }
});
