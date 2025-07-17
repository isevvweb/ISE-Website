// @ts-ignore
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log("--- Function Start ---");
  console.log("Edge function received request.");

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log("Handling OPTIONS request.");
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Attempting to parse request body.");
    const { formType, data } = await req.json();
    console.log("Request body parsed:", { formType, data });

    // @ts-ignore
    const SENDGRID_API_KEY = Deno.env.get('SENDGRID_API_KEY');
    if (!SENDGRID_API_KEY) {
      console.error("SENDGRID_API_KEY is not set.");
      return new Response(JSON.stringify({ error: "Server configuration error: SendGrid API key missing." }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }
    console.log("SendGrid API key retrieved.");

    let emailSubject = "";
    let emailBody = "";
    let toEmail = "isewebapi@gmail.com"; // Your recipient email
    let fromEmail = "your_verified_sender_email@example.com"; // IMPORTANT: Replace with your VERIFIED SendGrid sender email
    let replyToEmail = "";

    if (formType === "contact") {
      emailSubject = `New Contact Form Submission: ${data.subject}`;
      emailBody = `
        Name: ${data.name}
        Email: ${data.email}
        Subject: ${data.subject}
        Message: ${data.message}
      `;
      replyToEmail = data.email;
    } else if (formType === "quranRequest") {
      emailSubject = "New Quran Request";
      emailBody = `
        Name: ${data.name}
        Email: ${data.email}
        Address: ${data.address}, ${data.city}, ${data.state} ${data.zip}
      `;
      replyToEmail = data.email;
    } else {
      console.warn("Invalid form type received:", formType);
      return new Response(JSON.stringify({ error: "Invalid form type" }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    console.log("Attempting to send email via SendGrid with subject:", emailSubject);

    const sendGridResponse = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SENDGRID_API_KEY}`,
      },
      body: JSON.stringify({
        personalizations: [{
          to: [{ email: toEmail }],
          reply_to: { email: replyToEmail },
        }],
        from: { email: fromEmail },
        subject: emailSubject,
        content: [{
          type: "text/plain",
          value: emailBody,
        }],
      }),
    });

    if (!sendGridResponse.ok) {
      const errorText = await sendGridResponse.text();
      console.error("SendGrid API error:", sendGridResponse.status, errorText);
      return new Response(JSON.stringify({ error: `Failed to send email via SendGrid: ${errorText}` }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: sendGridResponse.status,
      });
    }

    console.log("Email sent successfully via SendGrid.");
    return new Response(JSON.stringify({ message: "Email sent successfully!" }), {
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