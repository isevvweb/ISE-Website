// @ts-ignore
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
// @ts-ignore
import { Resend } from "https://esm.sh/resend@1.1.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { formType, data } = await req.json();
    // @ts-ignore
    const resend = new Resend(Deno.env.get('RESEND_API_KEY'));

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
      return new Response(JSON.stringify({ error: "Invalid form type" }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const { data: resendData, error } = await resend.emails.send({
      from: 'onboarding@resend.dev', // Replace with your verified Resend domain email
      to: toEmail,
      subject: emailSubject,
      html: `<pre>${emailBody}</pre>`, // Using pre for simple text formatting
    });

    if (error) {
      console.error("Resend error:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    return new Response(JSON.stringify({ message: "Email sent successfully!", data: resendData }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error("Function error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});