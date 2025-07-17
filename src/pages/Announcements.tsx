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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"; // Import RadioGroup components

interface Announcement {
  id: string;
  title: string;
  description: string;
  announcement_date: string;
  image_url?: string;
  is_active: boolean;
  posted_at?: string;
}

const Announcements = () => {
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [contactMethod, setContactMethod] = useState<"email" | "phone" | "both">("email"); // New state for contact method
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loadingAnnouncements, setLoadingAnnouncements] = useState(true);
  const [isSubscribing, setIsSubscribing] = useState(false);

  useEffect(() => {
    fetchActiveAnnouncements();
  }, []);

  const fetchActiveAnnouncements = async () => {
    setLoadingAnnouncements(true);
    const { data, error } = await supabase
      .from("announcements")
      .select("*")
      .eq("is_active", true)
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

    let insertData: { email?: string; phone_number?: string } = {};
    let hasInput = false;

    if (contactMethod === "email" || contactMethod === "both") {
      if (!email) {
        showError("Please enter your email address.");
        setIsSubscribing(false);
        return;
      }
      insertData.email = email;
      hasInput = true;
    }

    if (contactMethod === "phone" || contactMethod === "both") {
      if (!phoneNumber) {
        showError("Please enter your phone number.");
        setIsSubscribing(false);
        return;
      }
      insertData.phone_number = phoneNumber;
      hasInput = true;
    }

    if (!hasInput) {
      showError("Please select a contact method and provide the required information.");
      setIsSubscribing(false);
      return;
    }

    try {
      const { error } = await supabase
        .from("subscriptions")
        .insert(insertData);

      if (error) {
        if (error.code === '23505') { // Unique constraint violation code
          showError("You are already subscribed with this email/phone number!");
        } else {
          showError("Error subscribing: " + error.message);
        }
      } else {
        showSuccess("Successfully subscribed to announcements!");
        setEmail("");
        setPhoneNumber("");
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
              Receive important updates via email or text message.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubscribe} className="space-y-4">
              <div className="grid gap-2">
                <Label>Preferred Contact Method</Label>
                <RadioGroup
                  defaultValue="email"
                  onValueChange={(value: "email" | "phone" | "both") => setContactMethod(value)}
                  className="flex space-x-4"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="email" id="r1" />
                    <Label htmlFor="r1">Email</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="phone" id="r2" />
                    <Label htmlFor="r2">Phone</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="both" id="r3" />
                    <Label htmlFor="r3">Both</Label>
                  </div>
                </RadioGroup>
              </div>

              {(contactMethod === "email" || contactMethod === "both") && (
                <div className="grid gap-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required={contactMethod === "email" || contactMethod === "both"}
                  />
                </div>
              )}

              {(contactMethod === "phone" || contactMethod === "both") && (
                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="e.g., +15551234567"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required={contactMethod === "phone" || contactMethod === "both"}
                  />
                </div>
              )}

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