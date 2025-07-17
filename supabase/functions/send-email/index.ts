// @ts-ignore
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
// @ts-ignore
import { Resend } from "https://esm.sh/resend@1.1.0"; // Re-importing Resend

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
    const resend = new Resend(Deno.env.get('RESEND_API_KEY'));
    console.log("Resend client initialized.");

    let emailSubject = "";
    let emailBody = "";
    let toEmail = "isewebapi@gmail.com"; // Your recipient email
    let replyToEmail = ""; // This will be the user's email

    if (formType === "contact") {
      emailSubject = `New Contact Form Submission: ${data.subject}`;
      emailBody = `
        Name: ${data.name}
        Email: ${data.email}
        Subject: ${data.subject}
        Message: ${data.message}
      `;
      replyToEmail = data.email; // Set reply-to to the sender's email
    } else if (formType === "quranRequest") {
      emailSubject = "New Quran Request";
      emailBody = `
        Name: ${data.name}
        Email: ${data.email}
        Address: ${data.address}, ${data.city}, ${data.state} ${data.zip}
      `;
      replyToEmail = data.email; // Set reply-to to the sender's email
    } else {
      console.warn("Invalid form type received:", formType);
      return new Response(JSON.stringify({ error: "Invalid form type" }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    console.log("Attempting to send email via Resend with subject:", emailSubject);

    const { data: resendData, error } = await resend.emails.send({
      from: 'onboarding@resend.dev', // IMPORTANT: Using Resend's verified sandbox domain for testing
      to: toEmail,
      subject: emailSubject,
      html: `<pre>${emailBody}</pre>`,
      reply_to: replyToEmail, // Set the reply-to address
    });

    if (error) {
      console.error("Resend API error:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    console.log("Email sent successfully via Resend:", resendData);
    return new Response(JSON.stringify({ message: "Email sent successfully!", data: resendData }), {
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