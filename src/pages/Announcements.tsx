import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { format, parseISO } from "date-fns";
import { showError, showSuccess } from "@/utils/toast";
import { Loader2 } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface Announcement {
  id: string;
  title: string;
  description: string;
  announcement_date: string; // ISO date string
  image_url?: string;
  is_active: boolean;
  posted_at?: string;
  expiration_date?: string; // New: ISO date string for expiration
}

const Announcements = () => {
  const [email, setEmail] = useState("");
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(true);
  const [isSubscribing, setIsSubscribing] = useState(false);

  useEffect(() => {
    fetchActiveAnnouncements();
  }, []);

  const fetchActiveAnnouncements = async () => {
    setLoadingAnnouncements(true);
    const today = format(new Date(), "yyyy-MM-dd"); // Get today's date in YYYY-MM-DD format

    const { data, error } = await supabase
      .from("announcements")
      .select("*")
      .eq("is_active", true)
      .or(`expiration_date.is.null,expiration_date.gte.${today}`) // Filter: no expiration OR expiration date is today or in the future
      .order("posted_at", { ascending: false });

    if (error) {
      showError("Error fetching announcements: " + error.message);
    } else {
      setAnnouncements(data || []);
    }
    setLoadingAnnouncements(false);
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubscribing(true);

    if (!email) {
      showError("Please enter your email address.");
      setIsSubscribing(false);
      return;
    }

    try {
      const { error } = await supabase
        .from("subscriptions")
        .insert({ email: email });

      if (error) {
        if (error.code === '23505') { // Unique constraint violation code
          showError("You are already subscribed with this email!");
        } else {
          showError("Error subscribing: " + error.message);
        }
      } else {
        showSuccess("Successfully subscribed to announcements!");
        setEmail("");
      }
    } catch (err: any) {
      showError("An unexpected error occurred: " + err.message);
    } finally {
      setIsSubscribing(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Announcements</h1>

      {/* Announcements Display Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-center">Latest Updates</h2>
        {loadingAnnouncements ? (
          <p className="text-center">Loading announcements...</p>
        ) : announcements.length === 0 ? (
          <p className="text-center text-muted-foreground">No active announcements at this time.</p>
        ) : (
          <div className="flex flex-col gap-6">
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
                  <p className="text-gray-700 dark:text-gray-300">{announcement.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      <Separator className="my-12" />

      {/* Subscription Form Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-center">Stay Connected!</h2>
        <Card className="max-w-lg mx-auto p-6">
          <CardHeader className="text-center">
            <CardTitle>Subscribe for Announcements</CardTitle>
            <CardDescription>
              Receive important updates via email.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubscribe} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={isSubscribing}>
                {isSubscribing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Subscribing...
                  </>
                ) : (
                  "Subscribe"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </section>
    </div>
  );
};

export default Announcements;