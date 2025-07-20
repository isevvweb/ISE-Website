import React from "react";
import { supabase } from "@/integrations/supabase/client";
import { showError } from "@/utils/toast";
import TrusteeCard from "@/components/TrusteeCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";

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

const fetchTrustees = async (): Promise<Trustee[]> => {
  console.log("Fetching public trustees...");
  const { data, error } = await supabase
    .from("board_of_trustees")
    .select("*")
    .order("display_order", { ascending: true });

  if (error) {
    console.error("Error in fetchTrustees:", error.message);
    throw new Error("Error fetching board of trustees: " + error.message);
  }
  console.log("Public trustees fetched:", data);
  return data || [];
};

const BoardOfTrustees = () => {
  console.log("BoardOfTrustees component rendered.");
  const { data: trustees, isLoading, error } = useQuery<Trustee[], Error>({
    queryKey: ["trustees"],
    queryFn: fetchTrustees,
    staleTime: 1000 * 60 * 5, // Data considered fresh for 5 minutes
    refetchOnWindowFocus: false,
  });

  if (error) {
    showError("Error loading board of trustees: " + error.message);
    return (
      <div className="container mx-auto p-4 text-center text-red-500">
        <p>Error loading board of trustees. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Meet Our Board of Trustees</h1>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="flex flex-col items-center text-center p-6 h-full">
              <Skeleton className="h-24 w-24 rounded-full mb-4" />
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2 mb-4" />
              <Skeleton className="h-16 w-full mb-4" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-2/3 mt-2" />
            </Card>
          ))}
        </div>
      ) : trustees.length === 0 ? (
        <p className="text-center text-muted-foreground">No board of trustees members found at this time.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trustees.map((trustee) => (
            <TrusteeCard key={trustee.id} {...trustee} />
          ))}
        </div>
      )}
    </div>
  );
};

export default BoardOfTrustees;