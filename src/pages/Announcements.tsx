import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format, parseISO } from "date-fns";
import { showError } from "@/utils/toast";

interface Announcement {
  id: string;
  title: string;
  description: string;
  announcement_date: string; // ISO date string
  image_url?: string;
  is_active: boolean;
}

const Announcements = () => {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(true);

  useEffect(() => {
    fetchActiveAnnouncements();
  }, []);

  const fetchActiveAnnouncements = async () => {
    setLoadingAnnouncements(true);
    const { data, error } = await supabase
      .from("announcements")
      .select("*")
      .eq("is_active", true) // Only fetch active announcements
      .order("announcement_date", { ascending: false });

    if (error) {
      showError("Error fetching announcements: " + error.message);
    } else {
      setAnnouncements(data || []);
    }
    setLoadingAnnouncements(false);
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real application, this data would be sent to a backend (e.g., Supabase)
    // for storage and integration with an email/SMS service.
    console.log("Subscription attempt:", { email, phoneNumber });
    toast({
      title: "Subscription Request Sent!",
      description: "Thank you for your interest. We'll be in touch!",
    });
    setEmail("");
    setPhoneNumber("");
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
          <div className="flex flex-col gap-6"> {/* Changed to flex-col for column layout */}
            {announcements.map((announcement) => (
              <Card key={announcement.id}>
                {announcement.image_url && (
                  <img
                    src={announcement.image_url}
                    alt={announcement.title}
                    className="w-full h-48 object-cover rounded-t-lg mb-4"
                  />
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
              Receive important updates via email or text message.
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
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone Number (Optional)</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="e.g., 123-456-7890"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full">
                Subscribe
              </Button>
            </form>
          </CardContent>
        </Card>
      </section>
    </div>
  );
};

export default Announcements;