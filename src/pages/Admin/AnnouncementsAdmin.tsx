import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { showSuccess, showError } from "@/utils/toast";
import { format, parseISO } from "date-fns";
import { CalendarIcon, Edit, Trash2, PlusCircle } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";

interface Announcement {
  id: string;
  title: string;
  description: string;
  announcement_date: string; // ISO date string
  image_url?: string;
  is_active: boolean;
}

const AnnouncementsAdmin = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentAnnouncement, setCurrentAnnouncement] = useState<Partial<Announcement> | null>(null);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [announcementToDelete, setAnnouncementToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("announcements")
      .select("*")
      .order("announcement_date", { ascending: false });

    if (error) {
      showError("Error fetching announcements: " + error.message);
    } else {
      setAnnouncements(data || []);
    }
    setLoading(false);
  };

  const handleAddClick = () => {
    setCurrentAnnouncement({
      title: "",
      description: "",
      announcement_date: format(new Date(), "yyyy-MM-dd"), // Default to today
      image_url: "",
      is_active: true,
    });
    setIsDialogOpen(true);
  };

  const handleEditClick = (announcement: Announcement) => {
    setCurrentAnnouncement({ ...announcement });
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setAnnouncementToDelete(id);
    setIsConfirmDeleteOpen(true);
  };

  const handleSaveAnnouncement = async () => {
    if (!currentAnnouncement?.title || !currentAnnouncement?.announcement_date) {
      showError("Title and Announcement Date are required.");
      return;
    }

    if (currentAnnouncement.id) {
      // Update existing announcement
      const { error } = await supabase
        .from("announcements")
        .update({
          title: currentAnnouncement.title,
          description: currentAnnouncement.description,
          announcement_date: currentAnnouncement.announcement_date,
          image_url: currentAnnouncement.image_url,
          is_active: currentAnnouncement.is_active,
        })
        .eq("id", currentAnnouncement.id);

      if (error) {
        showError("Error updating announcement: " + error.message);
      } else {
        showSuccess("Announcement updated successfully!");
        setIsDialogOpen(false);
        fetchAnnouncements();
      }
    } else {
      // Add new announcement
      const { error } = await supabase.from("announcements").insert({
        title: currentAnnouncement.title,
        description: currentAnnouncement.description,
        announcement_date: currentAnnouncement.announcement_date,
        image_url: currentAnnouncement.image_url,
        is_active: currentAnnouncement.is_active,
      });

      if (error) {
        showError("Error adding announcement: " + error.message);
      } else {
        showSuccess("Announcement added successfully!");
        setIsDialogOpen(false);
        fetchAnnouncements();
      }
    }
  };

  const confirmDelete = async () => {
    if (announcementToDelete) {
      const { error } = await supabase
        .from("announcements")
        .delete()
        .eq("id", announcementToDelete);

      if (error) {
        showError("Error deleting announcement: " + error.message);
      } else {
        showSuccess("Announcement deleted successfully!");
        fetchAnnouncements();
      }
      setIsConfirmDeleteOpen(false);
      setAnnouncementToDelete(null);
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Manage Announcements</h2>
        <Button onClick={handleAddClick}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add New Announcement
        </Button>
      </div>

      {loading ? (
        <p>Loading announcements...</p>
      ) : announcements.length === 0 ? (
        <p className="text-center text-muted-foreground">No announcements found. Click "Add New Announcement" to create one.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {announcements.map((announcement) => (
            <Card key={announcement.id}>
              {announcement.image_url && (
                <img
                  src={announcement.image_url}
                  alt={announcement.title}
                  className="w-full h-48 object-cover rounded-t-lg mb-4"
                />
              )}
              <CardHeader>
                <CardTitle className="text-xl">{announcement.title}</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  {format(parseISO(announcement.announcement_date), "PPP")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 dark:text-gray-300 mb-4">{announcement.description}</p>
                <p className="text-sm text-muted-foreground">Status: {announcement.is_active ? "Active" : "Inactive"}</p>
                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline" size="sm" onClick={() => handleEditClick(announcement)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDeleteClick(announcement.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Announcement Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{currentAnnouncement?.id ? "Edit Announcement" : "Add New Announcement"}</DialogTitle>
            <DialogDescription>
              {currentAnnouncement?.id ? "Make changes to this announcement." : "Create a new announcement."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Title
              </Label>
              <Input
                id="title"
                value={currentAnnouncement?.title || ""}
                onChange={(e) => setCurrentAnnouncement({ ...currentAnnouncement, title: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea
                id="description"
                value={currentAnnouncement?.description || ""}
                onChange={(e) => setCurrentAnnouncement({ ...currentAnnouncement, description: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="announcement_date" className="text-right">
                Date
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-[240px] justify-start text-left font-normal col-span-3",
                      !currentAnnouncement?.announcement_date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {currentAnnouncement?.announcement_date
                      ? format(parseISO(currentAnnouncement.announcement_date), "PPP")
                      : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={currentAnnouncement?.announcement_date ? parseISO(currentAnnouncement.announcement_date) : undefined}
                    onSelect={(date) =>
                      setCurrentAnnouncement({
                        ...currentAnnouncement,
                        announcement_date: date ? format(date, "yyyy-MM-dd") : "",
                      })
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="image_url" className="text-right">
                Image URL
              </Label>
              <Input
                id="image_url"
                value={currentAnnouncement?.image_url || ""}
                onChange={(e) => setCurrentAnnouncement({ ...currentAnnouncement, image_url: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="is_active" className="text-right">
                Active
              </Label>
              <Checkbox
                id="is_active"
                checked={currentAnnouncement?.is_active || false}
                onCheckedChange={(checked) => setCurrentAnnouncement({ ...currentAnnouncement, is_active: !!checked })}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveAnnouncement}>Save Announcement</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Delete Dialog */}
      <Dialog open={isConfirmDeleteOpen} onOpenChange={setIsConfirmDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this announcement? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmDeleteOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={confirmDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AnnouncementsAdmin;