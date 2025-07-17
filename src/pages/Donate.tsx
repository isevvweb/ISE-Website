import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Link } from "react-router-dom";
import { DollarSign, Handshake, BookOpen, Home } from "lucide-react";

const Donate = () => {
  const donationCauses = [
    {
      id: "1",
      title: "General Fund",
      description: "Support the daily operations, maintenance, and general expenses of the mosque.",
      icon: Home,
      link: "#", // Placeholder link
    },
    {
      id: "2",
      title: "Zakat & Sadaqah",
      description: "Fulfill your religious obligations and help those in need within our community and beyond.",
      icon: Handshake,
      link: "#", // Placeholder link
    },
    {
      id: "3",
      title: "Education & Youth Programs",
      description: "Invest in the future by supporting our Saturday/Sunday schools and youth activities.",
      icon: BookOpen,
      link: "#", // Placeholder link
    },
  ];

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {donationCauses.map((cause) => (
            <Card key={cause.id} className="flex flex-col items-center text-center p-6">
              <div className="mb-4">
                <cause.icon className="h-12 w-12 text-primary" />
              </div>
              <CardHeader className="p-0 mb-2">
                <CardTitle className="text-xl font-semibold">{cause.title}</CardTitle>
              </CardHeader>
              <CardContent className="p-0 text-sm text-gray-700 dark:text-gray-300 mb-4 flex-grow">
                <p>{cause.description}</p>
              </CardContent>
              <Button asChild className="w-full mt-auto">
                <a href={cause.link} target="_blank" rel="noopener noreferrer">
                  Donate Now
                </a>
              </Button>
            </Card>
          ))}
        </div>
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