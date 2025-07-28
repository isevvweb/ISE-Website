// @ts-nocheck
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log("--- fetch-calendar-events Function Start ---");

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log("Handling OPTIONS request for fetch-calendar-events.");
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Attempting to parse request body.");
    const { calendarIds } = await req.json(); // Expect an array of calendar IDs
    console.log("Received calendar IDs:", calendarIds);

    const googleApiKey = Deno.env.get('GOOGLE_CALENDAR_API_KEY');

    if (!googleApiKey) {
      console.error("Google Calendar API Key not configured in environment variables.");
      throw new Error("Google Calendar API Key not configured.");
    }
    console.log("Google Calendar API Key found.");

    const allEvents: any[] = [];
    const now = new Date();
    const timeMin = now.toISOString(); // Fetch events from now onwards
    console.log("Fetching events from:", timeMin);

    for (const calendarId of calendarIds) {
      const url = `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?key=${googleApiKey}&timeMin=${timeMin}&singleEvents=true&orderBy=startTime&maxResults=10`; // Fetch up to 10 events per calendar
      console.log(`Fetching from Google Calendar API for calendar ID: ${calendarId}`);
      const response = await fetch(url);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Error fetching events from calendar ${calendarId}:`, response.status, errorText);
        throw new Error(`Failed to fetch events from calendar ${calendarId}: ${errorText}`);
      }

      const data = await response.json();
      console.log(`Received ${data.items ? data.items.length : 0} events from calendar ${calendarId}.`);
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
    console.log(`Total ${allEvents.length} events fetched and sorted.`);

    return new Response(JSON.stringify({ events: allEvents }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error: any) {
    console.error("Error in fetch-calendar-events function (caught):", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  } finally {
    console.log("--- fetch-calendar-events Function End ---");
  }
});