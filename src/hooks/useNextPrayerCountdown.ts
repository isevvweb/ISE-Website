import { useState, useEffect, useCallback } from "react";
import { format, parse, isAfter, addDays, differenceInSeconds } from "date-fns";
import { toZonedTime, formatInTimeZone } from 'date-fns-tz';

const TIMEZONE = 'America/Chicago'; // Define the timezone for Evansville

interface PrayerTimesApiData {
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
}

interface IqamahTimeData {
  prayer_name: string;
  iqamah_time: string;
}

interface NextPrayerInfo {
  name: string;
  time: Date; // The actual Date object for the next prayer
  formattedTime: string; // e.g., "05:30 PM"
  countdown: string; // e.g., "01h 30m 15s"
}

const prayerOrder = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha", "Jumuah"];

// Helper to get a Date object for a given time string (HH:mm) for a specific date
const getDateForTime = (timeStr: string, date: Date): Date | null => {
  if (!timeStr || timeStr === "N/A") return null;

  const timeRegex = /^\d{2}:\d{2}$/;
  if (!timeRegex.test(timeStr)) {
    return null; // Only process HH:mm strings here
  }

  try {
    // Combine the date part of 'date' with the time part of 'timeStr'
    const [hours, minutes] = timeStr.split(':').map(Number);
    const newDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), hours, minutes, 0);
    return toZonedTime(newDate, TIMEZONE);
  } catch (e) {
    console.error("Error parsing time string:", timeStr, e);
    return null;
  }
};

export const useNextPrayerCountdown = (
  apiTimes: PrayerTimesApiData | undefined,
  iqamahTimes: Record<string, string> | undefined
) => {
  const [nextPrayer, setNextPrayer] = useState<NextPrayerInfo | null>(null);

  const calculateCountdown = useCallback(() => {
    if (!apiTimes || !iqamahTimes) {
      setNextPrayer(null);
      return;
    }

    const now = toZonedTime(new Date(), TIMEZONE);
    const today = now;
    const tomorrow = addDays(today, 1);

    const potentialNextPrayers: { name: string; time: Date; formattedTime: string }[] = [];

    // Iterate through today's and tomorrow's prayers to find the next one
    for (let i = 0; i < 2; i++) { // 0 for today, 1 for tomorrow
      const currentDay = i === 0 ? today : tomorrow;

      for (const prayerName of prayerOrder) {
        let effectiveTimeStr: string | undefined;

        if (prayerName === "Jumuah") {
          effectiveTimeStr = iqamahTimes["Jumuah"];
        } else {
          // Prioritize Iqamah time if available and not "N/A", otherwise use Adhan time
          effectiveTimeStr = iqamahTimes[prayerName] && iqamahTimes[prayerName] !== "N/A"
            ? iqamahTimes[prayerName]
            : apiTimes.timings[prayerName as keyof typeof apiTimes.timings];
        }

        if (effectiveTimeStr && effectiveTimeStr !== "N/A") {
          const prayerDate = getDateForTime(effectiveTimeStr, currentDay);
          if (prayerDate) {
            potentialNextPrayers.push({
              name: prayerName,
              time: prayerDate,
              formattedTime: formatInTimeZone(prayerDate, TIMEZONE, 'hh:mm a'),
            });
          }
        }
      }
    }

    // Sort all potential prayers by their actual Date object to find the earliest future one
    potentialNextPrayers.sort((a, b) => a.time.getTime() - b.time.getTime());

    let foundNextPrayer: NextPrayerInfo | null = null;
    for (const prayer of potentialNextPrayers) {
      if (isAfter(prayer.time, now)) {
        const diffSeconds = differenceInSeconds(prayer.time, now);
        const hours = Math.floor(diffSeconds / 3600);
        const minutes = Math.floor((diffSeconds % 3600) / 60);
        const seconds = diffSeconds % 60;

        const countdownString = `${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;

        foundNextPrayer = {
          ...prayer,
          countdown: countdownString,
        };
        break;
      }
    }

    setNextPrayer(foundNextPrayer);
  }, [apiTimes, iqamahTimes]);

  useEffect(() => {
    calculateCountdown(); // Initial calculation

    const intervalId = setInterval(() => {
      calculateCountdown(); // Recalculate every second
    }, 1000);

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, [calculateCountdown]);

  return nextPrayer;
};