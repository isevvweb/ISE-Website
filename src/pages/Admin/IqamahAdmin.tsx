import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { showSuccess, showError } from "@/utils/toast";
import { Loader2 } from "lucide-react";
import { format, parse } from "date-fns"; // Import parse

interface IqamahTime {
  id: string;
  prayer_name: string;
  iqamah_time: string; // Stored in 24-hour format (HH:mm)
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

const IqamahAdmin = () => {
  const [iqamahTimes, setIqamahTimes] = useState<Record<string, IqamahTime>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const prayerOrder = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha", "Jumuah"];

  useEffect(() => {
    fetchIqamahTimes();
  }, []);

  const fetchIqamahTimes = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("iqamah_times").select("*");

    if (error) {
      showError("Error fetching iqamah times: " + error.message);
    } else {
      const timesMap: Record<string, IqamahTime> = {};
      data.forEach((item) => {
        timesMap[item.prayer_name] = item;
      });
      setIqamahTimes(timesMap);
    }
    setLoading(false);
  };

  const handleChange = (prayerName: string, value: string) => {
    setIqamahTimes((prev) => ({
      ...prev,
      [prayerName]: {
        ...prev[prayerName],
        prayer_name: prayerName, // Ensure prayer_name is set even if new
        iqamah_time: value,
      },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    let hasError = false;

    for (const prayerName of prayerOrder) {
      const timeData = iqamahTimes[prayerName];
      if (!timeData || !timeData.iqamah_time) {
        showError(`Iqamah time for ${prayerName} cannot be empty.`);
        hasError = true;
        continue;
      }

      // Validate 24-hour format for all time inputs
      const timeRegex = /^\d{2}:\d{2}$/;
      if (!timeRegex.test(timeData.iqamah_time)) {
        showError(`Please enter ${prayerName} time in HH:MM (24-hour) format.`);
        hasError = true;
        continue;
      }

      if (timeData.id) {
        // Update existing
        const { error } = await supabase
          .from("iqamah_times")
          .update({ iqamah_time: timeData.iqamah_time })
          .eq("id", timeData.id);
        if (error) {
          showError(`Error updating ${prayerName}: ${error.message}`);
          hasError = true;
        }
      } else {
        // Insert new (should only happen if initial data was missing)
        const { error } = await supabase
          .from("iqamah_times")
          .insert({ prayer_name: prayerName, iqamah_time: timeData.iqamah_time });
        if (error) {
          showError(`Error inserting ${prayerName}: ${error.message}`);
          hasError = true;
        }
      }
    }

    if (!hasError) {
      showSuccess("Iqamah times updated successfully!");
      fetchIqamahTimes(); // Re-fetch to ensure state is consistent with DB
    }
    setSaving(false);
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Adjust Iqamah Times</h2>
      <p className="mb-6 text-gray-700 dark:text-gray-300">
        Here you can manually adjust the iqamah times for daily prayers and Jumu'ah.
      </p>

      {loading ? (
        <p>Loading iqamah times...</p>
      ) : (
        <Card className="max-w-md mx-auto p-6">
          <CardHeader>
            <CardTitle className="text-xl">Set Prayer Times</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {prayerOrder.map((prayerName) => (
              <div key={prayerName} className="grid grid-cols-3 items-center gap-4">
                <Label htmlFor={prayerName} className="col-span-1 text-right font-medium">
                  {prayerName}
                </Label>
                <div className="col-span-2 flex items-center gap-2">
                  <Input
                    id={prayerName}
                    type="time" // All prayer times now use type="time"
                    className="flex-grow"
                    value={iqamahTimes[prayerName]?.iqamah_time || ""}
                    onChange={(e) => handleChange(prayerName, e.target.value)}
                    placeholder="HH:MM (24-hour)"
                  />
                  <span className="text-sm text-muted-foreground min-w-[80px] text-right">
                    {formatTimeForDisplay(iqamahTimes[prayerName]?.iqamah_time || "")}
                  </span>
                </div>
              </div>
            ))}
            <Button onClick={handleSave} className="w-full mt-6" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                </>
              ) : (
                "Save Iqamah Times"
              )}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default IqamahAdmin;