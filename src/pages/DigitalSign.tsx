import React from "react";
import { useQuery } from "@tanstack/react-query";
import { format, parseISO, parse } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { showError } from "@/utils/toast";
import { Skeleton } from "@/components/ui/skeleton";

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

const fetchActiveAnnouncements = async (): Promise<Announcement[]> => {
  const { data, error } = await supabase
    .from("announcements")
    .select("*")
    .eq("is_active", true)
    .order("posted_at", { ascending: false })
    .limit(3); // Limit to a few recent announcements for the sign

  if (error) {
    throw new Error("Error fetching announcements: " + error.message);
  }
  return data || [];
};

const DigitalSign = () => {
  const { data: prayerData, isLoading: isLoadingPrayer, error: prayerError } = useQuery({
    queryKey: ["prayerTimesAndIqamah"],
    queryFn: fetchPrayerTimesAndIqamah,
    staleTime: 1000 * 60 * 60 * 12, // Data considered fresh for 12 hours
    refetchInterval: 1000 * 60 * 60, // Refetch every hour
    refetchOnWindowFocus: false,
  });

  const { data: announcements, isLoading: isLoadingAnnouncements, error: announcementsError } = useQuery({
    queryKey: ["activeAnnouncements"],
    queryFn: fetchActiveAnnouncements,
    staleTime: 1000 * 60 * 5, // Data considered fresh for 5 minutes
    refetchInterval: 1000 * 60 * 5, // Refetch every 5 minutes
    refetchOnWindowFocus: false,
  });

  const prayerOrder = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];

  if (prayerError) {
    showError("Error loading prayer times for sign: " + prayerError.message);
  }
  if (announcementsError) {
    showError("Error loading announcements for sign: " + announcementsError.message);
  }

  return (
    <div className="min-h-screen w-screen flex flex-col bg-gray-900 text-white p-8 font-sans overflow-hidden">
      {/* Header Section */}
      <div className="text-center mb-8">
        <h1 className="text-6xl font-extrabold text-primary-foreground leading-tight">
          Islamic Society of Evansville
        </h1>
        <p className="text-3xl text-gray-300 mt-2">
          {prayerData?.apiTimes.data.date.readable} ({prayerData?.apiTimes.data.date.hijri.date} Hijri)
        </p>
      </div>

      {/* Main Content Area */}
      <div className="flex-grow grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Prayer Times Section */}
        <div className="flex flex-col items-center justify-center bg-gray-800 rounded-lg p-6 shadow-lg">
          <h2 className="text-5xl font-bold mb-6 text-primary-foreground">Prayer Times</h2>
          {isLoadingPrayer ? (
            <div className="space-y-4 w-full max-w-md">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex justify-between items-center">
                  <Skeleton className="h-10 w-32 bg-gray-700" />
                  <Skeleton className="h-10 w-24 bg-gray-700" />
                  <Skeleton className="h-10 w-24 bg-gray-700" />
                </div>
              ))}
            </div>
          ) : prayerData ? (
            <div className="w-full max-w-md">
              {prayerOrder.map((prayer) => (
                <div key={prayer} className="flex justify-between items-center py-3 border-b border-gray-700 last:border-b-0">
                  <span className="text-4xl font-semibold text-gray-200">{prayer}</span>
                  <span className="text-3xl text-gray-400">
                    {formatTimeForDisplay(prayerData.apiTimes.data.timings[prayer as keyof typeof prayerData.apiTimes.data.timings])}
                  </span>
                  <span className="text-3xl font-medium text-primary-foreground">
                    {formatTimeForDisplay(prayerData.iqamahTimes[prayer] || "N/A")}
                  </span>
                </div>
              ))}
              <div className="flex justify-between items-center py-3 mt-4">
                <span className="text-4xl font-semibold text-gray-200">Jumu'ah</span>
                <span className="text-3xl font-medium text-primary-foreground">
                  {formatTimeForDisplay(prayerData.iqamahTimes["Jumuah"] || "N/A")}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-2xl text-red-400">Failed to load prayer times.</p>
          )}
        </div>

        {/* Announcements Section */}
        <div className="flex flex-col bg-gray-800 rounded-lg p-6 shadow-lg">
          <h2 className="text-5xl font-bold mb-6 text-primary-foreground text-center">Announcements</h2>
          {isLoadingAnnouncements ? (
            <div className="space-y-6 flex-grow flex flex-col justify-center">
              <Skeleton className="h-12 w-3/4 mx-auto bg-gray-700" />
              <Skeleton className="h-40 w-full bg-gray-700" />
              <Skeleton className="h-8 w-1/2 mx-auto bg-gray-700" />
            </div>
          ) : announcements && announcements.length > 0 ? (
            <div className="flex-grow flex flex-col justify-center space-y-6">
              {announcements.map((announcement, index) => (
                <div key={announcement.id} className="text-center">
                  <h3 className="text-4xl font-semibold text-gray-100 mb-2">{announcement.title}</h3>
                  <p className="text-2xl text-gray-300 mb-4">{announcement.description}</p>
                  {announcement.image_url && (
                    <div className="w-full max-h-64 overflow-hidden rounded-md mx-auto mb-2">
                      <img src={announcement.image_url} alt={announcement.title} className="w-full h-full object-contain" />
                    </div>
                  )}
                  <p className="text-xl text-gray-400">
                    {format(parseISO(announcement.announcement_date), "PPP")}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-2xl text-center text-gray-400 flex-grow flex items-center justify-center">
              No active announcements at this time.
            </p>
          )}
        </div>
      </div>

      {/* Footer Section */}
      <div className="text-center mt-8 text-2xl text-gray-400">
        <p>Islamic Society of Evansville | 4200 Grimm Road, Newburgh, IN</p>
        <p>www.isevv.org</p>
      </div>
    </div>
  );
};

export default DigitalSign;