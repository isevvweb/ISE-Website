// @ts-ignore
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log("--- Send SMS Function Start ---");

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
    const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    // @ts-ignore
    const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');
    // @ts-ignore
    const twilioPhoneNumber = Deno.env.get('TWILIO_PHONE_NUMBER');

    if (!accountSid || !authToken || !twilioPhoneNumber) {
      console.error("Twilio environment variables not set.");
      return new Response(JSON.stringify({ error: "Twilio credentials not configured." }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    const twilioApiUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    const authHeader = `Basic ${btoa(`${accountSid}:${authToken}`)}`;

    const body = new URLSearchParams();
    body.append('To', to);
    body.append('From', twilioPhoneNumber);
    body.append('Body', message);

    console.log("Sending SMS via Twilio API...");
    const twilioResponse = await fetch(twilioApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': authHeader,
      },
      body: body.toString(),
    });

    const twilioData = await twilioResponse.json();

    if (!twilioResponse.ok) {
      console.error("Twilio API error:", twilioData);
      return new Response(JSON.stringify({ error: twilioData.message || "Failed to send SMS via Twilio." }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: twilioResponse.status,
      });
    }

    console.log("SMS sent successfully via Twilio:", twilioData);
    return new Response(JSON.stringify({ message: "SMS sent successfully!", data: twilioData }), {
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