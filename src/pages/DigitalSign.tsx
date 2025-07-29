import React, { useState, useEffect, useCallback, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, parseISO, parse, addDays, differenceInSeconds } from "date-fns";
import { toZonedTime, formatInTimeZone } from 'date-fns-tz';
import { supabase } from "@/integrations/supabase/client";
import { showError } from "@/utils/toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNextPrayerCountdown } from "@/hooks/useNextPrayerCountdown";
import AdhanReminder from "@/components/AdhanReminder";
import WhatsAppQRSection from "@/components/WhatsAppQRSection";
import DigitalSignAnnouncementCard from "@/components/DigitalSignAnnouncementCard";
import { Button } from "@/components/ui/button"; // Import Button

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
      Lastthird:
string;
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

// Define specific types for each kind of view item
interface BaseViewItem {
  id: string;
  title: string;
  component: 'PrayerTimesView' | 'UpcomingEventsView' | 'WhatsAppQRView';
  show: boolean;
}

interface AnnouncementViewItem {
  id: string; // e.g., `announcement-${announcement.id}`
  title: string;
  component: 'AnnouncementView';
  data: Announcement; // Specific data for announcements
  show: boolean;
}

// Union type for all possible view items
type DigitalSignViewItem =
  | BaseViewItem
  | AnnouncementViewItem;


