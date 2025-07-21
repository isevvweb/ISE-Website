import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Link } from "react-router-dom";
import { DollarSign, Handshake, BookOpen, Home, Heart, Gift, PiggyBank, GraduationCap, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { showError } from "@/utils/toast";
import { Skeleton } from "@/components/ui/skeleton";

interface DonationCause {
  id: string;
  title: string;
  description?: string;
  icon_name?: string;
  payment_link: string;
  display_order?: number;
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

const fetchDonationCauses = async (): Promise<DonationCause[]> => {
  const { data, error } = await supabase
    .from("donation_causes")
    .select("*")
    .order("display_order", { ascending: true });

  if (error) {
    throw new Error("Error fetching donation causes: " + error.message);
  }
  return data || [];
};

const Donate = () => {
  const { data: donationCauses, isLoading, error } = useQuery<DonationCause[], Error>({
    queryKey: ["donationCauses"],
    queryFn: fetchDonationCauses,
    staleTime: 1000 * 60 * 5, // Data considered fresh for 5 minutes
    refetchOnWindowFocus: false,
  });

  if (error) {
    showError("Error loading donation causes: " + error.message);
    return (
      <div className="container mx-auto p-4 text-center text-red-500">
        <p>Error loading donation causes. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Support the Islamic Society of Evansville</h1>

      <section className="mb-12 text-center">
        <h2 className="text-2xl font-bold mb-6">Your Generosity Makes a Difference</h2>
        <Card className="max-w-3xl mx-auto p-6">
          <CardContent className="text-gray-700 dark:text-gray-300">
            <p className="mb-4">
              The Islamic Society of Evansville relies on the generous contributions of its community members and supporters to continue providing essential services, educational programs, and a welcoming space for worship. Your donations enable us to maintain our facilities, support our Imam, organize events, and serve the wider Evansville community.
            </p>
            <p className="mb-4">
              Every contribution, big or small, is a Sadaqah Jariyah (ongoing charity) that will benefit you in this life and the hereafter, Insha'Allah.
            </p>
            <p className="font-semibold">
              "Who is it that would loan Allah a goodly loan so He may multiply it for him many times over? And it is Allah who withholds and grants abundance, and to Him you will be returned." (Quran 2:245)
            </p>
          </CardContent>
        </Card>
      </section>

      <Separator className="my-12" />

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-center">Choose a Donation Cause</h2>
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="flex flex-col items-center text-center p-6">
                <Skeleton className="h-12 w-12 rounded-full mb-4" />
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2 mb-4" />
                <Skeleton className="h-20 w-full mb-4" />
                <Skeleton className="h-10 w-full" />
              </Card>
            ))}
          </div>
        ) : donationCauses && donationCauses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {donationCauses.map((cause) => {
              const IconComponent = cause.icon_name ? lucideIcons[cause.icon_name] : DollarSign; // Default to DollarSign if icon_name is missing
              return (
                <Card key={cause.id} className="flex flex-col items-center text-center p-6">
                  <div className="mb-4">
                    {IconComponent && <IconComponent className="h-12 w-12 text-primary" />}
                  </div>
                  <CardHeader className="p-0 mb-2">
                    <CardTitle className="text-xl font-semibold">{cause.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 text-sm text-gray-700 dark:text-gray-300 mb-4 flex-grow">
                    <p>{cause.description}</p>
                  </CardContent>
                  <Button asChild className="w-full mt-auto">
                    <a href={cause.payment_link} target="_blank" rel="noopener noreferrer">
                      Donate Now
                    </a>
                  </Button>
                </Card>
              );
            })}
          </div>
        ) : (
          <p className="text-center text-muted-foreground">No donation causes found at this time. Please check back later!</p>
        )}
      </section>

      <Separator className="my-12" />

      <section className="mb-12 text-center">
        <h2 className="text-2xl font-bold mb-6">Other Ways to Give</h2>
        <Card className="max-w-3xl mx-auto p-6">
          <CardContent className="text-gray-700 dark:text-gray-300">
            <p className="mb-4">
              Beyond monetary donations, you can also contribute through volunteering your time and skills. Please contact us if you are interested in becoming a volunteer.
            </p>
            <Button asChild>
              <Link to="/contact">Contact Us to Volunteer</Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
};

export default Donate;