import React from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    meta: {
      latitude: number;
      longitude: number;
      timezone: string;
      method: {
        id: number;
        name: string;
        params: { Fajr: number; Isha: number };
        location: { latitude: number; longitude: number };
      };
      latitudeAdjustment: string;
      midnightMode: string;
      school: string;
      offset: {
        Imsak: number;
        Fajr: number;
        Sunrise: number;
        Dhuhr: number;
        Asr: number;
        Maghrib: number;
        Sunset: number;
        Isha: number;
        Midnight: number;
      };
    };
  };
}

const fetchPrayerTimes = async (): Promise<PrayerTimesData> => {
  const response = await fetch(
    "https://api.aladhan.com/v1/timingsByCity?city=Evansville&country=US&method=2" // Method 2 is ISNA
  );
  if (!response.ok) {
    throw new Error("Failed to fetch prayer times");
  }
  return response.json();
};

const PrayerTimes = () => {
  const { data, isLoading, error } = useQuery<PrayerTimesData, Error>({
    queryKey: ["prayerTimes"],
    queryFn: fetchPrayerTimes,
    staleTime: 1000 * 60 * 60 * 12, // Data considered fresh for 12 hours
    refetchOnWindowFocus: false,
  });

  const prayerOrder = ["Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha"];

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Daily Prayer Times</h1>

      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {prayerOrder.map((prayer) => (
            <Card key={prayer}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4 mb-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {error && (
        <div className="text-center text-red-500">
          <p>Error loading prayer times: {error.message}</p>
          <p>Please try again later.</p>
        </div>
      )}

      {data && (
        <>
          <p className="text-center text-lg mb-6">
            Date: {data.data.date.readable} ({data.data.date.hijri.date} Hijri)
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {prayerOrder.map((prayer) => (
              <Card key={prayer} className="flex flex-col items-center justify-center p-4">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl font-semibold">{prayer}</CardTitle>
                </CardHeader>
                <CardContent className="text-3xl font-bold text-primary">
                  {data.data.timings[prayer as keyof typeof data.data.timings]}
                </CardContent>
                <p className="text-sm text-muted-foreground mt-2">
                  Iqamah: <span className="font-medium">To be announced</span>
                </p>
              </Card>
            ))}
          </div>
          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-8">
            Prayer times are calculated for Evansville, US using the ISNA method.
            Iqamah times will be updated from the admin panel.
          </p>
        </>
      )}
    </div>
  );
};

export default PrayerTimes;