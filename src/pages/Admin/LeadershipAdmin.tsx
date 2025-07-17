import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Gavel } from "lucide-react";

const LeadershipAdmin = () => {
  const leadershipSections = [
    { title: "Board Members", description: "Manage the mosque's executive board members.", path: "/admin/board-members", icon: Users },
    { title: "Board of Trustees", description: "Manage the mosque's board of trustees.", path: "/admin/trustees", icon: Gavel },
  ];

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Manage Leadership</h2>
      <p className="mb-6 text-gray-700 dark:text-gray-300">
        Select a section below to manage the individuals serving in leadership roles.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {leadershipSections.map((section) => (
          <Link to={section.path} key={section.path}>
            <Card className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xl font-medium">{section.title}</CardTitle>
                <section.icon className="h-7 w-7 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <CardDescription>{section.description}</CardDescription>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default LeadershipAdmin;