const DigitalSign = () => {
  const [currentViewIndex, setCurrentViewIndex] = useState(0);
  const [showAdhanReminder, setShowAdhanReminder] = useState(false);
  const [reminderPrayerName, setReminderPrayerName] = useState<string | null>(null);
  const [reminderText, setReminderText] = useState<string>(""); // New state for reminder text
  const [lastReminded10MinPrayerName, setLastReminded10MinPrayerName] = useState<string | null>(null); // To prevent repeated 10-min reminders
  const [lastReminded1HourPrayerName, setLastReminded1HourPrayerName] = useState<string | null>(null); // To prevent repeated 1-hour reminders

  const adhanAudioRef = useRef<HTMLAudioElement | null>(null);
  const [lastPlayedExactAdhanPrayer, setLastPlayedExactAdhanPrayer] = useState<string | null>(null);

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
  const { nextAdhanInfo, oneHourBeforeAdhanInfo } = useNextPrayerCountdown(prayerData?.apiTimes.data);

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

  // Dynamically define the views to rotate through
  const views: DigitalSignViewItem[] = React.useMemo(() => {
    const baseViews: BaseViewItem[] = [
      { id: 'prayerTimes', title: 'Prayer Times', component: 'PrayerTimesView' as const, show: true },
      { id: 'upcomingEvents', title: 'Upcoming Events', component: 'UpcomingEventsView' as const, show: upcomingEvents && upcomingEvents.length > 0 },
      { id: 'whatsappQRs', title: 'Connect with Our Community', component: 'WhatsAppQRView' as const, show: true },
    ].filter(view => view.show);

    const announcementViews: AnnouncementViewItem[] = (settings && announcements && settings.max_announcements > 0)
      ? announcements.slice(0, settings.max_announcements).map((announcement, index) => ({
          id: `announcement-${announcement.id}`,
          title: `Announcement ${index + 1}`, // Or announcement.title if preferred
          component: 'AnnouncementView' as const,
          data: announcement, // Pass the full announcement object
          show: true,
        }))
      : [];

    return [...baseViews, ...announcementViews];
  }, [settings, announcements, upcomingEvents]);

  // Effect to reset currentViewIndex if the number of views changes
  useEffect(() => {
    setCurrentViewIndex(0);
  }, [views.length]);


  // Effect to initialize audio and handle 'ended' event
  useEffect(() => {
    if (!adhanAudioRef.current) {
      adhanAudioRef.current = new Audio('/adhan.mp3');
      adhanAudioRef.current.volume = 0.8; // Set a default volume
    }

    const handleAudioEnded = () => {
      // Only close the reminder if it was for the exact Adhan playback
      if (reminderText === "Adhan is now!") {
        setShowAdhanReminder(false);
        setReminderPrayerName(null);
        setReminderText("");
      }
    };

    // Add event listener only once
    adhanAudioRef.current.addEventListener('ended', handleAudioEnded);

    return () => {
      // Clean up event listener
      adhanAudioRef.current?.removeEventListener('ended', handleAudioEnded);
      // No need to pause/nullify here, as the ref persists.
    };
  }, [reminderText]); // Dependency on reminderText to ensure the `handleAudioEnded` closure is up-to-date with `reminderText` state.

  // Main effect for countdowns and reminders
  useEffect(() => {
    const now = toZonedTime(new Date(), TIMEZONE);

    // Logic for 1-hour reminder
    if (oneHourBeforeAdhanInfo) {
      const diffInSeconds = differenceInSeconds(oneHourBeforeAdhanInfo.time, now);
      if (diffInSeconds <= 0 && diffInSeconds > -60 && oneHourBeforeAdhanInfo.name !== lastReminded1HourPrayerName) {
        setShowAdhanReminder(true);
        setReminderPrayerName(oneHourBeforeAdhanInfo.name);
        setReminderText("in 1 Hour!");
        setLastReminded1HourPrayerName(oneHourBeforeAdhanInfo.name);
        setTimeout(() => {
          // Only close if the current reminder is still the "in 1 Hour!" one
          if (reminderText === "in 1 Hour!") {
            setShowAdhanReminder(false);
            setReminderPrayerName(null);
            setReminderText("");
          }
        }, 30000); // Dismiss after 30 seconds
        return;
      } else if (diffInSeconds < -60 && oneHourBeforeAdhanInfo.name === lastReminded1HourPrayerName) {
        setLastReminded1HourPrayerName(null);
      }
    }

    // Logic for 10-minute reminder
    if (nextAdhanInfo) {
      const diffInSeconds = differenceInSeconds(nextAdhanInfo.time, now);
      if (diffInSeconds <= 600 && diffInSeconds > 0 && nextAdhanInfo.name !== lastReminded10MinPrayerName) {
        setShowAdhanReminder(true);
        setReminderPrayerName(nextAdhanInfo.name);
        setReminderText("in 10 Minutes!");
        setLastReminded10MinPrayerName(nextAdhanInfo.name);
        setTimeout(() => {
          // Only close if the current reminder is still the "in 10 Minutes!" one
          if (reminderText === "in 10 Minutes!") {
            setShowAdhanReminder(false);
            setReminderPrayerName(null);
            setReminderText("");
          }
        }, 30000); // Dismiss after 30 seconds
        return;
      } else if (diffInSeconds <= 0 && nextAdhanInfo.name === lastReminded10MinPrayerName) {
        setLastReminded10MinPrayerName(null);
      }
    }

    // Logic for exact Adhan playback and reminder
    if (nextAdhanInfo && nextAdhanInfo.name !== "Jumuah") {
      const diffInSeconds = differenceInSeconds(nextAdhanInfo.time, now);
      if (diffInSeconds <= 0 && diffInSeconds > -5 && nextAdhanInfo.name !== lastPlayedExactAdhanPrayer) {
        if (adhanAudioRef.current) {
          adhanAudioRef.current.pause();
          adhanAudioRef.current.currentTime = 0;

          adhanAudioRef.current.play().catch(e => console.error("Error playing Adhan audio:", e));
          setShowAdhanReminder(true);
          setReminderPrayerName(nextAdhanInfo.name);
          setReminderText("Adhan is now!");
          setLastPlayedExactAdhanPrayer(nextAdhanInfo.name);

          // Set a timeout to dismiss the "Adhan is now!" reminder after 4 minutes and 31 seconds (271,000 ms)
          setTimeout(() => {
            if (reminderText === "Adhan is now!") { // Ensure we're dismissing the correct reminder
              setShowAdhanReminder(false);
              setReminderPrayerName(null);
              setReminderText("");
            }
          }, 271000); // Dismiss after 4 minutes and 31 seconds
        }
      } else if (diffInSeconds < -5 && nextAdhanInfo.name === lastPlayedExactAdhanPrayer) {
        setLastPlayedExactAdhanPrayer(null);
      }
    }
  }, [nextAdhanInfo, oneHourBeforeAdhanInfo, lastReminded10MinPrayerName, lastReminded1HourPrayerName, lastPlayedExactAdhanPrayer, reminderText]); // Add reminderText to dependencies for the setTimeout check

  // Effect for automatic view rotation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (!showAdhanReminder && views.length > 0) { // Only rotate if reminder is not showing and there are views
      const intervalTime = (settings?.rotation_interval_seconds && settings.rotation_interval_seconds >= 5)
        ? settings.rotation_interval_seconds * 1000
        : 15000; // Default to 15 seconds

      interval = setInterval(() => {
        setCurrentViewIndex((prevIndex) => (prevIndex + 1) % views.length);
      }, intervalTime);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [settings, views.length, showAdhanReminder]); // Re-run if settings, number of active views, or reminder state changes

  if (prayerError) {
    showError("Error loading prayer times for sign: " + prayerError.message);
  }
  if (announcementsError) {
    showError("Error loading announcements for sign: " + announcementsError.message);
  }
  if (settingsError) {
    showError("Error loading digital sign settings: " + settingsError.message);
  }

  const currentView = views[currentViewIndex];

  return (
    <div className="min-h-screen w-screen flex flex-col bg-gray-900 text-white p-6 font-sans overflow-hidden">
      {showAdhanReminder && reminderPrayerName && (
        <AdhanReminder prayerName={reminderPrayerName} timeRemainingText={reminderText} onClose={() => setShowAdhanReminder(false)} />
      )}

      {/* Dynamic Title for the current section */}
      <h2 className="text-8xl font-bold mb-10 text-primary-foreground text-center">
        {currentView?.title || 'Loading...'}
      </h2>

      {/* Main Content Area */}
      <div className="flex-grow flex flex-col items-center justify-center relative">
        {currentView?.component === 'PrayerTimesView' && (
          <div key="prayer-times-view" className="absolute inset-0 flex flex-col items-center justify-center bg-gray-800 rounded-lg p-10 shadow-lg animate-fade-in">
            {isLoadingPrayer ? (
              <div className="space-y-10 w-full max-w-3xl">
                {[...Array(6)].map((_, i) => (
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
                  <span className="text-6xl font-bold text-gray-400 text-left">Prayer</span>
                  <span className="text-6xl font-bold text-gray-400 text-center">Adhan</span>
                  <span className="text-6xl font-bold text-gray-400 text-right">Iqamah</span>
                </div>
                {/* Prayer Rows */}
                {prayerOrder.map((prayer) => (
                  <div key={prayer} className="grid grid-cols-3 gap-8 py-6 border-b border-gray-700 last:border-b-0">
                    <span className="text-7xl font-semibold text-gray-200 text-left">{prayer}</span>
                    <span className="text-6xl text-gray-400 text-center">
                      {/* For Jumuah, Adhan time is not applicable from API, so display N/A or empty */}
                      {prayer === "Jumuah" ? "N/A" : formatTimeForDisplay(prayerData.apiTimes.data.timings[prayer as keyof typeof prayerData.apiTimes.data.timings])}
                    </span>
                    <span className="text-7xl font-bold text-primary-foreground text-right">
                      {formatTimeForDisplay(prayerData.iqamahTimes[prayer] || "N/A")}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-5xl text-red-400">Failed to load prayer times.</p>
            )}
          </div>
        )}

        {currentView?.component === 'AnnouncementView' && settings && (currentView as AnnouncementViewItem).data && (
          <div key={currentView.id} className="absolute inset-0 flex flex-col bg-gray-800 rounded-lg p-8 shadow-lg animate-fade-in">
            {isLoadingAnnouncements || isLoadingSettings ? (
              <div className="space-y-10 flex-grow flex flex-col justify-center">
                <Skeleton className="h-16 w-3/4 mx-auto bg-gray-700" />
                <Skeleton className="h-64 w-full bg-gray-700" />
                <Skeleton className="h-12 w-1/2 mx-auto bg-gray-700" />
              </div>
            ) : (
              <DigitalSignAnnouncementCard announcement={(currentView as AnnouncementViewItem).data} settings={settings} />
            )}
          </div>
        )}

        {currentView?.component === 'UpcomingEventsView' && currentView.show && (
          <div key="upcoming-events-view" className="absolute inset-0 flex flex-col bg-gray-800 rounded-lg p-10 shadow-lg animate-fade-in">
            {isLoadingEvents ? (
              <div className="space-y-10 flex-grow flex flex-col justify-center">
                <Skeleton className="h-16 w-3/4 mx-auto bg-gray-700" />
                <Skeleton className="h-12 w-full bg-gray-700" />
                <Skeleton className="h-12 w-full bg-gray-700" />
                <Skeleton className="h-12 w-1/2 mx-auto bg-gray-700" />
              </div>
            ) : upcomingEvents && upcomingEvents.length > 0 ? (
              <div className="flex-grow flex flex-col justify-center space-y-12 overflow-y-auto"> {/* Increased space-y */}
                {upcomingEvents.slice(0, 5).map((event) => ( // Display top 5 events
                  <Card key={event.id} className="bg-gray-700 text-white p-8 rounded-lg shadow-md"> {/* Increased padding */}
                    <CardHeader className="p-0 mb-6"> {/* Increased mb */}
                      <CardTitle className="text-6xl font-semibold text-primary-foreground">{event.title}</CardTitle> {/* Increased font size */}
                      <p className="text-4xl text-gray-300"> {/* Increased font size */}
                        {format(parseISO(event.start), 'MMM dd, yyyy hh:mm a')}
                        {event.end && ` - ${format(parseISO(event.end), 'hh:mm a')}`}
                      </p>
                    </CardHeader>
                    <CardContent className="p-0 text-4xl text-gray-400"> {/* Increased font size */}
                      {event.description && <p className="mb-6 line-clamp-3">{event.description}</p>} {/* Increased mb and line-clamp */}
                      {event.location && <p className="font-medium">Location: {event.location}</p>}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-5xl text-center text-gray-400 flex-grow flex items-center justify-center">
                No upcoming events to display.
              </p>
            )}
          </div>
        )}

        {currentView?.component === 'WhatsAppQRView' && currentView.show && (
          <div key="whatsapp-qr-view" className="absolute inset-0 flex flex-col items-center justify-center bg-gray-800 rounded-lg p-10 shadow-lg animate-fade-in">
            <WhatsAppQRSection
              communityQrUrl="/community-linktree-qr.png"
            />
          </div>
        )}
      </div>

      {/* Footer Section with Next Prayer Countdown */}
      <div className="text-center mt-12 text-4xl text-gray-400">
        {nextAdhanInfo && (
          <p className="text-8xl font-bold text-accent mb-6">
            {nextAdhanInfo.name} at {nextAdhanInfo.formattedTime}
          </p>
        )}
        {nextAdhanInfo && (
          <p className="text-8xl font-extrabold text-primary-foreground">
            {nextAdhanInfo.countdown}
          </p>
        )}
        <p className="mt-4 text-4xl">www.isevv.org</p>
      </div>
    </div>
  );
};

export default DigitalSign;