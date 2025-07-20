import React, { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { showSuccess, showError } from "@/utils/toast";
import { Edit, Trash2, PlusCircle, UploadCloud, Loader2, FileText } from "lucide-react";
import { v4 as uuidv4 } from 'uuid';
import { useQueryClient } from "@tanstack/react-query";

interface AnnualReport {
  id: string;
  year: number;
  file_url: string;
  created_at?: string;
}

const AnnualReportsAdmin = () => {
  const [reports, setReports] = useState<AnnualReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentReport, setCurrentReport] = useState<Partial<AnnualReport> | null>(null);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [reportToDelete, setReportToDelete] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    fetchAnnualReports();
  }, []);

  const fetchAnnualReports = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("annual_reports")
      .select("*")
      .order("year", { ascending: false });

    if (error) {
      showError("Error fetching annual reports: " + error.message);
    } else {
      setReports(data || []);
    }
    setLoading(false);
  };

  const handleAddClick = () => {
    setCurrentReport({
      year: new Date().getFullYear(), // Default to current year
      file_url: "",
    });
    setSelectedFile(null);
    setIsDialogOpen(true);
  };

  const handleEditClick = (report: AnnualReport) => {
    setCurrentReport({ ...report });
    setSelectedFile(null); // Clear selected file when editing
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setReportToDelete(id);
    setIsConfirmDeleteOpen(true);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    } else {
      setSelectedFile(null);
    }
  };

  const uploadFile = async (): Promise<string | null> => {
    if (!selectedFile) return currentReport?.file_url || null;

    setUploadingFile(true);
    const fileExtension = selectedFile.name.split('.').pop();
    const filePath = `reports/${uuidv4()}.${fileExtension}`;

    const { data, error } = await supabase.storage
      .from('annual-reports')
      .upload(filePath, selectedFile, {
        cacheControl: '3600',
        upsert: false,
      });

    setUploadingFile(false);

    if (error) {
      showError("Error uploading file: " + error.message);
      return null;
    }

    const { data: publicUrlData } = supabase.storage
      .from('annual-reports')
      .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
  };

  const handleSaveReport = async () => {
    if (!currentReport?.year || !selectedFile && !currentReport?.file_url) {
      showError("Year and a PDF file are required.");
      return;
    }

    setSaving(true);
    let fileUrlToSave = currentReport.file_url;

    try {
      if (selectedFile) {
        const uploadedUrl = await uploadFile();
        if (uploadedUrl === null) {
          setSaving(false); // Stop saving if file upload failed
          return;
        }
        fileUrlToSave = uploadedUrl;
      }

      if (currentReport.id) {
        // Update existing report
        const { error } = await supabase
          .from("annual_reports")
          .update({
            year: currentReport.year,
            file_url: fileUrlToSave,
          })
          .eq("id", currentReport.id);

        if (error) throw error;
        showSuccess("Annual report updated successfully!");
      } else {
        // Add new report
        const { error } = await supabase.from("annual_reports").insert({
          year: currentReport.year,
          file_url: fileUrlToSave,
        });

        if (error) throw error;
        showSuccess("Annual report added successfully!");
      }
      setIsDialogOpen(false);
    } catch (error: any) {
      showError("Error saving annual report: " + error.message);
    } finally {
      setSaving(false);
      fetchAnnualReports(); // Re-fetch to update the list
      queryClient.invalidateQueries({ queryKey: ["annualReports"] }); // Invalidate public query
    }
  };

  const confirmDelete = async () => {
    if (reportToDelete) {
      setSaving(true);
      try {
        // Fetch the file_url before deleting the record
        const { data: reportData, error: fetchError } = await supabase
          .from("annual_reports")
          .select("file_url")
          .eq("id", reportToDelete)
          .single();

        if (fetchError) throw fetchError;

        const { error } = await supabase
          .from("annual_reports")
          .delete()
          .eq("id", reportToDelete);

        if (error) throw error;
        showSuccess("Annual report deleted successfully!");

        // Delete the file from storage if it exists
        if (reportData?.file_url) {
          const filePath = reportData.file_url.split('annual-reports/')[1];
          if (filePath) {
            const { error: storageError } = await supabase.storage
              .from('annual-reports')
              .remove([filePath]);
            if (storageError) {
              console.error("Error deleting file from storage:", storageError.message);
            }
          }
        }
      } catch (error: any) {
        showError("Error deleting annual report: " + error.message);
      } finally {
        setIsConfirmDeleteOpen(false);
        setReportToDelete(null);
        setSaving(false);
        fetchAnnualReports(); // Re-fetch to update the list
        queryClient.invalidateQueries({ queryKey: ["annualReports"] }); // Invalidate public query
      }
    }
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Manage Annual Reports</h2>
        <Button onClick={handleAddClick}>
          <PlusCircle className="mr-2 h-4 w-4" /> Add New Report
        </Button>
      </div>

      {loading ? (
        <p>Loading annual reports...</p>
      ) : reports.length === 0 ? (
        <p className="text-center text-muted-foreground">No annual reports found. Click "Add New Report" to upload one.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {reports.map((report) => (
            <Card key={report.id}>
              <CardHeader>
                <CardTitle className="text-xl">Annual Report {report.year}</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  Uploaded: {new Date(report.created_at || "").toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="h-5 w-5 text-primary" />
                  <a href={report.file_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm truncate">
                    View PDF
                  </a>
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline" size="sm" onClick={() => handleEditClick(report)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDeleteClick(report.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit Report Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{currentReport?.id ? "Edit Annual Report" : "Add New Annual Report"}</DialogTitle>
            <DialogDescription>
              {currentReport?.id ? "Update the PDF file or year for this report." : "Upload a new annual report PDF."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="year" className="text-right">
                Year
              </Label>
              <Input
                id="year"
                type="number"
                value={currentReport?.year || ""}
                onChange={(e) => setCurrentReport({ ...currentReport, year: parseInt(e.target.value) || 0 })}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="pdf_file" className="text-right">
                PDF File
              </Label>
              <div className="col-span-3 flex flex-col gap-2">
                <Input
                  id="pdf_file"
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  ref={fileInputRef}
                />
                {currentReport?.file_url && !selectedFile && (
                  <p className="text-sm text-muted-foreground">Current file: <a href={currentReport.file_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline truncate">{currentReport.file_url.split('/').pop()}</a></p>
                )}
                {selectedFile && (
                  <p className="text-sm text-muted-foreground">New file selected: {selectedFile.name}</p>
                )}
                {uploadingFile && (
                  <div className="flex items-center text-sm text-muted-foreground mt-2">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading file...
                  </div>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveReport} disabled={saving || uploadingFile}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                </>
              ) : (
                "Save Report"
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
              Are you sure you want to delete this annual report? This will also delete the associated PDF file. This action cannot be undone.
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

export default AnnualReportsAdmin;