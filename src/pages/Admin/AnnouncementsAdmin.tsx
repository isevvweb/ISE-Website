import React, { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { showSuccess, showError } from "@/utils/toast";
import { format, parseISO } from "date-fns";
import { CalendarIcon, Edit, Trash2, PlusCircle, UploadCloud, Loader2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { v4 as uuidv4 } from 'uuid';
import { SUPABASE_PUBLISHABLE_KEY } from "@/integrations/supabase/client"; // Import SUPABASE_PUBLISHABLE_KEY

interface Announcement {
  id: string;
  title: string;
  description: string;
  announcement_date: string; // ISO date string
  image_url?: string;
  is_active: boolean;
  posted_at?: string; // New column for precise sorting
}

const AnnouncementsAdmin = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentAnnouncement, setCurrentAnnouncement] = useState<Partial<Announcement> | null>(null);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [announcementToDelete, setAnnouncementToDelete] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("announcements")
      .select("*")
      .order("posted_at", { ascending: false }); // Sort by posted_at for newest first

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
    setSelectedFile(null);
    setIsDialogOpen(true);
  };

  const handleEditClick = (announcement: Announcement) => {
    setCurrentAnnouncement({ ...announcement });
    setSelectedFile(null); // Clear selected file when editing
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setAnnouncementToDelete(id);
    setIsConfirmDeleteOpen(true);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    } else {
      setSelectedFile(null);
    }
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!selectedFile) return currentAnnouncement?.image_url || null;

    setUploadingImage(true);
    const fileExtension = selectedFile.name.split('.').pop();
    const filePath = `announcements/${uuidv4()}.${fileExtension}`;

    const { data, error } = await supabase.storage
      .from('announcement-images')
      .upload(filePath, selectedFile, {
        cacheControl: '3600',
        upsert: false,
      });

    setUploadingImage(false);

    if (error) {
      showError("Error uploading image: " + error.message);
      return null;
    }

    const { data: publicUrlData } = supabase.storage
      .from('announcement-images')
      .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
  };

  const sendAnnouncementEmail = async (announcementData: Announcement) => {
    try {
      const response = await fetch("https://wzeyadxcbopevhuzimgf.supabase.co/functions/v1/send-announcement-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({ announcement: announcementData }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error sending announcement email:", errorData.error || "Unknown error");
        showError("Failed to send announcement emails: " + (errorData.error || "Unknown error"));
      } else {
        showSuccess("Announcement emails sent to subscribers!");
      }
    } catch (error: any) {
      console.error("Network error sending announcement email:", error);
      showError("Network error sending announcement emails: " + error.message);
    }
  };

  const handleSaveAnnouncement = async () => {
    if (!currentAnnouncement?.title || !currentAnnouncement?.announcement_date) {
      showError("Title and Announcement Date are required.");
      return;
    }

    let imageUrlToSave = currentAnnouncement.image_url;
    if (selectedFile) {
      const uploadedUrl = await uploadImage();
      if (uploadedUrl === null) {
        // If upload failed, stop the save process
        return;
      }
      imageUrlToSave = uploadedUrl;
    }

    let savedAnnouncement: Announcement | null = null;

    if (currentAnnouncement.id) {
      // Update existing announcement
      const { data, error } = await supabase
        .from("announcements")
        .update({
          title: currentAnnouncement.title,
          description: currentAnnouncement.description,
          announcement_date: currentAnnouncement.announcement_date,
          image_url: imageUrlToSave,
          is_active: currentAnnouncement.is_active,
        })
        .eq("id", currentAnnouncement.id)
        .select() // Select the updated row to get full data
        .single();

      if (error) {
        showError("Error updating announcement: " + error.message);
      } else {
        showSuccess("Announcement updated successfully!");
        savedAnnouncement = data;
      }
    } else {
      // Add new announcement
      const { data, error } = await supabase.from("announcements").insert({
        title: currentAnnouncement.title,
        description: currentAnnouncement.description,
        announcement_date: currentAnnouncement.announcement_date,
        image_url: imageUrlToSave,
        is_active: currentAnnouncement.is_active,
        // posted_at is handled by database default NOW()
      }).select().single(); // Select the inserted row to get full data

      if (error) {
        showError("Error adding announcement: " + error.message);
      } else {
        showSuccess("Announcement added successfully!");
        savedAnnouncement = data;
      }
    }

    if (savedAnnouncement) {
      setIsDialogOpen(false);
      fetchAnnouncements();
      // Send email notification if the announcement is active
      if (savedAnnouncement.is_active) {
        sendAnnouncementEmail(savedAnnouncement);
      }
    }
  };

  const confirmDelete = async () => {
    if (announcementToDelete) {
      const { data: announcementData, error: fetchError } = await supabase
        .from("announcements")
        .select("image_url")
        .eq("id", announcementToDelete)
        .single();

      if (fetchError) {
        showError("Error fetching announcement for image deletion: " + fetchError.message);
        return;
      }

      const { error } = await supabase
        .from("announcements")
        .delete()
        .eq("id", announcementToDelete);

      if (error) {
        showError("Error deleting announcement: " + error.message);
      } else {
        showSuccess("Announcement deleted successfully!");
        // Optionally delete image from storage if it exists
        if (announcementData?.image_url) {
          const imagePath = announcementData.image_url.split('announcement-images/')[1];
          if (imagePath) {
            const { error: storageError } = await supabase.storage
              .from('announcement-images')
              .remove([imagePath]);
            if (storageError) {
              console.error("Error deleting image from storage:", storageError.message);
            }
          }
        }
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
                <div className="w-full h-48 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-t-lg overflow-hidden">
                  <img
                    src={announcement.image_url}
                    alt={announcement.title}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
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
              <Label htmlFor="image_upload" className="text-right">
                Image
              </Label>
              <div className="col-span-3 flex flex-col gap-2">
                <Input
                  id="image_upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  ref={fileInputRef}
                />
                {(selectedFile || currentAnnouncement?.image_url) && (
                  <div className="mt-2 w-full h-32 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-md overflow-hidden">
                    <img
                      src={selectedFile ? URL.createObjectURL(selectedFile) : currentAnnouncement?.image_url}
                      alt="Announcement Image Preview"
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                )}
                {uploadingImage && (
                  <div className="flex items-center text-sm text-muted-foreground mt-2">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading image...
                  </div>
                )}
              </div>
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
            <Button onClick={handleSaveAnnouncement} disabled={uploadingImage}>
              {uploadingImage ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                </>
              ) : (
                "Save Announcement"
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