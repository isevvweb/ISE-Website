import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Members = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Become a Member</h1>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-center">Why Become a Member?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6">
            <CardHeader>
              <CardTitle className="text-xl">Support Your Community</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-700 dark:text-gray-300">
              <p>Your membership directly supports the mosque's operations, educational programs, and community services. It's an investment in the future of our Islamic community in Evansville.</p>
            </CardContent>
          </Card>
          <Card className="p-6">
            <CardHeader>
              <CardTitle className="text-xl">Exclusive Benefits</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-700 dark:text-gray-300">
              <p>Members receive special access to certain events, voting rights in general body meetings, and priority registration for youth programs and classes.</p>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mb-12 text-center">
        <h2 className="text-2xl font-bold mb-6">Membership Application</h2>
        <Card className="max-w-2xl mx-auto p-6">
          <CardContent className="text-gray-700 dark:text-gray-300">
            <p className="mb-4">
              Interested in becoming a member of the Islamic Society of Evansville? Please fill out our membership application form.
            </p>
            <Button className="w-full md:w-auto">
              Apply for Membership (Form Placeholder)
            </Button>
          </CardContent>
        </Card>
      </section>

      <section className="mb-12 text-center">
        <h2 className="text-2xl font-bold mb-6">Community Events Calendar</h2>
        <Card className="max-w-2xl mx-auto p-6">
          <CardContent className="text-gray-700 dark:text-gray-300">
            <p className="mb-4">
              Members will have access to a dedicated community calendar showcasing exclusive events, meetings, and volunteer opportunities.
            </p>
            <div className="relative w-full mx-auto" style={{ paddingBottom: "75%", maxWidth: "600px" }}>
              <iframe
                src="https://calendar.google.com/calendar/embed?src=464ad63344b9b7c026adb7ee76c370b95864259cac908d685142e8571291449c%40group.calendar.google.com&ctz=America%2FChicago"
                style={{ border: 0 }}
                width="100%"
                height="100%"
                frameBorder="0"
                scrolling="no"
                className="absolute top-0 left-0 w-full h-full rounded-lg shadow-lg"
                title="Community Events Calendar"
              ></iframe>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
};

export default Members;