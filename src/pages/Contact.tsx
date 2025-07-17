import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MapPin, Loader2 } from "lucide-react";
import { showSuccess, showError } from "@/utils/toast"; // Using custom toast utilities

const Contact = () => {
  const [contactForm, setContactForm] = React.useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [quranRequestForm, setQuranRequestForm] = React.useState({
    name: "",
    email: "",
    address: "",
    city: "",
    state: "",
    zip: "",
  });
  const [isContactLoading, setIsContactLoading] = React.useState(false);
  const [isQuranRequestLoading, setIsQuranRequestLoading] = React.useState(false);

  const handleContactFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setContactForm((prev) => ({ ...prev, [id]: value }));
  };

  const handleQuranRequestFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setQuranRequestForm((prev) => ({ ...prev, [id]: value }));
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsContactLoading(true);

    try {
      const response = await fetch("https://wzeyadxcbopevhuzimgf.supabase.co/functions/v1/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ formType: "contact", data: contactForm }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to send message.");
      }

      showSuccess("Message Sent! Thank you for reaching out. We will get back to you soon.");
      setContactForm({ name: "", email: "", subject: "", message: "" });
    } catch (error: any) {
      showError("Error sending message: " + error.message);
    } finally {
      setIsContactLoading(false);
    }
  };

  const handleQuranRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsQuranRequestLoading(true);

    try {
      const response = await fetch("https://wzeyadxcbopevhuzimgf.supabase.co/functions/v1/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ formType: "quranRequest", data: quranRequestForm }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to send Quran request.");
      }

      showSuccess("Quran Request Received! Thank you for your interest. We will process your request shortly.");
      setQuranRequestForm({ name: "", email: "", address: "", city: "", state: "", zip: "" });
    } catch (error: any) {
      showError("Error sending Quran request: " + error.message);
    } finally {
      setIsQuranRequestLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Contact Us & Request a Quran</h1>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {/* Contact Information */}
        <Card className="p-6">
          <CardHeader>
            <CardTitle className="text-2xl">Get in Touch</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-700 dark:text-gray-300">
            <div className="flex items-center">
              <MapPin className="h-5 w-5 mr-3 text-primary" />
              <div>
                <p className="font-semibold">Address:</p>
                <p>4200 Grimm Road, Newburgh, IN</p>
              </div>
            </div>
            <div className="flex items-center">
              <Phone className="h-5 w-5 mr-3 text-primary" />
              <div>
                <p className="font-semibold">Phone:</p>
                <a href="tel:+18128538806" className="hover:underline">(812) 853-8806</a>
              </div>
            </div>
            <div className="flex items-center">
              <Mail className="h-5 w-5 mr-3 text-primary" />
              <div>
                <p className="font-semibold">Email:</p>
                <a href="mailto:secretary@isevv.org" className="hover:underline">secretary@isevv.org</a>
              </div>
            </div>
            <div className="relative w-full h-64 rounded-lg overflow-hidden shadow-md mt-6">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d805154.9853288708!2d-88.585068053125!3d37.97393990000001!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f19!3m3!1m2!1s0x886e2ce863e0141d%3A0x3c6e231711beab09!2zSXNsYW1pYyBDZW50ZXIgb2YgRXZhbnN2aWxsZSDZhdiz2KzYrw!5e0!3m2!1sen!2sus!4v1752727462008!5m2!1sen!2sus"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Mosque Location"
              ></iframe>
            </div>
          </CardContent>
        </Card>

        {/* Contact Form */}
        <Card className="p-6">
          <CardHeader>
            <CardTitle className="text-2xl">Send Us a Message</CardTitle>
            <CardDescription>
              Have a question or feedback? Fill out the form below.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Your Name</Label>
                <Input id="name" type="text" placeholder="John Doe" value={contactForm.name} onChange={handleContactFormChange} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Your Email</Label>
                <Input id="email" type="email" placeholder="john.doe@example.com" value={contactForm.email} onChange={handleContactFormChange} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" type="text" placeholder="Inquiry about..." value={contactForm.subject} onChange={handleContactFormChange} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="message">Message</Label>
                <Textarea id="message" placeholder="Your message here..." value={contactForm.message} onChange={handleContactFormChange} rows={5} required />
              </div>
              <Button type="submit" className="w-full" disabled={isContactLoading}>
                {isContactLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...
                  </>
                ) : (
                  "Send Message"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </section>

      {/* Quran Request Section */}
      <section className="mb-12 text-center">
        <h2 className="text-2xl font-bold mb-6">Request a Complimentary Quran</h2>
        <Card className="max-w-2xl mx-auto p-6">
          <CardHeader>
            <CardTitle>Receive a Free Quran</CardTitle>
            <CardDescription>
              We are pleased to offer a complimentary copy of the Holy Quran to anyone interested in learning about Islam.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleQuranRequestSubmit} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="quran-name">Your Name</Label>
                <Input id="quran-name" type="text" placeholder="Jane Doe" value={quranRequestForm.name} onChange={(e) => setQuranRequestForm({...quranRequestForm, name: e.target.value})} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="quran-email">Your Email</Label>
                <Input id="quran-email" type="email" placeholder="jane.doe@example.com" value={quranRequestForm.email} onChange={(e) => setQuranRequestForm({...quranRequestForm, email: e.target.value})} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="quran-address">Shipping Address</Label>
                <Input id="quran-address" type="text" placeholder="123 Main St" value={quranRequestForm.address} onChange={(e) => setQuranRequestForm({...quranRequestForm, address: e.target.value})} required />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <div className="grid gap-2">
                  <Label htmlFor="quran-city">City</Label>
                  <Input id="quran-city" type="text" placeholder="Evansville" value={quranRequestForm.city} onChange={(e) => setQuranRequestForm({...quranRequestForm, city: e.target.value})} required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="quran-state">State</Label>
                  <Input id="quran-state" type="text" placeholder="IN" value={quranRequestForm.state} onChange={(e) => setQuranRequestForm({...quranRequestForm, state: e.target.value})} required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="quran-zip">Zip Code</Label>
                  <Input id="quran-zip" type="text" placeholder="47710" value={quranRequestForm.zip} onChange={(e) => setQuranRequestForm({...quranRequestForm, zip: e.target.value})} required />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={isQuranRequestLoading}>
                {isQuranRequestLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...
                  </>
                ) : (
                  "Request Quran"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </section>
    </div>
  );
};

export default Contact;