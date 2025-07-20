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
import { CalendarIcon, Edit, Trash2, PlusCircle, Loader2, ImagePlus, XCircle } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { v4 as uuidv4 } from 'uuid';
import { useQueryClient } from "@tanstack/react-query";

interface EventImage {
  url: string;
  caption: string;
}

interface PastYouthEvent {
  id: string;
  title: string;
  description: string;
  event_date: string; // ISO date string
  images: EventImage[];
  display_order: number;
  created_at?: string;
}

const YouthEventsAdmin = () => {
  const [events, setEvents] = useState<PastYouthEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<Partial<PastYouthEvent> | null>(null);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState<string | null>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("past_youth_events")
      .select("*")
      .order("event_date", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      showError("Error fetching past youth events: " + error.message);
    } else {
      setEvents(data || []);
    }
    setLoading(false);
  };

  const handleAddClick = () => {
    setCurrentEvent({
      title: "",
      description: "",
      event_date: format(new Date(), "yyyy-MM-dd"),
      images: [],
      display_order: events.length > 0 ? Math.max(...events.map(e => e.display_order || 0)) + 1 : 1,
    });
    setSelectedFiles([]);
    setIsDialogOpen(true);
  };

  const handleEditClick = (event: PastYouthEvent) => {
    setCurrentEvent({ ...event });
    setSelectedFiles([]); // Clear selected files when editing
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setEventToDelete(id);
    setIsConfirmDeleteOpen(true);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setSelectedFiles(Array.from(event.target.files));
    } else {
      setSelectedFiles([]);
    }
  };

  const handleImageCaptionChange = (index: number, caption: string) => {
    if (currentEvent?.images) {
      const updatedImages = [...currentEvent.images];
      updatedImages[index] = { ...updatedImages[index], caption };
      setCurrentEvent({ ...currentEvent, images: updatedImages });
    }
  };

  const handleRemoveExistingImage = (index: number) => {
    if (currentEvent?.images) {
      const updatedImages = currentEvent.images.filter((_, i) => i !== index);
      setCurrentEvent({ ...currentEvent, images: updatedImages });
    }
  };

  const uploadImages = async (): Promise<EventImage[] | null> => {
    setUploadingImages(true);
    const uploadedImageUrls: EventImage[] = [];
    const filesToUpload = selectedFiles;

    for (const file of filesToUpload) {
      const fileExtension = file.name.split('.').pop();
      const filePath = `youth-event-images/${uuidv4()}.${fileExtension}`;

      const { data, error } = await supabase.storage
        .from('youth-event-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        showError(`Error uploading image ${file.name}: ${error.message}`);
        setUploadingImages(false);
        return null;
      }

      const { data: publicUrlData } = supabase.storage
        .from('youth-event-images')
        .getPublicUrl(filePath);

      uploadedImageUrls.push({ url: publicUrlData.publicUrl, caption: "" }); // Add with empty caption initially
    }

    setUploadingImages(false);
    return uploadedImageUrls;
  };

  const handleSaveEvent = async () => {
    if (!currentEvent?.title || !currentEvent?.event_date) {
      showError("Title and Event Date are required.");
      return;
    }

    setSaving(true);
    let combinedImages: EventImage[] = currentEvent.images || [];

    try {
      if (selectedFiles.length > 0) {
        const newUploadedImages = await uploadImages();
        if (newUploadedImages === null) {
          setSaving(false);
          return;
        }
        combinedImages = [...combinedImages, ...newUploadedImages];
      }

      if (currentEvent.id) {
        // Update existing event
        const { error } = await supabase
          .from("past_youth_events")
          .update({
            title: currentEvent.title,
            description: currentEvent.description,
            event_date: currentEvent.event_date,
            images: combinedImages,
            display_order: currentEvent.display_order,
          })
          .eq("id", currentEvent.id);

        if (error) throw error;
        showSuccess("Past youth event updated successfully!");
      } else {
        // Add new event
        const { error } = await supabase.from("past_youth_events").insert({
          title: currentEvent.title,
          description: currentEvent.description,
          event_date: currentEvent.event_date,
          images: combinedImages,
          display_order: currentEvent.display_order,
        });

        if (error) throw error;
        showSuccess("Past youth event added successfully!");
      }
      setIsDialogOpen(false);
    } catch (error: any) {
      showError("Error saving event: " + error.message);
    } finally {
      setSaving(false);
      fetchEvents(); // Re-fetch to update the list
      queryClient.invalidateQueries({ queryKey: ["pastYouthEvents"] }); // Invalidate public query
    }
  };

  const confirmDelete = async () => {
    if (eventToDelete) {
      setSaving(true);
      try {
        // Fetch the event to get image URLs before deleting the record
        const { data: eventData, error: fetchError } = await supabase
          .from("past_youth_events")
          .select("images")
          .eq("id", eventToDelete)
          .single();

        if (fetchError) throw fetchError;

        const { error } = await supabase
          .from("past_youth_events")
          .delete()
          .eq("id", eventToDelete);

        if (error) throw error;
        showSuccess("Past youth event deleted successfully!");

        // Delete images from storage if they exist
        if (eventData?.images && eventData.images.length > 0) {
          const pathsToDelete = eventData.images.map((img: EventImage) => {
            const parts = img.url.split('youth-event-images/');
            return parts.length > 1 ? parts[1] : null;
          }).filter(Boolean);

          if (pathsToDelete.length > 0) {
            const { error: storageError } = await supabase.storage
              .from('youth-event-images')
              .remove(pathsToDelete as string[]);
            if (storageError) {
              console.error("Error deleting images from storage:", storageError.message);
            }
          }
        }
      } catch (error: any) {
        showError("Error deleting event: " + error.message);
      } finally {
        setIsConfirmDeleteOpen(false);
        setEventToDelete(null);
        setSaving(false);
        fetchEvents(); // Re-fetch to update the list
        queryClient.invalidateQueries({ queryKey: ["pastYouthEvents"] }); // Invalidate public query
      }
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Manage Past Youth Events</h2>
        <Button onClick={handleAddClick}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add New Event
        </Button>
      </div>

      {loading ? (
        <p>Loading past youth events...</p>
      ) : events.length === 0 ? (
        <p className="text-center text-muted-foreground">No past youth events found. Click "Add New Event" to create one.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <Card key={event.id}>
              {event.images && event.images.length > 0 && (
                <div className="w-full h-48 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-t-lg overflow-hidden">
                  <img
                    src={event.images[0].url} // Display first image as thumbnail
                    alt={event.images[0].caption || event.title}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-xl">{event.title}</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  {format(parseISO(event.event_date), "PPP")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 dark:text-gray-300 mb-4 line-clamp-3">{event.description}</p>
                <p className="text-sm text-muted-foreground">Images: {event.images?.length || 0}</p>
                <p className="text-sm text-muted-foreground">Order: {event.display_order}</p>
                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline" size="sm" onClick={() => handleEditClick(event)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDeleteClick(event.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Event Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>{currentEvent?.id ? "Edit Past Youth Event" : "Add New Past Youth Event"}</DialogTitle>
            <DialogDescription>
              {currentEvent?.id ? "Make changes to this event." : "Create a new past youth event."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Title
              </Label>
              <Input
                id="title"
                value={currentEvent?.title || ""}
                onChange={(e) => setCurrentEvent({ ...currentEvent, title: e.target.value })}
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
                value={currentEvent?.description || ""}
                onChange={(e) => setCurrentEvent({ ...currentEvent, description: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="event_date" className="text-right">
                Date
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-[240px] justify-start text-left font-normal col-span-3",
                      !currentEvent?.event_date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {currentEvent?.event_date
                      ? format(parseISO(currentEvent.event_date), "PPP")
                      : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={currentEvent?.event_date ? parseISO(currentEvent.event_date) : undefined}
                    onSelect={(date) =>
                      setCurrentEvent({
                        ...currentEvent,
                        event_date: date ? format(date, "yyyy-MM-dd") : "",
                      })
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="display_order" className="text-right">
                Display Order
              </Label>
              <Input
                id="display_order"
                type="number"
                value={currentEvent?.display_order || ""}
                onChange={(e) => setCurrentEvent({ ...currentEvent, display_order: parseInt(e.target.value) || 0 })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="image_upload" className="text-right pt-2">
                Images
              </Label>
              <div className="col-span-3 flex flex-col gap-4">
                {/* Existing Images */}
                {currentEvent?.images && currentEvent.images.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Current Images:</p>
                    {currentEvent.images.map((img, index) => (
                      <div key={index} className="flex items-center gap-2 border rounded-md p-2">
                        <img src={img.url} alt="Preview" className="w-16 h-16 object-cover rounded-sm" />
                        <Input
                          value={img.caption}
                          onChange={(e) => handleImageCaptionChange(index, e.target.value)}
                          placeholder="Image caption"
                          className="flex-grow"
                        />
                        <Button variant="ghost" size="icon" onClick={() => handleRemoveExistingImage(index)}>
                          <XCircle className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {/* New Image Upload */}
                <div className="flex flex-col gap-2">
                  <Input
                    id="image_upload"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFileChange}
                    ref={fileInputRef}
                  />
                  {selectedFiles.length > 0 && (
                    <div className="mt-2 space-y-2">
                      <p className="text-sm font-medium">New files to upload:</p>
                      {selectedFiles.map((file, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <ImagePlus className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">{file.name}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {uploadingImages && (
                    <div className="flex items-center text-sm text-muted-foreground mt-2">
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading images...
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveEvent} disabled={saving || uploadingImages}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                </>
              ) : (
                "Save Event"
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
              Are you sure you want to delete this past youth event? This will also delete all associated images. This action cannot be undone.
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

export default YouthEventsAdmin;