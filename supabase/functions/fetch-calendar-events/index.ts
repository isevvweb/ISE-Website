import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

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
    const { calendarIds } = await req.json(); // Expect an array of calendar IDs
    const googleApiKey = Deno.env.get('GOOGLE_CALENDAR_API_KEY');

    if (!googleApiKey) {
      throw new Error("Google Calendar API Key not configured.");
    }

    const allEvents: any[] = [];
    const now = new Date();
    const timeMin = now.toISOString(); // Fetch events from now onwards

    for (const calendarId of calendarIds) {
      const url = `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?key=${googleApiKey}&timeMin=${timeMin}&singleEvents=true&orderBy=startTime&maxResults=10`; // Fetch up to 10 events per calendar
      const response = await fetch(url);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Error fetching events from calendar ${calendarId}:`, errorText);
        throw new Error(`Failed to fetch events from calendar ${calendarId}: ${errorText}`);
      }

      const data = await response.json();
      if (data.items) {
        allEvents.push(...data.items.map((item: any) => ({
          id: item.id,
          title: item.summary,
          description: item.description,
          start: item.start?.dateTime || item.start?.date,
          end: item.end?.dateTime || item.end?.date,
          location: item.location,
          htmlLink: item.htmlLink,
          calendarId: calendarId // Add calendar ID for differentiation if needed
        })));
      }
    }

    // Sort all events by start time
    allEvents.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

    return new Response(JSON.stringify({ events: allEvents }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error: any) {
    console.error("Error in fetch-calendar-events function:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});