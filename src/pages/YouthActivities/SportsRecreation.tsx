import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Link } from "react-router-dom";
import { ArrowLeft, Mail, Phone, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { showError } from "@/utils/toast";
import { Skeleton } from "@/components/ui/skeleton";

interface YouthSubprogram {
  id: string;
  program_tag: string;
  title: string;
  description?: string;
  day_of_week?: string;
  time_interval?: string;
  contact_email?: string;
  contact_phone?: string;
  display_order?: number;
  created_at?: string;
}

const fetchSubprogramsByTag = async (tag: string): Promise<YouthSubprogram[]> => {
  const { data, error } = await supabase
    .from("youth_subprograms")
    .select("*")
    .eq("program_tag", tag)
    .order("display_order", { ascending: true });

  if (error) {
    throw new Error(`Error fetching ${tag} subprograms: ` + error.message);
  }
  return data || [];
};

const SportsRecreation = () => {
  const { data: subprograms, isLoading, error } = useQuery<YouthSubprogram[], Error>({
    queryKey: ["youthSubprograms", "Recreation"],
    queryFn: () => fetchSubprogramsByTag("Recreation"),
    staleTime: 1000 * 60 * 5, // Data considered fresh for 5 minutes
    refetchOnWindowFocus: false,
  });

  if (error) {
    showError("Error loading sports & recreation subprograms: " + error.message);
    return (
      <div className="container mx-auto p-4 text-center text-red-500">
        <p>Error loading sports & recreation details. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <Button variant="outline" asChild className="mb-6">
        <Link to="/youth-activities">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Youth Activities
        </Link>
      </Button>
      <h1 className="text-3xl font-bold mb-8 text-center">Sports & Recreation</h1>

      <section className="mb-12">
        <Card className="p-6">
          <CardHeader>
            <CardTitle className="text-2xl">Stay Active, Build Bonds</CardTitle>
            <CardDescription>Promoting healthy lifestyles and brotherhood/sisterhood.</CardDescription>
          </CardHeader>
          <CardContent className="text-gray-700 dark:text-gray-300">
            <p className="mb-4">
              Our Sports & Recreation program offers a variety of activities designed to keep our youth active, healthy, and connected. We believe that physical activity is crucial for overall well-being and provides an excellent opportunity to build strong bonds of brotherhood and sisterhood in a fun, supervised environment.
            </p>
            <p className="mb-4">
              These events are open to all youth and are a fantastic way to unwind, develop teamwork skills, and enjoy friendly competition.
            </p>
            <p>
              Check our youth calendar for upcoming sports events and join us on the court or field!
            </p>
          </CardContent>
        </Card>
      </section>

      <Separator className="my-12" />

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-center">Activities & Schedule</h2>
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(2)].map((_, i) => (
              <Card key={i} className="p-6">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-4" />
                <Skeleton className="h-20 w-full mb-4" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-2/3 mt-2" />
              </Card>
            ))}
          </div>
        ) : subprograms && subprograms.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {subprograms.map((subprogram) => (
              <Card key={subprogram.id} className="p-6">
                <CardHeader className="p-0 mb-2">
                  <CardTitle className="text-xl">{subprogram.title}</CardTitle>
                  {subprogram.day_of_week && subprogram.time_interval && (
                    <CardDescription className="text-muted-foreground">
                      {subprogram.day_of_week}, {subprogram.time_interval}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="p-0 text-gray-700 dark:text-gray-300 mb-4">
                  <p>{subprogram.description}</p>
                </CardContent>
                <div className="flex flex-col gap-2">
                  {subprogram.contact_email && (
                    <a href={`mailto:${subprogram.contact_email}`} className="flex items-center text-blue-600 hover:underline text-sm">
                      <Mail className="h-4 w-4 mr-2" /> {subprogram.contact_email}
                    </a>
                  )}
                  {subprogram.contact_phone && (
                    <a href={`tel:${subprogram.contact_phone}`} className="flex items-center text-blue-600 hover:underline text-sm">
                      <Phone className="h-4 w-4 mr-2" /> {subprogram.contact_phone}
                    </a>
                  )}
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground">No specific sports & recreation activities found at this time. Please check back later!</p>
        )}
      </section>
    </div>
  );
};

export default SportsRecreation;