import React, { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, parseISO, parse, addDays } from "date-fns";
import { toZonedTime, formatInTimeZone } from 'date-fns-tz';
import { supabase } from "@/integrations/supabase/client";
import { showError } from "@/utils/toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNextPrayerCountdown } from "@/hooks/useNextPrayerCountdown"; // New import

interface PrayerTimesData {
  code: number;
  status: string;
  data: {
    timings: {
      Fajr: string;
      Sunrise: string;
      Dhuhr: string;
      Asr: string;
      Maghrib: string;
      Isha: string;
      Imsak: string;
      Midnight: string;
      Firstthird: string;
      Lastthird: string;
    };
    date: {
      readable: string;
      gregorian: {
        date: string;
        format: string;
        day: string;
        weekday: { en: string };
        month: { number: number; en: string };
        year: string;
        designation: { abbreviated: string; expanded: string };
      };
      hijri: {
        date: string;
        format: string;
        day: string;
        weekday: { en: string; ar: string };
        month: { number: number; en: string; ar: string };
        year: string;
        designation: { abbreviated: string; expanded: string };
        holidays: string[];
      };
    };
    meta: any; // Simplified for brevity
  };
}

interface IqamahTime {
  prayer_name: string;
  iqamah_time: string;
}

interface Announcement {
  id: string;
  title: string;
  description: string;
  announcement_date: string; // ISO date string
  image_url?: string;
  is_active: boolean;
  posted_at?: string;
}

interface DigitalSignSettings {
  id: string;
  max_announcements: number;
  show_descriptions: boolean;
  show_images: boolean;
  rotation_interval_seconds: number; // New field
}

interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start: string; // ISO date string
  end: string;   // ISO date string
  location?: string;
  htmlLink: string;
  calendarId: string;
}

const TIMEZONE = 'America/Chicago'; // Define the timezone for Evansville

// Google Calendar IDs
const YOUTH_CALENDAR_ID = '199d2363fbb2b1354d629ab458ba807ac16afc63f329f647449011f4c60e41b2@group.calendar.google.com';
const COMMUNITY_CALENDAR_ID = '464ad63344b9b7c026adb7ee76c370b95864259cac908d685142e8571291449c@group.calendar.google.com';

// Helper function to format 24-hour time to 12-hour with AM/PM
const formatTimeForDisplay = (time24h: string): string => {
  if (!time24h || time24h === "N/A") return "N/A";
  const timeRegex = /^\d{2}:\d{2}$/;
  if (timeRegex.test(time24h)) {
    try {
      const parsedTime = parse(time24h, 'HH:mm', new Date());
      if (!isNaN(parsedTime.getTime())) {
        return format(parsedTime, 'hh:mm a');
      }
    } catch (e) {
      console.warn("Failed to parse time:", time24h, e);
    }
  }
  return time24h;
};

const fetchPrayerTimesAndIqamah = async (): Promise<{
  apiTimes: PrayerTimesData;
  iqamahTimes: Record<string, string>;
}> => {
  const [apiResponse, iqamahResponse] = await Promise.all([
    fetch("https://api.aladhan.com/v1/timingsByCity?city=Evansville&country=US&method=2"),
    supabase.from("iqamah_times").select("*"),
  ]);

  if (!apiResponse.ok) {
    throw new Error("Failed to fetch prayer times from external API");
  }
  const apiData: PrayerTimesData = await apiResponse.json();

  if (iqamahResponse.error) {
    throw new Error("Failed to fetch iqamah times from database: " + iqamahResponse.error.message);
  }

  const iqamahTimesMap: Record<string, string> = {};
  iqamahResponse.data.forEach((item: IqamahTime) => {
    iqamahTimesMap[item.prayer_name] = item.iqamah_time;
  });

  return { apiTimes: apiData, iqamahTimes: iqamahTimesMap };
};

