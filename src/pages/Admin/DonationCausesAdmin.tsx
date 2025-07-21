import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { showSuccess, showError } from "@/utils/toast";
import { Edit, Trash2, PlusCircle, Loader2, DollarSign, Handshake, BookOpen, Home, Heart, Gift, PiggyBank, GraduationCap } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DonationCause {
  id: string;
  title: string;
  description?: string;
  icon_name?: string; // Stores Lucide icon name
  payment_link: string;
  display_order?: number;
  created_at?: string;
}

// Map of Lucide icon names to their components
const lucideIcons: { [key: string]: React.ElementType } = {
  DollarSign,
  Handshake,
  BookOpen,
  Home,
  Heart,
  Gift,
  PiggyBank,
  GraduationCap,
};

const DonationCausesAdmin = () => {
  const [causes, setCauses] = useState<DonationCause[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentCause, setCurrentCause] = useState<Partial<DonationCause> | null>(null);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [causeToDelete, setCauseToDelete] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const queryClient = useQueryClient();

  const fetchDonationCauses = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("donation_causes")
      .select("*")
      .order("display_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) {
      showError("Error fetching donation causes: " + error.message);
    } else {
      setCauses(data || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchDonationCauses();
  }, [fetchDonationCauses]);

  const handleAddClick = useCallback(() => {
    setCurrentCause({
      title: "",
      description: "",
      icon_name: "DollarSign", // Default icon
      payment_link: "",
      display_order: causes.length > 0 ? Math.max(...causes.map(c => c.display_order || 0)) + 1 : 1,
    });
    setIsDialogOpen(true);
  }, [causes]);

  const handleEditClick = useCallback((cause: DonationCause) => {
    setCurrentCause({ ...cause });
    setIsDialogOpen(true);
  }, []);

  const handleDeleteClick = useCallback((id: string) => {
    setCauseToDelete(id);
    setIsConfirmDeleteOpen(true);
  }, []);

  const handleSaveCause = useCallback(async () => {
    if (!currentCause?.title || !currentCause?.payment_link) {
      showError("Title and Payment Link are required.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: currentCause.title,
        description: currentCause.description,
        icon_name: currentCause.icon_name,
        payment_link: currentCause.payment_link,
        display_order: currentCause.display_order,
      };

      if (currentCause.id) {
        // Update existing cause
        const { error } = await supabase
          .from("donation_causes")
          .update(payload)
          .eq("id", currentCause.id);

        if (error) throw error;
        showSuccess("Donation cause updated successfully!");
      } else {
        // Add new cause
        const { error } = await supabase.from("donation_causes").insert(payload);

        if (error) throw error;
        showSuccess("Donation cause added successfully!");
      }
      setIsDialogOpen(false);
    } catch (error: any) {
      showError("Error saving donation cause: " + error.message);
    } finally {
      setSaving(false);
      fetchDonationCauses(); // Re-fetch to update the list
      queryClient.invalidateQueries({ queryKey: ["donationCauses"] }); // Invalidate public query
    }
  }, [currentCause, fetchDonationCauses, queryClient]);

  const confirmDelete = useCallback(async () => {
    if (causeToDelete) {
      setSaving(true);
      try {
        const { error } = await supabase
          .from("donation_causes")
          .delete()
          .eq("id", causeToDelete);

        if (error) throw error;
        showSuccess("Donation cause deleted successfully!");
      } catch (error: any) {
        showError("Error deleting donation cause: " + error.message);
      } finally {
        setIsConfirmDeleteOpen(false);
        setCauseToDelete(null);
        setSaving(false);
        fetchDonationCauses(); // Re-fetch to update the list
        queryClient.invalidateQueries({ queryKey: ["donationCauses"] }); // Invalidate public query
      }
    }
  }, [causeToDelete, fetchDonationCauses, queryClient]);

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Manage Donation Causes</h2>
        <Button onClick={handleAddClick}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add New Cause
        </Button>
      </div>

      {loading ? (
        <p>Loading donation causes...</p>
      ) : causes.length === 0 ? (
        <p className="text-center text-muted-foreground">No donation causes found. Click "Add New Cause" to create one.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {causes.map((cause) => {
            const IconComponent = cause.icon_name ? lucideIcons[cause.icon_name] : DollarSign;
            return (
              <Card key={cause.id}>
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    {IconComponent && <IconComponent className="h-6 w-6 text-primary" />}
                    {cause.title}
                  </CardTitle>
                  <CardDescription className="text-sm text-muted-foreground">
                    Order: {cause.display_order}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 dark:text-gray-300 mb-2 line-clamp-3">{cause.description}</p>
                  <p className="text-sm text-muted-foreground truncate">Link: <a href={cause.payment_link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{cause.payment_link}</a></p>
                  <div className="flex justify-end gap-2 mt-4">
                    <Button variant="outline" size="sm" onClick={() => handleEditClick(cause)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDeleteClick(cause.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add/Edit Cause Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{currentCause?.id ? "Edit Donation Cause" : "Add New Donation Cause"}</DialogTitle>
            <DialogDescription>
              {currentCause?.id ? "Make changes to this donation cause." : "Add a new donation cause."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Title
              </Label>
              <Input
                id="title"
                value={currentCause?.title || ""}
                onChange={(e) => setCurrentCause({ ...currentCause, title: e.target.value })}
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
                value={currentCause?.description || ""}
                onChange={(e) => setCurrentCause({ ...currentCause, description: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="icon_name" className="text-right">
                Icon
              </Label>
              <Select
                value={currentCause?.icon_name || ""}
                onValueChange={(value) => setCurrentCause({ ...currentCause, icon_name: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select an icon" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(lucideIcons).map((iconName) => {
                    const IconComponent = lucideIcons[iconName];
                    return (
                      <SelectItem key={iconName} value={iconName}>
                        <div className="flex items-center gap-2">
                          <IconComponent className="h-4 w-4" /> {iconName}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="payment_link" className="text-right">
                Payment Link
              </Label>
              <Input
                id="payment_link"
                type="url"
                value={currentCause?.payment_link || ""}
                onChange={(e) => setCurrentCause({ ...currentCause, payment_link: e.target.value })}
                className="col-span-3"
                placeholder="https://example.com/donate"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="display_order" className="text-right">
                Display Order
              </Label>
              <Input
                id="display_order"
                type="number"
                value={currentCause?.display_order || ""}
                onChange={(e) => setCurrentCause({ ...currentCause, display_order: parseInt(e.target.value) || 0 })}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveCause} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                </>
              ) : (
                "Save Cause"
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
              Are you sure you want to delete this donation cause? This action cannot be undone.
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

export default DonationCausesAdmin;