import { useState, useEffect, useCallback } from "react";
import { format, parse, isAfter, addDays, differenceInSeconds, subMinutes } from "date-fns";
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

interface PrayerInfo {
  name: string;
  time: Date;
  formattedTime: string;
  countdown: string;
}

// Exclude Jumuah from this list as it should not be part of the daily countdown
const dailyPrayerOrder = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];

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
) => {
  const [nextAdhanInfo, setNextAdhanInfo] = useState<PrayerInfo | null>(null);
  const [oneHourBeforeAdhanInfo, setOneHourBeforeAdhanInfo] = useState<PrayerInfo | null>(null);

  const calculateCountdown = useCallback(() => {
    if (!apiTimes) {
      setNextAdhanInfo(null);
      setOneHourBeforeAdhanInfo(null);
      return;
    }

    const now = toZonedTime(new Date(), TIMEZONE);
    const today = now;
    const tomorrow = addDays(today, 1);

    const potentialAdhanTimes: { name: string; time: Date; formattedTime: string }[] = [];

    // Iterate through today's and tomorrow's daily prayers to find the next one
    for (let i = 0; i < 2; i++) { // 0 for today, 1 for tomorrow
      const currentDay = i === 0 ? today : tomorrow;

      for (const prayerName of dailyPrayerOrder) {
        const adhanTimeStr = apiTimes.timings[prayerName as keyof typeof apiTimes.timings];
        
        if (adhanTimeStr && adhanTimeStr !== "N/A") {
          const adhanDate = getDateForTime(adhanTimeStr, currentDay);
          if (adhanDate) {
            potentialAdhanTimes.push({
              name: prayerName,
              time: adhanDate,
              formattedTime: formatInTimeZone(adhanDate, TIMEZONE, 'hh:mm a'),
            });
          }
        }
      }
    }

    // Sort all potential prayers by their actual Date object to find the earliest future one
    potentialAdhanTimes.sort((a, b) => a.time.getTime() - b.time.getTime());

    let foundNextAdhan: PrayerInfo | null = null;
    let foundOneHourBeforeAdhan: PrayerInfo | null = null;

    for (const prayer of potentialAdhanTimes) {
      if (isAfter(prayer.time, now)) {
        // This is the next Adhan time
        const diffSeconds = differenceInSeconds(prayer.time, now);
        const hours = Math.floor(diffSeconds / 3600);
        const minutes = Math.floor((diffSeconds % 3600) / 60);
        const seconds = diffSeconds % 60;
        const countdownString = `${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m ${seconds.toString().padStart(2, '0')}s`;

        foundNextAdhan = {
          ...prayer,
          countdown: countdownString,
        };

        // Calculate one hour before this Adhan time
        const oneHourBeforeTime = subMinutes(prayer.time, 60);
        // Only set if it's still in the future relative to 'now'
        if (isAfter(oneHourBeforeTime, now)) {
          const diffSecondsOneHour = differenceInSeconds(oneHourBeforeTime, now);
          const hoursOneHour = Math.floor(diffSecondsOneHour / 3600);
          const minutesOneHour = Math.floor((diffSecondsOneHour % 3600) / 60);
          const secondsOneHour = diffSecondsOneHour % 60;
          const countdownStringOneHour = `${hoursOneHour.toString().padStart(2, '0')}h ${minutesOneHour.toString().padStart(2, '0')}m ${secondsOneHour.toString().padStart(2, '0')}s`;

          foundOneHourBeforeAdhan = {
            name: prayer.name, // Still refers to the same prayer
            time: oneHourBeforeTime,
            formattedTime: formatInTimeZone(oneHourBeforeTime, TIMEZONE, 'hh:mm a'),
            countdown: countdownStringOneHour,
          };
        }
        break; // Found the next Adhan, so we can stop
      }
    }

    setNextAdhanInfo(foundNextAdhan);
    setOneHourBeforeAdhanInfo(foundOneHourBeforeAdhan);

  }, [apiTimes]);

  useEffect(() => {
    calculateCountdown(); // Initial calculation

    const intervalId = setInterval(() => {
      calculateCountdown(); // Recalculate every second
    }, 1000);

    return () => clearInterval(intervalId); // Cleanup on unmount
  }, [calculateCountdown]);

  return { nextAdhanInfo, oneHourBeforeAdhanInfo };
};