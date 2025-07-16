import React from "react";
import { Link, Outlet } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, Bell, Clock, FileText, Users, DollarSign } from "lucide-react";

const AdminLayout = () => {
  const adminNavItems = [
    { name: "Dashboard", path: "/admin", icon: Home },
    { name: "Announcements", path: "/admin/announcements", icon: Bell },
    { name: "Iqamah Times", path: "/admin/iqamah", icon: Clock },
    { name: "Annual Reports", path: "/admin/reports", icon: FileText },
    { name: "Board Members", path: "/admin/board-members", icon: Users },
    { name: "Donation Causes", path: "/admin/donation-causes", icon: DollarSign },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
      <header className="sticky top-0 z-50 w-full border-b bg-primary text-primary-foreground">
        <div className="container flex h-14 items-center justify-between">
          <Link to="/admin" className="mr-4 flex items-center">
            <span className="font-bold text-lg">Admin Panel</span>
          </Link>
          <nav className="flex items-center space-x-4">
            {adminNavItems.map((item) => (
              <Button key={item.path} variant="ghost" asChild className="text-primary-foreground hover:bg-primary/80">
                <Link to={item.path} className="flex items-center gap-2">
                  <item.icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{item.name}</span>
                </Link>
              </Button>
            ))}
            <Button variant="secondary" asChild>
              <Link to="/">Back to Public Site</Link>
            </Button>
          </nav>
        </div>
      </header>
      <main className="flex-grow container mx-auto p-4">
        <Outlet /> {/* This is where the admin sub-pages will render */}
      </main>
    </div>
  );
};

export default AdminLayout;