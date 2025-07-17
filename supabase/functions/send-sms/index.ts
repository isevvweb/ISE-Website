// @ts-ignore
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log("--- Send SMS Function Start (Sinch) ---");

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log("Handling OPTIONS request for send-sms.");
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, message } = await req.json();
    console.log("Received SMS request:", { to, message });

    if (!to || !message) {
      return new Response(JSON.stringify({ error: "Missing 'to' or 'message' in request body." }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // @ts-ignore
    const sinchServicePlanId = Deno.env.get('SINCH_SERVICE_PLAN_ID');
    // @ts-ignore
    const sinchApiKey = Deno.env.get('SINCH_API_KEY');
    // @ts-ignore
    const sinchApiSecret = Deno.env.get('SINCH_API_SECRET');
    // @ts-ignore
    const sinchPhoneNumber = Deno.env.get('SINCH_PHONE_NUMBER');

    if (!sinchServicePlanId || !sinchApiKey || !sinchApiSecret || !sinchPhoneNumber) {
      console.error("Sinch environment variables not set.");
      return new Response(JSON.stringify({ error: "Sinch credentials not configured." }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    const sinchApiUrl = `https://sms.api.sinch.com/xms/v1/${sinchServicePlanId}/batches`;
    const authHeader = `Basic ${btoa(`${sinchApiKey}:${sinchApiSecret}`)}`;

    const requestBody = {
      from: sinchPhoneNumber,
      to: [to], // Sinch expects 'to' as an array
      body: message,
    };

    console.log("Sending SMS via Sinch API...");
    const sinchResponse = await fetch(sinchApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader,
      },
      body: JSON.stringify(requestBody),
    });

    const sinchData = await sinchResponse.json();

    if (!sinchResponse.ok) {
      console.error("Sinch API error:", sinchData);
      return new Response(JSON.stringify({ error: sinchData.message || "Failed to send SMS via Sinch." }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: sinchResponse.status,
      });
    }

    console.log("SMS sent successfully via Sinch:", sinchData);
    return new Response(JSON.stringify({ message: "SMS sent successfully!", data: sinchData }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error: any) {
    console.error("Function error (caught):", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});