import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, parse } from "date-fns"; // Import parse
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { showError } from "@/utils/toast";

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

interface IqamahTime {
  prayer_name: string;
  iqamah_time: string;
}

// Helper function to format 24-hour time to 12-hour with AM/PM
const formatTimeForDisplay = (time24h: string): string => {
  if (!time24h) return "N/A";

  // Check if it looks like a time string (HH:MM)
  const timeRegex = /^\d{2}:\d{2}$/;
  if (timeRegex.test(time24h)) {
    try {
      // Parse the time string. We need a reference date, but only the time part matters.
      const parsedTime = parse(time24h, 'HH:mm', new Date());
      // Check if parsing was successful and it's a valid date
      if (!isNaN(parsedTime.getTime())) {
        return format(parsedTime, 'hh:mm a'); // Format to 12-hour with AM/PM
      }
    } catch (e) {
      // Fallback if parsing fails
      console.warn("Failed to parse time:", time24h, e);
    }
  }
  // If not a valid time string or parsing failed, return original
  return time24h;
};

const fetchPrayerTimesAndIqamah = async (): Promise<{
  apiTimes: PrayerTimesData;
  iqamahTimes: Record<string, string>;
}> => {
  const [apiResponse, iqamahResponse] = await Promise.all([
    fetch("https://api.aladhan.com/v1/timingsByCity?city=Evansville&country=US&method=2"), // Method 2 is ISNA
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

const PrayerTimes = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["prayerTimesAndIqamah"],
    queryFn: fetchPrayerTimesAndIqamah,
    staleTime: 1000 * 60 * 60 * 12, // Data considered fresh for 12 hours
    refetchOnWindowFocus: false,
  });

  const prayerOrder = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Daily Prayer Times</h1>

      {isLoading && (
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <Skeleton className="h-6 w-3/4 mb-2" />
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead><Skeleton className="h-4 w-20" /></TableHead>
                  <TableHead><Skeleton className="h-4 w-20" /></TableHead>
                  <TableHead><Skeleton className="h-4 w-20" /></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {prayerOrder.map((prayer) => (
                  <TableRow key={prayer}>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
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
            Date: {data.apiTimes.data.date.readable} ({data.apiTimes.data.date.hijri.date} Hijri)
          </p>
          <Card className="w-full max-w-md mx-auto">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Prayer</TableHead>
                    <TableHead>Adhan</TableHead>
                    <TableHead>Iqamah</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {prayerOrder.map((prayer) => (
                    <TableRow key={prayer}>
                      <TableCell className="font-medium">{prayer}</TableCell>
                      <TableCell>{data.apiTimes.data.timings[prayer as keyof typeof data.apiTimes.data.timings]}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatTimeForDisplay(data.iqamahTimes[prayer] || "N/A")}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          <p className="text-center text-xl font-medium mt-8 text-gray-700 dark:text-gray-300">
            Jumu'ah: {formatTimeForDisplay(data.iqamahTimes["Jumuah"] || "N/A")}
          </p>
          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
            Prayer times are calculated for Evansville, US using the ISNA method.
          </p>
        </>
      )}
    </div>
  );
};

export default PrayerTimes;