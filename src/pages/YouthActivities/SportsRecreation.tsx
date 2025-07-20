import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const SportsRecreation = () => {
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
              Regular activities include basketball games in our gym, outdoor soccer matches, and other recreational sports. These events are open to all youth and are a fantastic way to unwind, develop teamwork skills, and enjoy friendly competition.
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
        <Card className="p-6">
          <CardContent className="text-gray-700 dark:text-gray-300">
            <p className="mb-2">
              <strong>Basketball:</strong> Weekly sessions in the mosque gym. (Check youth calendar for specific days/times)
            </p>
            <p className="mb-2">
              <strong>Soccer:</strong> Seasonal outdoor games at local parks. (Announced via WhatsApp group and calendar)
            </p>
            <p className="mb-4">
              <strong>Other Activities:</strong> Occasional recreational outings like hiking, bowling, etc.
            </p>
            <p>
              All activities are supervised by our youth team members.
            </p>
          </CardContent>
        </Card>
      </section>

      <Separator className="my-12" />

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-center">Join Our Sports Community</h2>
        <Card className="p-6">
          <CardContent className="text-gray-700 dark:text-gray-300">
            <p className="mb-4">
              To stay updated on all sports and recreation events, join our dedicated WhatsApp group for youth announcements.
            </p>
            <p className="mb-2">
              Contact Imam Omar for details on joining the group or for any questions.
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

export default SportsRecreation;