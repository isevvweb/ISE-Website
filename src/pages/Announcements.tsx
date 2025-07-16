import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast"; // Using shadcn's toast for simple feedback

const Announcements = () => {
  const { toast } = useToast();
  const [email, setEmail] = React.useState("");
  const [phoneNumber, setPhoneNumber] = React.useState("");

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

  // Placeholder for announcements data
  const dummyAnnouncements = [
    {
      id: "1",
      title: "Eid al-Adha Prayer & Celebration",
      description: "Join us for Eid al-Adha prayer at 8:00 AM followed by a community breakfast. Bring your families!",
      date: "July 10, 2024",
      imageUrl: "https://via.placeholder.com/600x300/4CAF50/FFFFFF?text=Eid+Celebration",
    },
    {
      id: "2",
      title: "Youth Summer Camp Registration Open",
      description: "Register your children for our annual summer camp focusing on Islamic values and outdoor activities. Limited spots available!",
      date: "June 25, 2024",
      imageUrl: "https://via.placeholder.com/600x300/2196F3/FFFFFF?text=Youth+Camp",
    },
    {
      id: "3",
      title: "Weekly Quran Tafsir Class",
      description: "Every Tuesday after Isha prayer, join Imam Omar for a deep dive into the meanings of the Quran. All are welcome.",
      date: "June 15, 2024",
    },
  ];

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Announcements</h1>

      {/* Announcements Display Section */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-center">Latest Updates</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {dummyAnnouncements.map((announcement) => (
            <Card key={announcement.id}>
              {announcement.imageUrl && (
                <img
                  src={announcement.imageUrl}
                  alt={announcement.title}
                  className="w-full h-48 object-cover rounded-t-lg mb-4"
                />
              )}
              <CardHeader>
                <CardTitle className="text-xl">{announcement.title}</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  {announcement.date}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 dark:text-gray-300">{announcement.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-8">
          (Announcements will be managed and displayed from the admin panel.)
        </p>
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
            <p className="text-center text-xs text-gray-500 dark:text-gray-400 mt-4">
              Note: Subscription functionality requires backend integration (e.g., Supabase).
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
};

export default Announcements;