import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { showSuccess, showError } from "@/utils/toast";
import { Edit, Trash2, PlusCircle, Loader2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format, parse } from "date-fns"; // Import parse

interface YouthSubprogram {
  id: string;
  program_tag: string;
  title: string;
  description?: string;
  day_of_week?: string;
  start_time?: string;
  end_time?: string;
  contact_email?: string;
  contact_phone?: string;
  display_order?: number;
  created_at?: string;
}

const prayerNames = ["Fajr", "Sunrise", "Dhuhr", "Asr", "Maghrib", "Isha", "Jumuah"];
const timeInputTypes = ["Specific Time", "Prayer Name"];

// Helper function to format 24-hour time to 12-hour with AM/PM or return prayer name
const formatTimeForDisplay = (timeValue: string | undefined): string => {
  if (!timeValue) return "N/A"; // Handle null/undefined/empty string

  if (prayerNames.includes(timeValue)) {
    return timeValue; // It's a prayer name, return as is
  }

  // Otherwise, assume it's a 24-hour time string
  const timeRegex = /^\d{2}:\d{2}$/;
  if (timeRegex.test(timeValue)) {
    try {
      const parsedTime = parse(timeValue, 'HH:mm', new Date());
      if (!isNaN(parsedTime.getTime())) {
        return format(parsedTime, 'hh:mm a');
      }
    } catch (e) {
      console.warn("Failed to parse time:", timeValue, e);
    }
  }
  return timeValue; // Fallback if not a valid time string
};

