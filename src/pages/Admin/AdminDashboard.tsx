import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, Clock, FileText, Users, DollarSign, CalendarCheck, ListChecks, Monitor } from "lucide-react"; // Import Monitor icon

const AdminDashboard = () => {
  const adminSections = [
    { title: "Announcements", description: "Manage mosque announcements.", path: "/admin/announcements", icon: Bell },
    { title: "Iqamah Times", description: "Adjust daily Iqamah times.", path: "/admin/iqamah", icon: Clock },
    { title: "Annual Reports", description: "Upload and manage annual reports.", path: "/admin/reports", icon: FileText },
    { title: "Leadership", description: "Manage Board Members and Trustees.", path: "/admin/leadership", icon: Users },
    { title: "Donation Causes", description: "Add or remove donation causes.", path: "/admin/donation-causes", icon: DollarSign },
    { title: "Youth Events", description: "Manage past youth events and galleries.", path: "/admin/youth-events", icon: CalendarCheck },
    { title: "Youth Subprograms", description: "Manage detailed subprograms for youth activities.", path: "/admin/youth-subprograms", icon: ListChecks },
    { title: "Digital Sign Settings", description: "Configure the public digital display.", path: "/admin/digital-sign-settings", icon: Monitor }, // New section
  ];

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      <p className="mb-8 text-gray-700 dark:text-gray-300">
        Welcome to the admin panel. Select a section to manage content.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {adminSections.map((section) => (
          <Link to={section.path} key={section.path}>
            <Card className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-2xl font-medium">{section.title}</CardTitle>
                <section.icon className="h-8 w-8 text-muted-foreground" />
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

export default AdminDashboard;