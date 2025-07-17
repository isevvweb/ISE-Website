// @ts-ignore
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log("--- Send SMS Function Start (Vonage) ---");

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
    const vonageApiKey = Deno.env.get('VONAGE_API_KEY');
    // @ts-ignore
    const vonageApiSecret = Deno.env.get('VONAGE_API_SECRET');
    // @ts-ignore
    const vonagePhoneNumber = Deno.env.get('VONAGE_PHONE_NUMBER');

    if (!vonageApiKey || !vonageApiSecret || !vonagePhoneNumber) {
      console.error("Vonage environment variables not set.");
      return new Response(JSON.stringify({ error: "Vonage credentials not configured." }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    const vonageApiUrl = 'https://rest.nexmo.com/sms/json';

    const body = new URLSearchParams();
    body.append('api_key', vonageApiKey);
    body.append('api_secret', vonageApiSecret);
    body.append('to', to);
    body.append('from', vonagePhoneNumber);
    body.append('text', message);

    console.log("Sending SMS via Vonage API...");
    const vonageResponse = await fetch(vonageApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });

    const vonageData = await vonageResponse.json();

    if (!vonageResponse.ok || vonageData.messages[0].status !== "0") {
      console.error("Vonage API error:", vonageData);
      return new Response(JSON.stringify({ error: vonageData.messages[0].error_text || "Failed to send SMS via Vonage." }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: vonageResponse.status,
      });
    }

    console.log("SMS sent successfully via Vonage:", vonageData);
    return new Response(JSON.stringify({ message: "SMS sent successfully!", data: vonageData }), {
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