const YouthSubprogramsAdmin = () => {
  const [subprograms, setSubprograms] = useState<YouthSubprogram[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentSubprogram, setCurrentSubprogram] = useState<Partial<YouthSubprogram> | null>(null);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [subprogramToDelete, setSubprogramToDelete] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const queryClient = useQueryClient();

  const programTags = ["Education", "Recreation", "Service"]; // Corresponds to the main youth program categories

  // State for the dialog form's time inputs
  const [dialogStartTimeType, setDialogStartTimeType] = useState<'specific' | 'prayer_name'>('specific');
  const [dialogStartTimeValue, setDialogStartTimeValue] = useState<string>(''); // HH:MM or prayer name
  const [dialogEndTimeType, setDialogEndTimeType] = useState<'specific' | 'prayer_name'>('specific');
  const [dialogEndTimeValue, setDialogEndTimeValue] = useState<string>(''); // HH:MM or prayer name

  const fetchSubprograms = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("youth_subprograms")
      .select("*")
      .order("program_tag", { ascending: true })
      .order("display_order", { ascending: true });

    if (error) {
      showError("Error fetching youth subprograms: " + error.message);
    } else {
      setSubprograms(data || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchSubprograms();
  }, [fetchSubprograms]);

  const handleAddClick = useCallback(() => {
    setCurrentSubprogram({
      program_tag: "", // Must be selected
      title: "",
      description: "",
      day_of_week: "",
      contact_email: "",
      contact_phone: "",
      display_order: subprograms.length > 0 ? Math.max(...subprograms.map(s => s.display_order || 0)) + 1 : 1,
    });
    setDialogStartTimeType('specific');
    setDialogStartTimeValue('');
    setDialogEndTimeType('specific');
    setDialogEndTimeValue('');
    setIsDialogOpen(true);
  }, [subprograms]);

  const handleEditClick = useCallback((subprogram: YouthSubprogram) => {
    setCurrentSubprogram({ ...subprogram });

    // Determine start time type and value
    if (subprogram.start_time && prayerNames.includes(subprogram.start_time)) {
      setDialogStartTimeType('prayer_name');
      setDialogStartTimeValue(subprogram.start_time);
    } else {
      setDialogStartTimeType('specific');
      setDialogStartTimeValue(subprogram.start_time || '');
    }

    // Determine end time type and value
    if (subprogram.end_time && prayerNames.includes(subprogram.end_time)) {
      setDialogEndTimeType('prayer_name');
      setDialogEndTimeValue(subprogram.end_time);
    } else {
      setDialogEndTimeType('specific');
      setDialogEndTimeValue(subprogram.end_time || '');
    }

    setIsDialogOpen(true);
  }, [prayerNames]);

  const handleDeleteClick = useCallback((id: string) => {
    setSubprogramToDelete(id);
    setIsConfirmDeleteOpen(true);
  }, []);

  const handleSaveSubprogram = useCallback(async () => {
    if (!currentSubprogram?.program_tag || !currentSubprogram?.title) {
      showError("Program Tag and Title are required.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        program_tag: currentSubprogram.program_tag,
        title: currentSubprogram.title,
        description: currentSubprogram.description,
        day_of_week: currentSubprogram.day_of_week,
        start_time: dialogStartTimeType === 'specific' ? (dialogStartTimeValue || null) : dialogStartTimeValue,
        end_time: dialogEndTimeType === 'specific' ? (dialogEndTimeValue || null) : dialogEndTimeValue,
        contact_email: currentSubprogram.contact_email,
        contact_phone: currentSubprogram.contact_phone,
        display_order: currentSubprogram.display_order,
      };

      // Validation for specific time format
      const timeRegex = /^\d{2}:\d{2}$/;
      if (dialogStartTimeType === 'specific' && payload.start_time && payload.start_time !== "N/A" && !timeRegex.test(payload.start_time)) {
        showError("Please enter Start Time in HH:MM (24-hour) format.");
        setSaving(false);
        return;
      }
      if (dialogEndTimeType === 'specific' && payload.end_time && payload.end_time !== "N/A" && !timeRegex.test(payload.end_time)) {
        showError("Please enter End Time in HH:MM (24-hour) format.");
        setSaving(false);
        return;
      }

      if (currentSubprogram.id) {
        // Update existing subprogram
        const { error } = await supabase
          .from("youth_subprograms")
          .update(payload)
          .eq("id", currentSubprogram.id);

        if (error) throw error;
        showSuccess("Youth subprogram updated successfully!");
      } else {
        // Add new subprogram
        const { error } = await supabase.from("youth_subprograms").insert(payload);

        if (error) throw error;
        showSuccess("Youth subprogram added successfully!");
      }
      setIsDialogOpen(false);
    } catch (error: any) {
      showError("Error saving subprogram: " + error.message);
    } finally {
      setSaving(false);
      fetchSubprograms(); // Re-fetch to update the list
      queryClient.invalidateQueries({ queryKey: ["youthSubprograms"] }); // Invalidate public query
    }
  }, [currentSubprogram, dialogStartTimeType, dialogStartTimeValue, dialogEndTimeType, dialogEndTimeValue, fetchSubprograms, queryClient]);

  const confirmDelete = useCallback(async () => {
    if (subprogramToDelete) {
      setSaving(true);
      try {
        const { error } = await supabase
          .from("youth_subprograms")
          .delete()
          .eq("id", subprogramToDelete);

        if (error) throw error;
        showSuccess("Youth subprogram deleted successfully!");
      } catch (error: any) {
        showError("Error deleting subprogram: " + error.message);
      } finally {
        setIsConfirmDeleteOpen(false);
        setSubprogramToDelete(null);
        setSaving(false);
        fetchSubprograms(); // Re-fetch to update the list
        queryClient.invalidateQueries({ queryKey: ["youthSubprograms"] }); // Invalidate public query
      }
    }
  }, [subprogramToDelete, fetchSubprograms, queryClient]);

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Manage Youth Subprograms</h2>
        <Button onClick={handleAddClick}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add New Subprogram
        </Button>
      </div>

      {loading ? (
        <p>Loading youth subprograms...</p>
      ) : subprograms.length === 0 ? (
        <p className="text-center text-muted-foreground">No youth subprograms found. Click "Add New Subprogram" to create one.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {subprograms.map((subprogram) => (
            <Card key={subprogram.id}>
              <CardHeader>
                <CardTitle className="text-xl">{subprogram.title}</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  Tag: {subprogram.program_tag}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 dark:text-gray-300 mb-2 line-clamp-3">{subprogram.description}</p>
                {subprogram.day_of_week && <p className="text-sm text-muted-foreground">Day: {subprogram.day_of_week}</p>}
                {(subprogram.start_time || subprogram.end_time) && (
                  <p className="text-sm text-muted-foreground">
                    Time: {formatTimeForDisplay(subprogram.start_time)} - {formatTimeForDisplay(subprogram.end_time)}
                  </p>
                )}
                {subprogram.contact_email && <p className="text-sm text-muted-foreground">Email: {subprogram.contact_email}</p>}
                {subprogram.contact_phone && <p className="text-sm text-muted-foreground">Phone: {subprogram.contact_phone}</p>}
                <p className="text-sm text-muted-foreground">Order: {subprogram.display_order}</p>
                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline" size="sm" onClick={() => handleEditClick(subprogram)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDeleteClick(subprogram.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Subprogram Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{currentSubprogram?.id ? "Edit Youth Subprogram" : "Add New Youth Subprogram"}</DialogTitle>
            <DialogDescription>
              {currentSubprogram?.id ? "Make changes to this subprogram's information." : "Add a new subprogram."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="program_tag" className="text-right">
                Program Tag
              </Label>
              <Select
                value={currentSubprogram?.program_tag || ""}
                onValueChange={(value) => setCurrentSubprogram({ ...currentSubprogram, program_tag: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a program tag" />
                </SelectTrigger>
                <SelectContent>
                  {programTags.map((tag) => (
                    <SelectItem key={tag} value={tag}>
                      {tag}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Title
              </Label>
              <Input
                id="title"
                value={currentSubprogram?.title || ""}
                onChange={(e) => setCurrentSubprogram({ ...currentSubprogram, title: e.target.value })}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea
                id="description"
                value={currentSubprogram?.description || ""}
                onChange={(e) => setCurrentSubprogram({ ...currentSubprogram, description: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="day_of_week" className="text-right">
                Day of Week
              </Label>
              <Input
                id="day_of_week"
                value={currentSubprogram?.day_of_week || ""}
                onChange={(e) => setCurrentSubprogram({ ...currentSubprogram, day_of_week: e.target.value })}
                className="col-span-3"
                placeholder="e.g., Every Saturday, Every other Tuesday"
              />
            </div>

            {/* Start Time Selector */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="start_time_type" className="text-right">Start Time Type</Label>
              <Select
                value={dialogStartTimeType}
                onValueChange={(value: 'specific' | 'prayer_name') => {
                  setDialogStartTimeType(value);
                  setDialogStartTimeValue(''); // Clear value when type changes
                }}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select time type" />
                </SelectTrigger>
                <SelectContent>
                  {timeInputTypes.map((type) => (
                    <SelectItem key={type} value={type === "Specific Time" ? "specific" : "prayer_name"}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="start_time_value" className="text-right">Start Time</Label>
              {dialogStartTimeType === 'specific' ? (
                <div className="col-span-3 flex items-center gap-2">
                  <Input
                    id="start_time_value"
                    type="time"
                    className="flex-grow"
                    value={dialogStartTimeValue}
                    onChange={(e) => setDialogStartTimeValue(e.target.value)}
                    placeholder="HH:MM (24-hour)"
                  />
                  <span className="text-sm text-muted-foreground min-w-[80px] text-right">
                    {formatTimeForDisplay(dialogStartTimeValue)}
                  </span>
                </div>
              ) : (
                <Select
                  value={dialogStartTimeValue}
                  onValueChange={setDialogStartTimeValue}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select prayer time" />
                  </SelectTrigger>
                  <SelectContent>
                    {prayerNames.map((prayer) => (
                      <SelectItem key={prayer} value={prayer}>
                        {prayer}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* End Time Selector */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="end_time_type" className="text-right">End Time Type</Label>
              <Select
                value={dialogEndTimeType}
                onValueChange={(value: 'specific' | 'prayer_name') => {
                  setDialogEndTimeType(value);
                  setDialogEndTimeValue(''); // Clear value when type changes
                }}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select time type" />
                </SelectTrigger>
                <SelectContent>
                  {timeInputTypes.map((type) => (
                    <SelectItem key={type} value={type === "Specific Time" ? "specific" : "prayer_name"}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="end_time_value" className="text-right">End Time</Label>
              {dialogEndTimeType === 'specific' ? (
                <div className="col-span-3 flex items-center gap-2">
                  <Input
                    id="end_time_value"
                    type="time"
                    className="flex-grow"
                    value={dialogEndTimeValue}
                    onChange={(e) => setDialogEndTimeValue(e.target.value)}
                    placeholder="HH:MM (24-hour)"
                  />
                  <span className="text-sm text-muted-foreground min-w-[80px] text-right">
                    {formatTimeForDisplay(dialogEndTimeValue)}
                  </span>
                </div>
              ) : (
                <Select
                  value={dialogEndTimeValue}
                  onValueChange={setDialogEndTimeValue}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select prayer time" />
                  </SelectTrigger>
                  <SelectContent>
                    {prayerNames.map((prayer) => (
                      <SelectItem key={prayer} value={prayer}>
                        {prayer}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="contact_email" className="text-right">
                Contact Email
              </Label>
              <Input
                id="contact_email"
                type="email"
                value={currentSubprogram?.contact_email || ""}
                onChange={(e) => setCurrentSubprogram({ ...currentSubprogram, contact_email: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="contact_phone" className="text-right">
                Contact Phone
              </Label>
              <Input
                id="contact_phone"
                type="tel"
                value={currentSubprogram?.contact_phone || ""}
                onChange={(e) => setCurrentSubprogram({ ...currentSubprogram, contact_phone: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="display_order" className="text-right">
                Display Order
              </Label>
              <Input
                id="display_order"
                type="number"
                value={currentSubprogram?.display_order || ""}
                onChange={(e) => setCurrentSubprogram({ ...currentSubprogram, display_order: parseInt(e.target.value) || 0 })}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveSubprogram} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                </>
              ) : (
                "Save Subprogram"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Delete Dialog */}
      <Dialog open={isConfirmDeleteOpen} onOpenChange={setIsConfirmDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this youth subprogram? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmDeleteOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={saving}>
              {saving ? (
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

export default YouthSubprogramsAdmin;