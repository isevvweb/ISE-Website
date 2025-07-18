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

interface BoardMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  image_url?: string;
  email?: string;
  phone?: string;
  display_order: number;
}

const BoardMembersAdmin = () => {
  const [boardMembers, setBoardMembers] = useState<BoardMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentMember, setCurrentMember] = useState<Partial<BoardMember> | null>(null);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    fetchBoardMembers();
  }, []);

  const fetchBoardMembers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("board_members")
      .select("*")
      .order("display_order", { ascending: true });

    if (error) {
      showError("Error fetching board members: " + error.message);
      setBoardMembers([]);
    } else {
      setBoardMembers(data || []);
    }
    setLoading(false);
  };

  const handleAddClick = () => {
    setCurrentMember({
      name: "",
      role: "",
      bio: "",
      image_url: "",
      email: "",
      phone: "",
      display_order: boardMembers.length > 0 ? Math.max(...boardMembers.map(m => m.display_order)) + 1 : 1,
    });
    setSelectedFile(null);
    setIsDialogOpen(true);
  };

  const handleEditClick = (member: BoardMember) => {
    setCurrentMember({ ...member });
    setSelectedFile(null);
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setMemberToDelete(id);
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
    if (!selectedFile) return currentMember?.image_url || null;

    setUploadingImage(true);
    const fileExtension = selectedFile.name.split('.').pop();
    const filePath = `board-member-images/${uuidv4()}.${fileExtension}`;

    const { data, error } = await supabase.storage
      .from('board-member-images')
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
      .from('board-member-images')
      .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
  };

  const handleSaveMember = async () => {
    if (!currentMember?.name || !currentMember?.role || !currentMember?.bio) {
      showError("Name, Role, and Bio are required.");
      return;
    }

    setSaving(true);
    let imageUrlToSave = currentMember.image_url;

    try {
      if (selectedFile) {
        const uploadedUrl = await uploadImage();
        if (uploadedUrl === null) {
          setSaving(false); // Stop saving if image upload failed
          return;
        }
        imageUrlToSave = uploadedUrl;
      }

      if (currentMember.id) {
        const { error } = await supabase
          .from("board_members")
          .update({
            name: currentMember.name,
            role: currentMember.role,
            bio: currentMember.bio,
            image_url: imageUrlToSave,
            email: currentMember.email,
            phone: currentMember.phone,
            display_order: currentMember.display_order,
          })
          .eq("id", currentMember.id);

        if (error) throw error;
        showSuccess("Board member updated successfully!");
      } else {
        const { error } = await supabase.from("board_members").insert({
          name: currentMember.name,
          role: currentMember.role,
          bio: currentMember.bio,
          image_url: imageUrlToSave,
          email: currentMember.email,
          phone: currentMember.phone,
          display_order: currentMember.display_order,
        });

        if (error) throw error;
        showSuccess("Board member added successfully!");
      }
      setIsDialogOpen(false);
    } catch (error: any) {
      showError("Error saving board member: " + error.message);
    } finally {
      setSaving(false);
      fetchBoardMembers(); // Re-fetch to update the list
      queryClient.invalidateQueries({ queryKey: ["boardMembers"] }); // Invalidate public query
    }
  };

  const confirmDelete = async () => {
    if (memberToDelete) {
      setSaving(true);
      try {
        const { data: memberData, error: fetchError } = await supabase
          .from("board_members")
          .select("image_url")
          .eq("id", memberToDelete)
          .single();

        if (fetchError) throw fetchError;

        const { error } = await supabase
          .from("board_members")
          .delete()
          .eq("id", memberToDelete);

        if (error) throw error;
        showSuccess("Board member deleted successfully!");

        if (memberData?.image_url) {
          const imagePath = memberData.image_url.split('board-member-images/')[1];
          if (imagePath) {
            const { error: storageError } = await supabase.storage
              .from('board-member-images')
              .remove([imagePath]);
            if (storageError) {
              console.error("Error deleting image from storage:", storageError.message);
            }
          }
        }
      } catch (error: any) {
        showError("Error deleting board member: " + error.message);
      } finally {
        setIsConfirmDeleteOpen(false);
        setMemberToDelete(null);
        setSaving(false);
        fetchBoardMembers(); // Re-fetch to update the list
        queryClient.invalidateQueries({ queryKey: ["boardMembers"] }); // Invalidate public query
      }
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Manage Board Members</h2>
        <Button onClick={handleAddClick}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add New Member
        </Button>
      </div>

      {loading ? (
        <p>Loading board members...</p>
      ) : boardMembers.length === 0 ? (
        <p className="text-center text-muted-foreground">No board members found. Click "Add New Member" to create one.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {boardMembers.map((member) => (
            <Card key={member.id}>
              {member.image_url && (
                <div className="w-full h-48 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-t-lg overflow-hidden">
                  <img
                    src={member.image_url}
                    alt={member.name}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-xl">{member.name}</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  {member.role}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 dark:text-gray-300 mb-4">{member.bio}</p>
                {member.email && <p className="text-sm text-muted-foreground">Email: {member.email}</p>}
                {member.phone && <p className="text-sm text-muted-foreground">Phone: {member.phone}</p>}
                <p className="text-sm text-muted-foreground">Order: {member.display_order}</p>
                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline" size="sm" onClick={() => handleEditClick(member)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDeleteClick(member.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Board Member Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{currentMember?.id ? "Edit Board Member" : "Add New Board Member"}</DialogTitle>
            <DialogDescription>
              {currentMember?.id ? "Make changes to this board member's information." : "Add a new board member."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={currentMember?.name || ""}
                onChange={(e) => setCurrentMember({ ...currentMember, name: e.target.value })}
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
                value={currentMember?.role || ""}
                onChange={(e) => setCurrentMember({ ...currentMember, role: e.target.value })}
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
                value={currentMember?.bio || ""}
                onChange={(e) => setCurrentMember({ ...currentMember, bio: e.target.value })}
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
                value={currentMember?.email || ""}
                onChange={(e) => setCurrentMember({ ...currentMember, email: e.target.value })}
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
                value={currentMember?.phone || ""}
                onChange={(e) => setCurrentMember({ ...currentMember, phone: e.target.value })}
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
                value={currentMember?.display_order || ""}
                onChange={(e) => setCurrentMember({ ...currentMember, display_order: parseInt(e.target.value) || 0 })}
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
                {(selectedFile || currentMember?.image_url) && (
                  <div className="mt-2 w-full h-32 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-md overflow-hidden">
                    <img
                      src={selectedFile ? URL.createObjectURL(selectedFile) : currentMember?.image_url}
                      alt="Board Member Image Preview"
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
            <Button onClick={handleSaveMember} disabled={saving || uploadingImage}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                </>
              ) : (
                "Save Member"
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
              Are you sure you want to delete this board member? This action cannot be undone.
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

export default BoardMembersAdmin;