const fetchDigitalSignSettings = async (): Promise<DigitalSignSettings> => {
  const { data, error } = await supabase
    .from("digital_sign_settings")
    .select("*")
    .single();

  if (error) {
    // If settings don't exist, return defaults
    console.warn("Digital sign settings not found, using defaults:", error.message);
    return { id: '00000000-0000-0000-0000-000000000001', max_announcements: 3, show_descriptions: true, show_images: true, rotation_interval_seconds: 15 };
  }
  return data;
};

const fetchActiveAnnouncements = async (limit: number): Promise<Announcement[]> => {
  if (limit <= 0) return []; // If limit is 0 or less, return empty array

  const { data, error } = await supabase
    .from("announcements")
    .select("*")
    .eq("is_active", true)
    .order("posted_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error("Error fetching announcements: " + error.message);
  }
  return data || [];
};

const fetchUpcomingEvents = async (): Promise<CalendarEvent[]> => {
  const { data, error } = await supabase.functions.invoke('fetch-calendar-events', {
    body: { calendarIds: [YOUTH_CALENDAR_ID, COMMUNITY_CALENDAR_ID] },
  });

  if (error) {
    throw new Error("Error fetching upcoming events: " + error.message);
  }
  return data.events || [];
};

const DigitalSign = () => {
  const [currentViewIndex, setCurrentViewIndex] = useState(0);

  const { data: settings, isLoading: isLoadingSettings, error: settingsError } = useQuery<DigitalSignSettings, Error>({
    queryKey: ["digitalSignSettings"],
    queryFn: fetchDigitalSignSettings,
    staleTime: 1000 * 60 * 5, // Settings considered fresh for 5 minutes
    refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes
    refetchOnWindowFocus: false,
  });

  const { data: prayerData, isLoading: isLoadingPrayer, error: prayerError } = useQuery({
    queryKey: ["prayerTimesAndIqamah"],
    queryFn: fetchPrayerTimesAndIqamah,
    staleTime: 1000 * 60 * 60 * 12, // Data considered fresh for 12 hours
    refetchInterval: 1000 * 60 * 60, // Refetch every hour
    refetchOnWindowFocus: false,
  });

  const { data: announcements, isLoading: isLoadingAnnouncements, error: announcementsError } = useQuery({
    queryKey: ["activeAnnouncements", settings?.max_announcements], // Depend on settings for limit
    queryFn: () => fetchActiveAnnouncements(settings?.max_announcements || 0),
    enabled: !!settings, // Only run if settings are loaded
    staleTime: 1000 * 60 * 5, // Data considered fresh for 5 minutes
    refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes
    refetchOnWindowFocus: false,
  });

  const { data: upcomingEvents, isLoading: isLoadingEvents, error: eventsError } = useQuery<CalendarEvent[], Error>({
    queryKey: ["upcomingEvents"],
    queryFn: fetchUpcomingEvents,
    staleTime: 1000 * 60 * 10, // Events considered fresh for 10 minutes
    refetchInterval: 1000 * 60 * 10, // Refetch every 10 minutes
    refetchOnWindowFocus: false,
  });

  // Use the new hook for next prayer countdown
  const nextPrayer = useNextPrayerCountdown(prayerData?.apiTimes.data, prayerData?.iqamahTimes);

  // Log events data and errors for debugging
  useEffect(() => {
    if (upcomingEvents) {
      console.log("Upcoming Events Data:", upcomingEvents);
    }
    if (eventsError) {
      console.error("Upcoming Events Error:", eventsError);
    }
  }, [upcomingEvents, eventsError]);


  const prayerOrder = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha", "Jumuah"];

  // Define the views to rotate through
  const views = [
    { id: 'prayerTimes', title: 'Prayer Times', component: 'PrayerTimesView', show: true },
    { id: 'announcements', title: 'Announcements', component: 'AnnouncementsView', show: settings && settings.max_announcements > 0 && announcements && announcements.length > 0 },
    { id: 'upcomingEvents', title: 'Upcoming Events', component: 'UpcomingEventsView', show: upcomingEvents && upcomingEvents.length > 0 },
  ].filter(view => view.show); // Filter out views that shouldn't be shown

  // Effect for automatic view rotation
  useEffect(() => {
    if (views.length === 0) return; // No views to rotate

    const intervalTime = (settings?.rotation_interval_seconds && settings.rotation_interval_seconds >= 5)
      ? settings.rotation_interval_seconds * 1000
      : 15000; // Default to 15 seconds

    const interval = setInterval(() => {
      setCurrentViewIndex((prevIndex) => (prevIndex + 1) % views.length);
    }, intervalTime);

    return () => clearInterval(interval);
  }, [settings, views.length]); // Re-run if settings or number of active views changes

  if (prayerError) {
    showError("Error loading prayer times for sign: " + prayerError.message);
  }
  if (announcementsError) {
    showError("Error loading announcements for sign: " + announcementsError.message);
  }
  if (settingsError) {
    showError("Error loading digital sign settings: " + settingsError.message);
  }

  const currentView = views[currentViewIndex]?.id;

  return (
    <div className="min-h-screen w-screen flex flex-col bg-gray-900 text-white p-8 font-sans overflow-hidden">
      {/* Dynamic Title for the current section */}
      <h2 className="text-6xl font-bold mb-8 text-primary-foreground text-center">
        {views[currentViewIndex]?.title || 'Loading...'}
      </h2>

      {/* Main Content Area */}
      <div className="flex-grow flex flex-col items-center justify-center relative">
        {currentView === 'prayerTimes' && (
          <div key="prayer-times-view" className="absolute inset-0 flex flex-col items-center justify-center bg-gray-800 rounded-lg p-10 shadow-lg animate-fade-in">
            {isLoadingPrayer ? (
              <div className="space-y-10 w-full max-w-3xl">
                {[...Array(6)].map((_, i) => ( // Increased skeleton count for Jumuah
                  <div key={i} className="grid grid-cols-3 gap-10 items-center">
                    <Skeleton className="h-20 w-full bg-gray-700" />
                    <Skeleton className="h-20 w-full bg-gray-700" />
                    <Skeleton className="h-20 w-full bg-gray-700" />
                  </div>
                ))}
              </div>
            ) : prayerData ? (
              <div className="w-full max-w-3xl">
                {/* Table Header (Implicit) */}
                <div className="grid grid-cols-3 gap-8 pb-4 border-b-4 border-gray-600 mb-6">
                  <span className="text-4xl font-bold text-gray-400 text-left">Prayer</span>
                  <span className="text-4xl font-bold text-gray-400 text-center">Adhan</span>
                  <span className="text-4xl font-bold text-gray-400 text-right">Iqamah</span>
                </div>
                {/* Prayer Rows */}
                {prayerOrder.map((prayer) => (
                  <div key={prayer} className="grid grid-cols-3 gap-8 py-6 border-b border-gray-700 last:border-b-0">
                    <span className="text-5xl font-semibold text-gray-200 text-left">{prayer}</span>
                    <span className="text-4xl text-gray-400 text-center">
                      {/* For Jumuah, Adhan time is not applicable from API, so display N/A or empty */}
                      {prayer === "Jumuah" ? "N/A" : formatTimeForDisplay(prayerData.apiTimes.data.timings[prayer as keyof typeof prayerData.apiTimes.data.timings])}
                    </span>
                    <span className="text-5xl font-bold text-primary-foreground text-right">
                      {formatTimeForDisplay(prayerData.iqamahTimes[prayer] || "N/A")}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-4xl text-red-400">Failed to load prayer times.</p>
            )}
          </div>
        )}

        {currentView === 'announcements' && views[currentViewIndex]?.show && (
          <div key="announcements-view" className="absolute inset-0 flex flex-col bg-gray-800 rounded-lg p-10 shadow-lg animate-fade-in">
            {isLoadingAnnouncements || isLoadingSettings ? (
              <div className="space-y-10 flex-grow flex flex-col justify-center">
                <Skeleton className="h-16 w-3/4 mx-auto bg-gray-700" />
                <Skeleton className="h-64 w-full bg-gray-700" />
                <Skeleton className="h-12 w-1/2 mx-auto bg-gray-700" />
              </div>
            ) : announcements && announcements.length > 0 ? (
              <div className="flex-grow flex flex-col justify-center space-y-8">
                {announcements.map((announcement, index) => (
                  <div key={announcement.id} className="text-center">
                    <h3 className="text-5xl font-semibold text-gray-100 mb-4">{announcement.title}</h3>
                    {settings?.show_descriptions && (
                      <p className="text-3xl text-gray-300 mb-6">{announcement.description}</p>
                    )}
                    {settings?.show_images && announcement.image_url && (
                      <div className="w-full h-[300px] overflow-hidden rounded-md mx-auto mb-4 flex items-center justify-center">
                        <img src={announcement.image_url} alt={announcement.title} className="max-w-full max-h-full object-contain" />
                      </div>
                    )}
                    <p className="text-2xl text-gray-400">
                      {format(parseISO(announcement.announcement_date), "PPP")}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-4xl text-center text-gray-400 flex-grow flex items-center justify-center">
                No active announcements to display.
              </p>
            )}
          </div>
        )}

        {currentView === 'upcomingEvents' && views[currentViewIndex]?.show && (
          <div key="upcoming-events-view" className="absolute inset-0 flex flex-col bg-gray-800 rounded-lg p-10 shadow-lg animate-fade-in">
            {isLoadingEvents ? (
              <div className="space-y-10 flex-grow flex flex-col justify-center">
                <Skeleton className="h-16 w-3/4 mx-auto bg-gray-700" />
                <Skeleton className="h-12 w-full bg-gray-700" />
                <Skeleton className="h-12 w-full bg-gray-700" />
                <Skeleton className="h-12 w-1/2 mx-auto bg-gray-700" />
              </div>
            ) : upcomingEvents && upcomingEvents.length > 0 ? (
              <div className="flex-grow flex flex-col justify-center space-y-6 overflow-y-auto">
                {upcomingEvents.slice(0, 5).map((event) => ( // Display top 5 events
                  <Card key={event.id} className="bg-gray-700 text-white p-5 rounded-lg shadow-md">
                    <CardHeader className="p-0 mb-1">
                      <CardTitle className="text-3xl font-semibold text-primary-foreground">{event.title}</CardTitle>
                      <p className="text-xl text-gray-300">
                        {format(parseISO(event.start), 'MMM dd, yyyy hh:mm a')}
                        {event.end && ` - ${format(parseISO(event.end), 'hh:mm a')}`}
                      </p>
                    </CardHeader>
                    <CardContent className="p-0 text-xl text-gray-400">
                      {event.description && <p className="mb-1 line-clamp-2">{event.description}</p>}
                      {event.location && <p className="font-medium">Location: {event.location}</p>}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-4xl text-center text-gray-400 flex-grow flex items-center justify-center">
                No upcoming events to display.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Footer Section with Next Prayer Countdown */}
      <div className="text-center mt-8 text-3xl text-gray-400">
        {nextPrayer && (
          <p className="text-6xl font-bold text-accent mb-2"> {/* Changed to text-6xl */}
            Next Prayer: {nextPrayer.name} at {nextPrayer.formattedTime}
          </p>
        )}
        {nextPrayer && (
          <p className="text-6xl font-extrabold text-primary-foreground">
            Time Until: {nextPrayer.countdown}
          </p>
        )}
        <p className="mt-2">www.isevv.org</p>
      </div>
    </div>
  );
};

export default DigitalSign;