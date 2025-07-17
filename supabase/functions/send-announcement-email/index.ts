// @ts-ignore
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
// @ts-ignore
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
// @ts-ignore
import { Resend } from "https://esm.sh/resend@1.1.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log("--- Send Announcement Email Function Start ---");

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log("Handling OPTIONS request for send-announcement-email.");
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { announcement } = await req.json();
    console.log("Received announcement data:", announcement);

    // Initialize Supabase client with service role key to bypass RLS for subscriptions table
    const supabase = createClient(
      // @ts-ignore
      Deno.env.get('SUPABASE_URL') ?? '',
      // @ts-ignore
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    console.log("Supabase client initialized with service role key.");

    // Fetch all subscribed emails
    const { data: subscriptions, error: subError } = await supabase
      .from('subscriptions')
      .select('email');

    if (subError) {
      console.error("Error fetching subscriptions:", subError.message);
      throw new Error("Failed to fetch subscriptions: " + subError.message);
    }

    const subscriberEmails = subscriptions.map(sub => sub.email);
    console.log(`Found ${subscriberEmails.length} subscribers.`);

    if (subscriberEmails.length === 0) {
      console.log("No subscribers found. Skipping email send.");
      return new Response(JSON.stringify({ message: "No subscribers to send email to." }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // Initialize Resend client
    // @ts-ignore
    const resend = new Resend(Deno.env.get('RESEND_API_KEY'));
    console.log("Resend client initialized.");

    const emailSubject = `New Announcement from Islamic Society of Evansville: ${announcement.title}`;
    const emailBody = `
      <html>
      <head>
        <style>
          body { font-family: sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px; background-color: #f9f9f9; }
          h2 { color: #0056b3; }
          p { margin-bottom: 10px; }
          .date { font-style: italic; color: #666; }
          .image-container { text-align: center; margin-top: 20px; margin-bottom: 20px; }
          .image-container img { max-width: 100%; height: auto; border-radius: 8px; }
          .footer { text-align: center; margin-top: 30px; font-size: 0.8em; color: #888; }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>${announcement.title}</h2>
          <p class="date">Date: ${new Date(announcement.announcement_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          ${announcement.image_url ? `<div class="image-container"><img src="${announcement.image_url}" alt="${announcement.title}" /></div>` : ''}
          <p>${announcement.description}</p>
          <p>For more details, please visit our website's announcements page.</p>
          <p class="footer">You are receiving this email because you subscribed to announcements from the Islamic Society of Evansville.</p>
        </div>
      </body>
      </html>
    `;

    console.log("Attempting to send email via Resend to:", subscriberEmails);

    const { data: resendData, error: resendError } = await resend.emails.send({
      from: 'onboarding@resend.dev', // IMPORTANT: Using Resend's verified sandbox domain for testing
      to: subscriberEmails,
      subject: emailSubject,
      html: emailBody,
    });

    if (resendError) {
      console.error("Resend API error:", resendError);
      return new Response(JSON.stringify({ error: resendError.message }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    console.log("Emails sent successfully via Resend:", resendData);
    return new Response(JSON.stringify({ message: "Announcement emails sent successfully!", data: resendData }), {
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