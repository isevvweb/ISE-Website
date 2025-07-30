import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { showSuccess, showError } from "@/utils/toast";
import { Loader2, Settings, PlusCircle, Edit, Trash2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format, parse } from "date-fns";

interface DigitalSignSettings {
  id: string;
  max_announcements: number;
  show_descriptions: boolean;
  show_images: boolean;
  rotation_interval_seconds: number;
}

interface DowntimeEntry {
  id: string;
  type: 'time_range' | 'prayer_iqamah';
  start_time?: string; // HH:mm or prayer name
  end_time?: string;   // HH:mm or prayer name
  prayer_name?: string; // e.g., 'Fajr', 'Dhuhr'
  minutes_before_iqamah?: number;
  minutes_after_iqamah?: number;
  days_of_week: string[]; // Array of day names, e.g., ['Monday', 'Friday']
  is_active: boolean;
}

const prayerNames = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha", "Jumuah"];
const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const DigitalSignSettingsAdmin = () => {
  const [settings, setSettings] = useState<Partial<DigitalSignSettings>>({});
  const [downtimes, setDowntimes] = useState<DowntimeEntry[]>([]);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [loadingDowntimes, setLoadingDowntimes] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [savingDowntime, setSavingDowntime] = useState(false);

  const [isDowntimeDialogOpen, setIsDowntimeDialogOpen] = useState(false);
  const [currentDowntime, setCurrentDowntime] = useState<Partial<DowntimeEntry> | null>(null);
  const [isConfirmDeleteDowntimeOpen, setIsConfirmDeleteDowntimeOpen] = useState(false);
  const [downtimeToDelete, setDowntimeToDelete] = useState<string | null>(null);

  const queryClient = useQueryClient();

  useEffect(() => {
    fetchSettings();
    fetchDowntimes();
  }, []);

  const fetchSettings = async () => {
    setLoadingSettings(true);
    const { data, error } = await supabase
      .from("digital_sign_settings")
      .select("*")
      .single();

    if (error) {
      showError("Error fetching digital sign settings: " + error.message);
      setSettings({
        max_announcements: 3,
        show_descriptions: true,
        show_images: true,
        rotation_interval_seconds: 15,
      });
    } else {
      setSettings(data || {});
    }
    setLoadingSettings(false);
  };

  const fetchDowntimes = async () => {
    setLoadingDowntimes(true);
    const { data, error } = await supabase
      .from("digital_sign_downtimes")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      showError("Error fetching digital sign downtimes: " + error.message);
      setDowntimes([]);
    } else {
      setDowntimes(data || []);
    }
    setLoadingDowntimes(false);
  };

  const handleSaveSettings = async () => {
    if (settings.max_announcements === undefined || settings.max_announcements < 0) {
      showError("Number of announcements must be a non-negative number.");
      return;
    }
    if (settings.rotation_interval_seconds === undefined || settings.rotation_interval_seconds < 5) {
      showError("Rotation interval must be at least 5 seconds.");
      return;
    }

    setSavingSettings(true);
    try {
      const payload = {
        max_announcements: settings.max_announcements,
        show_descriptions: settings.show_descriptions,
        show_images: settings.show_images,
        rotation_interval_seconds: settings.rotation_interval_seconds,
      };

      let error;
      if (settings.id) {
        const { error: updateError } = await supabase
          .from("digital_sign_settings")
          .update(payload)
          .eq("id", settings.id);
        error = updateError;
      } else {
        const { error: insertError } = await supabase
          .from("digital_sign_settings")
          .insert({ ...payload, id: '00000000-0000-0000-0000-000000000001' });
        error = insertError;
      }

      if (error) throw error;
      showSuccess("Digital sign settings updated successfully!");
    } catch (error: any) {
      showError("Error saving settings: " + error.message);
    } finally {
      setSavingSettings(false);
      fetchSettings();
      queryClient.invalidateQueries({ queryKey: ["digitalSignSettings"] });
      queryClient.invalidateQueries({ queryKey: ["activeAnnouncements"] });
    }
  };

  const handleAddDowntimeClick = () => {
    setCurrentDowntime({
      type: 'time_range', // Default to time range
      days_of_week: [],
      is_active: true,
      start_time: '',
      end_time: '',
      prayer_name: '',
      minutes_before_iqamah: 0,
      minutes_after_iqamah: 0,
    });
    setIsDowntimeDialogOpen(true);
  };

  const handleEditDowntimeClick = (downtime: DowntimeEntry) => {
    setCurrentDowntime({ ...downtime });
    setIsDowntimeDialogOpen(true);
  };

  const handleDeleteDowntimeClick = (id: string) => {
    setDowntimeToDelete(id);
    setIsConfirmDeleteDowntimeOpen(true);
  };

  const handleSaveDowntime = async () => {
    if (!currentDowntime?.type) {
      showError("Downtime type is required.");
      return;
    }

    if (currentDowntime.type === 'time_range') {
      if (!currentDowntime.start_time || !currentDowntime.end_time) {
        showError("Start and End times are required for time range downtime.");
        return;
      }
      // Basic HH:mm format validation
      const timeRegex = /^(?:2[0-3]|[01]?[0-9]):[0-5][0-9]$/;
      if (!timeRegex.test(currentDowntime.start_time) || !timeRegex.test(currentDowntime.end_time)) {
        showError("Please enter times in HH:MM (24-hour) format.");
        return;
      }
    } else if (currentDowntime.type === 'prayer_iqamah') {
      if (!currentDowntime.prayer_name) {
        showError("Prayer name is required for prayer-based downtime.");
        return;
      }
      if (currentDowntime.minutes_before_iqamah === undefined || currentDowntime.minutes_after_iqamah === undefined) {
        showError("Minutes before and after Iqamah are required.");
        return;
      }
      if (currentDowntime.minutes_before_iqamah < 0 || currentDowntime.minutes_after_iqamah < 0) {
        showError("Minutes before and after Iqamah cannot be negative.");
        return;
      }
    }

    if (currentDowntime.days_of_week.length === 0) {
      showError("At least one day of the week must be selected.");
      return;
    }

    setSavingDowntime(true);
    try {
      const payload: Partial<DowntimeEntry> = {
        type: currentDowntime.type,
        days_of_week: currentDowntime.days_of_week,
        is_active: currentDowntime.is_active,
      };

      if (currentDowntime.type === 'time_range') {
        payload.start_time = currentDowntime.start_time;
        payload.end_time = currentDowntime.end_time;
        payload.prayer_name = null; // Clear prayer-specific fields
        payload.minutes_before_iqamah = null;
        payload.minutes_after_iqamah = null;
      } else { // prayer_iqamah
        payload.prayer_name = currentDowntime.prayer_name;
        payload.minutes_before_iqamah = currentDowntime.minutes_before_iqamah;
        payload.minutes_after_iqamah = currentDowntime.minutes_after_iqamah;
        payload.start_time = null; // Clear time range fields
        payload.end_time = null;
      }

      if (currentDowntime.id) {
        const { error } = await supabase
          .from("digital_sign_downtimes")
          .update(payload)
          .eq("id", currentDowntime.id);
        if (error) throw error;
        showSuccess("Downtime updated successfully!");
      } else {
        const { error } = await supabase
          .from("digital_sign_downtimes")
          .insert(payload);
        if (error) throw error;
        showSuccess("Downtime added successfully!");
      }
      setIsDowntimeDialogOpen(false);
    } catch (error: any) {
      showError("Error saving downtime: " + error.message);
    } finally {
      setSavingDowntime(false);
      fetchDowntimes();
      queryClient.invalidateQueries({ queryKey: ["digitalSignDowntimes"] }); // Invalidate public query
    }
  };

  const confirmDeleteDowntime = async () => {
    if (downtimeToDelete) {
      setSavingDowntime(true);
      try {
        const { error } = await supabase
          .from("digital_sign_downtimes")
          .delete()
          .eq("id", downtimeToDelete);

        if (error) throw error;
        showSuccess("Downtime deleted successfully!");
      } catch (error: any) {
        showError("Error deleting downtime: " + error.message);
      } finally {
        setIsConfirmDeleteDowntimeOpen(false);
        setDowntimeToDelete(null);
        setSavingDowntime(false);
        fetchDowntimes();
        queryClient.invalidateQueries({ queryKey: ["digitalSignDowntimes"] }); // Invalidate public query
      }
    }
  };

  const formatDowntimeDisplay = (downtime: DowntimeEntry) => {
    const days = downtime.days_of_week.length === 7 ? "Every Day" : downtime.days_of_week.join(", ");
    let timeInfo = "";
    if (downtime.type === 'time_range') {
      timeInfo = `${downtime.start_time} - ${downtime.end_time}`;
    } else if (downtime.type === 'prayer_iqamah') {
      timeInfo = `${downtime.minutes_before_iqamah} min before ${downtime.prayer_name} Iqamah to ${downtime.minutes_after_iqamah} min after`;
    }
    return `${days}: ${timeInfo} (${downtime.is_active ? "Active" : "Inactive"})`;
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Digital Sign Settings</h2>
      <p className="mb-6 text-gray-700 dark:text-gray-300">
        Configure how announcements and other content appear on the public digital sign display.
      </p>

      {loadingSettings ? (
        <p>Loading settings...</p>
      ) : (
        <Card className="max-w-md mx-auto p-6 mb-8">
          <CardHeader>
            <CardTitle className="text-xl">Display Preferences</CardTitle>
            <CardDescription>Adjust the content shown on the digital sign.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-2">
              <Label htmlFor="max_announcements">Number of Recent Announcements to Show</Label>
              <Input
                id="max_announcements"
                type="number"
                min="0"
                value={settings.max_announcements ?? ""}
                onChange={(e) => setSettings({ ...settings, max_announcements: parseInt(e.target.value) || 0 })}
              />
              <p className="text-sm text-muted-foreground">Set to 0 to hide announcements section.</p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="rotation_interval_seconds">Rotation Interval (seconds)</Label>
              <Input
                id="rotation_interval_seconds"
                type="number"
                min="5"
                value={settings.rotation_interval_seconds ?? ""}
                onChange={(e) => setSettings({ ...settings, rotation_interval_seconds: parseInt(e.target.value) || 0 })}
              />
              <p className="text-sm text-muted-foreground">Time before switching sections (minimum 5 seconds).</p>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="show_descriptions"
                checked={settings.show_descriptions ?? true}
                onCheckedChange={(checked) => setSettings({ ...settings, show_descriptions: !!checked })}
              />
              <Label htmlFor="show_descriptions" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Show Announcement Descriptions
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="show_images"
                checked={settings.show_images ?? true}
                onCheckedChange={(checked) => setSettings({ ...settings, show_images: !!checked })}
              />
              <Label htmlFor="show_images" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Show Announcement Images
              </Label>
            </div>

            <Button onClick={handleSaveSettings} className="w-full mt-6" disabled={savingSettings}>
              {savingSettings ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                </>
              ) : (
                "Save Settings"
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      <h2 className="text-2xl font-bold mb-4">Downtime Management</h2>
      <p className="mb-6 text-gray-700 dark:text-gray-300">
        Configure periods when the digital sign will only display prayer times.
      </p>

      <div className="flex justify-end mb-4">
        <Button onClick={handleAddDowntimeClick}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add New Downtime
        </Button>
      </div>

      {loadingDowntimes ? (
        <p>Loading downtimes...</p>
      ) : downtimes.length === 0 ? (
        <p className="text-center text-muted-foreground">No downtimes configured. Click "Add New Downtime" to create one.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-1">
          {downtimes.map((downtime) => (
            <Card key={downtime.id}>
              <CardHeader>
                <CardTitle className="text-xl">Downtime Rule</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  {formatDowntimeDisplay(downtime)}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-end gap-2">
                <Button variant="outline" size="sm" onClick={() => handleEditDowntimeClick(downtime)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDeleteDowntimeClick(downtime.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Downtime Dialog */}
      <Dialog open={isDowntimeDialogOpen} onOpenChange={setIsDowntimeDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{currentDowntime?.id ? "Edit Downtime" : "Add New Downtime"}</DialogTitle>
            <DialogDescription>
              {currentDowntime?.id ? "Adjust this downtime period." : "Create a new downtime period for the digital sign."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="downtime_type" className="text-right">
                Type
              </Label>
              <Select
                value={currentDowntime?.type || ""}
                onValueChange={(value: 'time_range' | 'prayer_iqamah') => setCurrentDowntime({ ...currentDowntime, type: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select downtime type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="time_range">Time Range</SelectItem>
                  <SelectItem value="prayer_iqamah">Prayer Iqamah Based</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {currentDowntime?.type === 'time_range' && (
              <>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="start_time" className="text-right">
                    Start Time
                  </Label>
                  <Input
                    id="start_time"
                    type="time"
                    value={currentDowntime?.start_time || ""}
                    onChange={(e) => setCurrentDowntime({ ...currentDowntime, start_time: e.target.value })}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="end_time" className="text-right">
                    End Time
                  </Label>
                  <Input
                    id="end_time"
                    type="time"
                    value={currentDowntime?.end_time || ""}
                    onChange={(e) => setCurrentDowntime({ ...currentDowntime, end_time: e.target.value })}
                    className="col-span-3"
                    required
                  />
                </div>
              </>
            )}

            {currentDowntime?.type === 'prayer_iqamah' && (
              <>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="prayer_name" className="text-right">
                    Prayer
                  </Label>
                  <Select
                    value={currentDowntime?.prayer_name || ""}
                    onValueChange={(value) => setCurrentDowntime({ ...currentDowntime, prayer_name: value })}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select a prayer" />
                    </SelectTrigger>
                    <SelectContent>
                      {prayerNames.map((prayer) => (
                        <SelectItem key={prayer} value={prayer}>
                          {prayer}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="minutes_before_iqamah" className="text-right">
                    Minutes Before Iqamah
                  </Label>
                  <Input
                    id="minutes_before_iqamah"
                    type="number"
                    min="0"
                    value={currentDowntime?.minutes_before_iqamah ?? ""}
                    onChange={(e) => setCurrentDowntime({ ...currentDowntime, minutes_before_iqamah: parseInt(e.target.value) || 0 })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="minutes_after_iqamah" className="text-right">
                    Minutes After Iqamah
                  </Label>
                  <Input
                    id="minutes_after_iqamah"
                    type="number"
                    min="0"
                    value={currentDowntime?.minutes_after_iqamah ?? ""}
                    onChange={(e) => setCurrentDowntime({ ...currentDowntime, minutes_after_iqamah: parseInt(e.target.value) || 0 })}
                    className="col-span-3"
                  />
                </div>
              </>
            )}

            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right pt-2">Days of Week</Label>
              <div className="col-span-3 grid grid-cols-2 gap-2">
                {daysOfWeek.map((day) => (
                  <div key={day} className="flex items-center space-x-2">
                    <Checkbox
                      id={`day-${day}`}
                      checked={currentDowntime?.days_of_week?.includes(day) || false}
                      onCheckedChange={(checked) => {
                        const updatedDays = checked
                          ? [...(currentDowntime?.days_of_week || []), day]
                          : (currentDowntime?.days_of_week || []).filter((d) => d !== day);
                        setCurrentDowntime({ ...currentDowntime, days_of_week: updatedDays });
                      }}
                    />
                    <Label htmlFor={`day-${day}`}>{day}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="is_active_downtime" className="text-right">
                Active
              </Label>
              <Checkbox
                id="is_active_downtime"
                checked={currentDowntime?.is_active ?? true}
                onCheckedChange={(checked) => setCurrentDowntime({ ...currentDowntime, is_active: !!checked })}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDowntimeDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveDowntime} disabled={savingDowntime}>
              {savingDowntime ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                </>
              ) : (
                "Save Downtime"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Delete Downtime Dialog */}
      <Dialog open={isConfirmDeleteDowntimeOpen} onOpenChange={setIsConfirmDeleteDowntimeOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this downtime entry? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmDeleteDowntimeOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDeleteDowntime} disabled={savingDowntime}>
              {savingDowntime ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DigitalSignSettingsAdmin;