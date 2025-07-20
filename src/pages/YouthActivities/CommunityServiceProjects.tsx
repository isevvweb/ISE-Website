import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const CommunityServiceProjects = () => {
  return (
    <div className="container mx-auto p-4">
      <Button variant="outline" asChild className="mb-6">
        <Link to="/youth-activities">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Youth Activities
        </Link>
      </Button>
      <h1 className="text-3xl font-bold mb-8 text-center">Community Service Projects</h1>

      <section className="mb-12">
        <Card className="p-6">
          <CardHeader>
            <CardTitle className="text-2xl">Serving Humanity, Following the Sunnah</CardTitle>
            <CardDescription>Making a positive impact in our local community.</CardDescription>
          </CardHeader>
          <CardContent className="text-gray-700 dark:text-gray-300">
            <p className="mb-4">
              The Islamic Society of Evansville's Youth Community Service program is dedicated to instilling the values of compassion, generosity, and civic responsibility in our young generation. We believe that serving humanity is an integral part of our faith, as taught by the Quran and the Sunnah of Prophet Muhammad (peace be upon him).
            </p>
            <p className="mb-4">
              Our youth regularly participate in various local initiatives, including:
            </p>
            <ul className="list-disc list-inside mb-4 space-y-1">
              <li>Volunteering at local food banks and shelters</li>
              <li>Participating in park clean-ups and environmental initiatives</li>
              <li>Organizing donation drives for those in need</li>
              <li>Visiting nursing homes and assisting the elderly</li>
            </ul>
            <p>
              These projects not only benefit the wider Evansville community but also provide our youth with invaluable experiences, teaching them the importance of empathy, teamwork, and active citizenship.
            </p>
          </CardContent>
        </Card>
      </section>

      <Separator className="my-12" />

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-center">Get Involved</h2>
        <Card className="p-6">
          <CardContent className="text-gray-700 dark:text-gray-300">
            <p className="mb-4">
              We are always looking for enthusiastic youth to join our community service efforts. Participation is a rewarding way to earn good deeds and make a tangible difference.
            </p>
            <p className="mb-2">
              Check our youth calendar for upcoming service opportunities.
            </p>
            <p>
              If you have suggestions for new projects or would like to volunteer, please contact our Youth Director.
            </p>
          </CardContent>
        </Card>
      </section>

      <Separator className="my-12" />

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-center">Contact Information</h2>
        <Card className="p-6">
          <CardContent className="text-gray-700 dark:text-gray-300">
            <p className="mb-2">
              Email: <a href="mailto:imam.omar@example.com" className="text-blue-600 hover:underline">imam.omar@example.com</a>
            </p>
            <p>
              Phone: <a href="tel:5551234567" className="text-blue-600 hover:underline">555-123-4567</a>
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
};

export default CommunityServiceProjects;