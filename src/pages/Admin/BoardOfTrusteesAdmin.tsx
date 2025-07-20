import React, { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { showSuccess, showError } from "@/utils/toast";
import { Edit, Trash2, PlusCircle, Loader2 } from "lucide-react";
import { v4 as uuidv4 } from 'uuid';
import { useQueryClient } from "@tanstack/react-query";

interface Trustee {
  id: string;
  name: string;
  role: string;
  bio: string;
  image_url?: string;
  email?: string;
  phone?: string;
  display_order: number;
}

const BoardOfTrusteesAdmin = () => {
  console.log("BoardOfTrusteesAdmin component rendered.");
  const [trustees, setTrustees] = useState<Trustee[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentTrustee, setCurrentTrustee] = useState<Partial<Trustee> | null>(null);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [trusteeToDelete, setTrusteeToDelete] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    fetchTrustees();
  }, []);

  const fetchTrustees = async () => {
    setLoading(true);
    console.log("Fetching admin trustees...");
    const { data, error } = await supabase
      .from("board_of_trustees")
      .select("*")
      .order("display_order", { ascending: true });

    if (error) {
      console.error("Error in fetchTrustees (Admin):", error.message);
      showError("Error fetching board of trustees: " + error.message);
      setTrustees([]);
    } else {
      console.log("Admin trustees fetched:", data);
      setTrustees(data || []);
    }
    setLoading(false);
  };

  const handleAddClick = () => {
    setCurrentTrustee({
      name: "",
      role: "",
      bio: "",
      image_url: "",
      email: "",
      phone: "",
      display_order: trustees.length > 0 ? Math.max(...trustees.map(t => t.display_order)) + 1 : 1,
    });
    setSelectedFile(null);
    setIsDialogOpen(true);
  };

  const handleEditClick = (trustee: Trustee) => {
    setCurrentTrustee({ ...trustee });
    setSelectedFile(null);
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setTrusteeToDelete(id);
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
    if (!selectedFile) return currentTrustee?.image_url || null;

    setUploadingImage(true);
    const fileExtension = selectedFile.name.split('.').pop();
    const filePath = `trustee-images/${uuidv4()}.${fileExtension}`;

    console.log("Uploading image to Supabase Storage:", filePath);
    const { data, error } = await supabase.storage
      .from('trustee-images')
      .upload(filePath, selectedFile, {
        cacheControl: '3600',
        upsert: false,
      });

    setUploadingImage(false);

    if (error) {
      console.error("Error uploading image:", error.message);
      showError("Error uploading image: " + error.message);
      return null;
    }

    const { data: publicUrlData } = supabase.storage
      .from('trustee-images')
      .getPublicUrl(filePath);

    console.log("Image uploaded, public URL:", publicUrlData.publicUrl);
    return publicUrlData.publicUrl;
  };

  const handleSaveTrustee = async () => {
    if (!currentTrustee?.name || !currentTrustee?.role || !currentTrustee?.bio) {
      showError("Name, Role, and Bio are required.");
      return;
    }

    setSaving(true);
    let imageUrlToSave = currentTrustee.image_url;

    try {
      if (selectedFile) {
        const uploadedUrl = await uploadImage();
        if (uploadedUrl === null) {
          setSaving(false); // Stop saving if image upload failed
          return;
        }
        imageUrlToSave = uploadedUrl;
      }

      if (currentTrustee.id) {
        console.log("Updating trustee:", currentTrustee.id);
        const { error } = await supabase
          .from("board_of_trustees")
          .update({
            name: currentTrustee.name,
            role: currentTrustee.role,
            bio: currentTrustee.bio,
            image_url: imageUrlToSave,
            email: currentTrustee.email,
            phone: currentTrustee.phone,
            display_order: currentTrustee.display_order,
          })
          .eq("id", currentTrustee.id);

        if (error) throw error;
        showSuccess("Trustee updated successfully!");
      } else {
        console.log("Adding new trustee.");
        const { error } = await supabase.from("board_of_trustees").insert({
          name: currentTrustee.name,
          role: currentTrustee.role,
          bio: currentTrustee.bio,
          image_url: imageUrlToSave,
          email: currentTrustee.email,
          phone: currentTrustee.phone,
          display_order: currentTrustee.display_order,
        });

        if (error) throw error;
        showSuccess("Trustee added successfully!");
      }
      setIsDialogOpen(false);
    } catch (error: any) {
      console.error("Error saving trustee:", error.message);
      showError("Error saving trustee: " + error.message);
    } finally {
      setSaving(false);
      fetchTrustees(); // Re-fetch to update the list
      queryClient.invalidateQueries({ queryKey: ["trustees"] }); // Invalidate public query
    }
  };

  const confirmDelete = async () => {
    if (trusteeToDelete) {
      setSaving(true);
      try {
        console.log("Fetching trustee for image deletion:", trusteeToDelete);
        const { data: trusteeData, error: fetchError } = await supabase
          .from("board_of_trustees")
          .select("image_url")
          .eq("id", trusteeToDelete)
          .single();

        if (fetchError) throw fetchError;

        console.log("Deleting trustee:", trusteeToDelete);
        const { error } = await supabase
          .from("board_of_trustees")
          .delete()
          .eq("id", trusteeToDelete);

        if (error) throw error;
        showSuccess("Trustee deleted successfully!");

        if (trusteeData?.image_url) {
          const imagePath = trusteeData.image_url.split('trustee-images/')[1];
          if (imagePath) {
            console.log("Deleting image from storage:", imagePath);
            const { error: storageError } = await supabase.storage
              .from('trustee-images')
              .remove([imagePath]);
            if (storageError) {
              console.error("Error deleting image from storage:", storageError.message);
            }
          }
        }
      } catch (error: any) {
        console.error("Error deleting trustee:", error.message);
        showError("Error deleting trustee: " + error.message);
      } finally {
        setIsConfirmDeleteOpen(false);
        setTrusteeToDelete(null);
        setSaving(false);
        fetchTrustees(); // Re-fetch to update the list
        queryClient.invalidateQueries({ queryKey: ["trustees"] }); // Invalidate public query
      }
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Manage Board of Trustees</h2>
        <Button onClick={handleAddClick}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add New Trustee
        </Button>
      </div>

      {loading ? (
        <p>Loading board of trustees...</p>
      ) : trustees.length === 0 ? (
        <p className="text-center text-muted-foreground">No board of trustees members found. Click "Add New Trustee" to create one.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {trustees.map((trustee) => (
            <Card key={trustee.id}>
              {trustee.image_url && (
                <div className="w-full h-48 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-t-lg overflow-hidden">
                  <img
                    src={trustee.image_url}
                    alt={trustee.name}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-xl">{trustee.name}</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  {trustee.role}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 dark:text-gray-300 mb-4">{trustee.bio}</p>
                {trustee.email && <p className="text-sm text-muted-foreground">Email: {trustee.email}</p>}
                {trustee.phone && <p className="text-sm text-muted-foreground">Phone: {trustee.phone}</p>}
                <p className="text-sm text-muted-foreground">Order: {trustee.display_order}</p>
                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline" size="sm" onClick={() => handleEditClick(trustee)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDeleteClick(trustee.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Trustee Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{currentTrustee?.id ? "Edit Trustee" : "Add New Trustee"}</DialogTitle>
            <DialogDescription>
              {currentTrustee?.id ? "Make changes to this trustee's information." : "Add a new trustee."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={currentTrustee?.name || ""}
                onChange={(e) => setCurrentTrustee({ ...currentTrustee, name: e.target.value })}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">
                Role
              </Label>
              <Input
                id="role"
                value={currentTrustee?.role || ""}
                onChange={(e) => setCurrentTrustee({ ...currentTrustee, role: e.target.value })}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="bio" className="text-right">
                Bio
              </Label>
              <Textarea
                id="bio"
                value={currentTrustee?.bio || ""}
                onChange={(e) => setCurrentTrustee({ ...currentTrustee, bio: e.target.value })}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={currentTrustee?.email || ""}
                onChange={(e) => setCurrentTrustee({ ...currentTrustee, email: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">
                Phone
              </Label>
              <Input
                id="phone"
                type="tel"
                value={currentTrustee?.phone || ""}
                onChange={(e) => setCurrentTrustee({ ...currentTrustee, phone: e.target.value })}
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
                value={currentTrustee?.display_order || ""}
                onChange={(e) => setCurrentTrustee({ ...currentTrustee, display_order: parseInt(e.target.value) || 0 })}
                className="col-span-3"
              />
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
                {(selectedFile || currentTrustee?.image_url) && (
                  <div className="mt-2 w-full h-32 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-md overflow-hidden">
                    <img
                      src={selectedFile ? URL.createObjectURL(selectedFile) : currentTrustee?.image_url}
                      alt="Trustee Image Preview"
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
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveTrustee} disabled={saving || uploadingImage}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                </>
              ) : (
                "Save Trustee"
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
              Are you sure you want to delete this trustee? This action cannot be undone.
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

export default BoardOfTrusteesAdmin;