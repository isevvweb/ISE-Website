import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { showSuccess, showError } from "@/utils/toast";
import { Loader2, Settings } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

interface DigitalSignSettings {
  id: string;
  max_announcements: number;
  show_descriptions: boolean;
  show_images: boolean;
}

const DigitalSignSettingsAdmin = () => {
  const [settings, setSettings] = useState<Partial<DigitalSignSettings>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    // Assuming there's only one settings row, we fetch the first one
    const { data, error } = await supabase
      .from("digital_sign_settings")
      .select("*")
      .single();

    if (error) {
      showError("Error fetching digital sign settings: " + error.message);
      // If no settings exist, initialize with defaults
      setSettings({
        max_announcements: 3,
        show_descriptions: true,
        show_images: true,
      });
    } else {
      setSettings(data || {});
    }
    setLoading(false);
  };

  const handleSaveSettings = async () => {
    if (settings.max_announcements === undefined || settings.max_announcements < 0) {
      showError("Number of announcements must be a non-negative number.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        max_announcements: settings.max_announcements,
        show_descriptions: settings.show_descriptions,
        show_images: settings.show_images,
      };

      let error;
      if (settings.id) {
        // Update existing settings
        const { error: updateError } = await supabase
          .from("digital_sign_settings")
          .update(payload)
          .eq("id", settings.id);
        error = updateError;
      } else {
        // Insert new settings (should only happen if the initial row was missing)
        const { error: insertError } = await supabase
          .from("digital_sign_settings")
          .insert({ ...payload, id: '00000000-0000-0000-0000-000000000001' }); // Use a fixed ID for the single row
        error = insertError;
      }

      if (error) throw error;
      showSuccess("Digital sign settings updated successfully!");
    } catch (error: any) {
      showError("Error saving settings: " + error.message);
    } finally {
      setSaving(false);
      fetchSettings(); // Re-fetch to ensure state is consistent with DB
      queryClient.invalidateQueries({ queryKey: ["digitalSignSettings"] }); // Invalidate public query
      queryClient.invalidateQueries({ queryKey: ["activeAnnouncements"] }); // Invalidate announcements query as its limit might change
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Digital Sign Settings</h2>
      <p className="mb-6 text-gray-700 dark:text-gray-300">
        Configure how announcements and other content appear on the public digital sign display.
      </p>

      {loading ? (
        <p>Loading settings...</p>
      ) : (
        <Card className="max-w-md mx-auto p-6">
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

            <Button onClick={handleSaveSettings} className="w-full mt-6" disabled={saving}>
              {saving ? (
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
    </div>
  );
};

export default DigitalSignSettingsAdmin;