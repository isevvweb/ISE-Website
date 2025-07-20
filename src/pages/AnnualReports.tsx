import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { showError } from "@/utils/toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";

interface AnnualReport {
  id: string;
  year: number;
  file_url: string;
}

const fetchAnnualReports = async (): Promise<AnnualReport[]> => {
  const { data, error } = await supabase
    .from("annual_reports")
    .select("*")
    .order("year", { ascending: false }); // Order by year, newest first

  if (error) {
    throw new Error("Error fetching annual reports: " + error.message);
  }
  return data || [];
};

const AnnualReports = () => {
  const { data: reports, isLoading, error } = useQuery<AnnualReport[], Error>({
    queryKey: ["annualReports"],
    queryFn: fetchAnnualReports,
    staleTime: 1000 * 60 * 60, // Data considered fresh for 1 hour
    refetchOnWindowFocus: false,
  });

  const [selectedReport, setSelectedReport] = useState<AnnualReport | null>(null);

  useEffect(() => {
    if (reports && reports.length > 0 && !selectedReport) {
      setSelectedReport(reports[0]); // Select the newest report by default
    }
  }, [reports, selectedReport]);

  if (error) {
    showError("Error loading annual reports: " + error.message);
    return (
      <div className="container mx-auto p-4 text-center text-red-500">
        <p>Error loading annual reports. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Annual Reports</h1>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-10 w-full max-w-md mx-auto" />
          <Skeleton className="h-[600px] w-full" />
        </div>
      ) : reports.length === 0 ? (
        <p className="text-center text-muted-foreground">No annual reports available at this time.</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar for year selection */}
          <Card className="lg:col-span-1 p-4">
            <CardHeader className="p-0 mb-4">
              <CardTitle className="text-xl">Select a Year</CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex flex-wrap lg:flex-col gap-2">
              {reports.map((report) => (
                <Button
                  key={report.id}
                  variant={selectedReport?.id === report.id ? "default" : "outline"}
                  onClick={() => setSelectedReport(report)}
                  className="w-full justify-start"
                >
                  {report.year}
                </Button>
              ))}
            </CardContent>
          </Card>

          {/* PDF Viewer */}
          <Card className="lg:col-span-3 p-4">
            <CardHeader className="p-0 mb-4">
              <CardTitle className="text-xl">
                {selectedReport ? `Report for ${selectedReport.year}` : "No Report Selected"}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {selectedReport ? (
                <div className="relative w-full" style={{ paddingBottom: "141.42%" }}> {/* A4 aspect ratio (210/297) */}
                  <iframe
                    src={selectedReport.file_url}
                    title={`Annual Report ${selectedReport.year}`}
                    className="absolute top-0 left-0 w-full h-full border-0 rounded-lg shadow-lg"
                    allowFullScreen
                  ></iframe>
                </div>
              ) : (
                <p className="text-center text-muted-foreground">Please select a year to view the report.</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AnnualReports;