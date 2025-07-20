import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const WeeklyYouthHalaqa = () => {
  return (
    <div className="container mx-auto p-4">
      <Button variant="outline" asChild className="mb-6">
        <Link to="/youth-activities">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Youth Activities
        </Link>
      </Button>
      <h1 className="text-3xl font-bold mb-8 text-center">Weekly Youth Halaqa</h1>

      <section className="mb-12">
        <Card className="p-6">
          <CardHeader>
            <CardTitle className="text-2xl">About the Halaqa</CardTitle>
            <CardDescription>Deepening our understanding of Islam.</CardDescription>
          </CardHeader>
          <CardContent className="text-gray-700 dark:text-gray-300">
            <p className="mb-4">
              Our Weekly Youth Halaqa is a cornerstone of our youth program, providing a dedicated space for young Muslims to learn, discuss, and reflect on various aspects of Islamic knowledge. Held every Saturday after Dhuhr prayer, these sessions cover topics ranging from Quranic tafsir, Hadith studies, Fiqh (Islamic jurisprudence), Seerah (Prophet's biography), and contemporary issues from an Islamic perspective.
            </p>
            <p className="mb-4">
              The halaqa aims to foster a strong Islamic identity, encourage critical thinking, and build a supportive community among our youth. We invite guest speakers, engage in interactive discussions, and provide an environment where questions are welcomed and explored respectfully.
            </p>
            <p>
              It's a great opportunity to strengthen your faith, connect with peers, and gain valuable insights that can be applied to daily life.
            </p>
          </CardContent>
        </Card>
      </section>

      <Separator className="my-12" />

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-center">Schedule & Location</h2>
        <Card className="p-6">
          <CardContent className="text-gray-700 dark:text-gray-300">
            <p className="mb-2">
              <strong>When:</strong> Every Saturday, immediately after Dhuhr prayer. (Please check prayer times for exact start time.)
            </p>
            <p className="mb-4">
              <strong>Where:</strong> Main Prayer Hall / Youth Room (check announcements for specific location)
            </p>
            <p>
              All youth (ages 13-25) are welcome to attend. No prior registration is required.
            </p>
          </CardContent>
        </Card>
      </section>

      <Separator className="my-12" />

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-center">Contact & Resources</h2>
        <Card className="p-6">
          <CardContent className="text-gray-700 dark:text-gray-300">
            <p className="mb-4">
              For more information or to suggest topics, please contact Imam Omar, our Youth Director.
            </p>
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

export default WeeklyYouthHalaqa;