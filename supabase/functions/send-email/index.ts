// @ts-ignore
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
// @ts-ignore
import { Resend } from "https://esm.sh/resend@1.1.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log("Edge function received request."); // Log at the very beginning
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { formType, data } = await req.json();
    console.log("Request body parsed:", { formType, data }); // Log after parsing body

    // @ts-ignore
    const resend = new Resend(Deno.env.get('RESEND_API_KEY'));
    console.log("Resend client initialized."); // Log after Resend init

    let emailSubject = "";
    let emailBody = "";
    let toEmail = "isewebapi@gmail.com"; // Updated recipient email

    if (formType === "contact") {
      emailSubject = `New Contact Form Submission: ${data.subject}`;
      emailBody = `
        Name: ${data.name}
        Email: ${data.email}
        Subject: ${data.subject}
        Message: ${data.message}
      `;
    } else if (formType === "quranRequest") {
      emailSubject = "New Quran Request";
      emailBody = `
        Name: ${data.name}
        Email: ${data.email}
        Address: ${data.address}, ${data.city}, ${data.state} ${data.zip}
      `;
    } else {
      console.warn("Invalid form type received:", formType); // Log invalid type
      return new Response(JSON.stringify({ error: "Invalid form type" }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    console.log("Attempting to send email with subject:", emailSubject); // Log before sending

    const { data: resendData, error } = await resend.emails.send({
      from: 'onboarding@resend.dev', // IMPORTANT: This needs to be a verified domain in your Resend account.
      to: toEmail,
      subject: emailSubject,
      html: `<pre>${emailBody}</pre>`,
    });

    if (error) {
      console.error("Resend error:", error); // Log Resend specific errors
      return new Response(JSON.stringify({ error: error.message }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    console.log("Email sent successfully:", resendData); // Log success
    return new Response(JSON.stringify({ message: "Email sent successfully!", data: resendData }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error("Function error (caught):", error); // Log any caught errors
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});