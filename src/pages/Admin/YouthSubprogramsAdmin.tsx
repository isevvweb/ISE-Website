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
import { Checkbox } from "@/components/ui/checkbox";
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

// Helper function to format 24-hour time to 12-hour with AM/PM
const formatTimeForDisplay = (time24h: string | undefined): string => {
  if (!time24h || time24h === "N/A") return "N/A";

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
      start_time: "",
      end_time: "",
      contact_email: "",
      contact_phone: "",
      display_order: subprograms.length > 0 ? Math.max(...subprograms.map(s => s.display_order || 0)) + 1 : 1,
    });
    setIsDialogOpen(true);
  }, [subprograms]);

  const handleEditClick = useCallback((subprogram: YouthSubprogram) => {
    setCurrentSubprogram({ ...subprogram });
    setIsDialogOpen(true);
  }, []);

  const handleDeleteClick = useCallback((id: string) => {
    setSubprogramToDelete(id);
    setIsConfirmDeleteOpen(true);
  }, []);

  const handleChange = useCallback((field: keyof YouthSubprogram, value: string) => {
    setCurrentSubprogram((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  const handleNACheckboxChange = useCallback((field: keyof YouthSubprogram, checked: boolean) => {
    setCurrentSubprogram((prev) => ({
      ...prev,
      [field]: checked ? "N/A" : "",
    }));
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
        start_time: currentSubprogram.start_time === "" ? null : currentSubprogram.start_time,
        end_time: currentSubprogram.end_time === "" ? null : currentSubprogram.end_time,
        contact_email: currentSubprogram.contact_email,
        contact_phone: currentSubprogram.contact_phone,
        display_order: currentSubprogram.display_order,
      };

      // Basic time format validation if not N/A and not empty
      const timeRegex = /^\d{2}:\d{2}$/;
      if (payload.start_time && payload.start_time !== "N/A" && !timeRegex.test(payload.start_time)) {
        showError("Please enter Start Time in HH:MM (24-hour) format.");
        setSaving(false);
        return;
      }
      if (payload.end_time && payload.end_time !== "N/A" && !timeRegex.test(payload.end_time)) {
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
  }, [currentSubprogram, fetchSubprograms, queryClient]);

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
                onChange={(e) => handleChange("title", e.target.value)}
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
                onChange={(e) => handleChange("description", e.target.value)}
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
                onChange={(e) => handleChange("day_of_week", e.target.value)}
                className="col-span-3"
                placeholder="e.g., Every Saturday, Every other Tuesday"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="start_time" className="text-right">
                Start Time
              </Label>
              <div className="col-span-2 flex items-center gap-2">
                <Input
                  id="start_time"
                  type="time"
                  className="flex-grow"
                  value={currentSubprogram?.start_time === "N/A" ? "" : currentSubprogram?.start_time || ""}
                  onChange={(e) => handleChange("start_time", e.target.value)}
                  disabled={currentSubprogram?.start_time === "N/A"}
                  placeholder="HH:MM (24-hour)"
                />
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="start_time-na"
                    checked={currentSubprogram?.start_time === "N/A"}
                    onCheckedChange={(checked) => handleNACheckboxChange("start_time", !!checked)}
                  />
                  <Label htmlFor="start_time-na" className="text-sm font-normal">
                    N/A
                  </Label>
                </div>
              </div>
              <span className="text-sm text-muted-foreground min-w-[80px] text-right">
                {formatTimeForDisplay(currentSubprogram?.start_time)}
              </span>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="end_time" className="text-right">
                End Time
              </Label>
              <div className="col-span-2 flex items-center gap-2">
                <Input
                  id="end_time"
                  type="time"
                  className="flex-grow"
                  value={currentSubprogram?.end_time === "N/A" ? "" : currentSubprogram?.end_time || ""}
                  onChange={(e) => handleChange("end_time", e.target.value)}
                  disabled={currentSubprogram?.end_time === "N/A"}
                  placeholder="HH:MM (24-hour)"
                />
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="end_time-na"
                    checked={currentSubprogram?.end_time === "N/A"}
                    onCheckedChange={(checked) => handleNACheckboxChange("end_time", !!checked)}
                  />
                  <Label htmlFor="end_time-na" className="text-sm font-normal">
                    N/A
                  </Label>
                </div>
              </div>
              <span className="text-sm text-muted-foreground min-w-[80px] text-right">
                {formatTimeForDisplay(currentSubprogram?.end_time)}
              </span>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="contact_email" className="text-right">
                Contact Email
              </Label>
              <Input
                id="contact_email"
                type="email"
                value={currentSubprogram?.contact_email || ""}
                onChange={(e) => handleChange("contact_email", e.target.value)}
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
                onChange={(e) => handleChange("contact_phone", e.target.value)}
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
                onChange={(e) => handleChange("display_order", e.target.value)}
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