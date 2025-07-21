import React from "react";
import { Link, Outlet } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, Bell, Clock, FileText, Users, DollarSign, CalendarCheck, ListChecks, Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const AdminLayout = () => {
  const adminNavItems = [
    { name: "Dashboard", path: "/admin", icon: Home },
    { name: "Announcements", path: "/admin/announcements", icon: Bell },
    { name: "Iqamah Times", path: "/admin/iqamah", icon: Clock },
    { name: "Annual Reports", path: "/admin/reports", icon: FileText },
    { name: "Leadership", path: "/admin/leadership", icon: Users },
    { name: "Donation Causes", path: "/admin/donation-causes", icon: DollarSign },
    { name: "Youth Events", path: "/admin/youth-events", icon: CalendarCheck },
    { name: "Youth Subprograms", path: "/admin/youth-subprograms", icon: ListChecks },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
      <header className="sticky top-0 z-50 w-full border-b bg-primary text-primary-foreground">
        <div className="container flex h-14 items-center justify-between">
          <Link to="/admin" className="mr-4 flex items-center flex-shrink-0">
            <span className="font-bold text-lg whitespace-nowrap">Admin Panel</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-4">
            {adminNavItems.map((item) => (
              <Button key={item.path} variant="ghost" asChild className="text-primary-foreground hover:bg-primary/80">
                <Link to={item.path} className="flex items-center gap-2">
                  <item.icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              </Button>
            ))}
            <Button variant="secondary" asChild>
              <Link to="/">Back to Public Site</Link>
            </Button>
          </nav>

          {/* Mobile Navigation */}
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" aria-label="Toggle admin navigation">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[250px] sm:w-[300px]">
              <nav className="flex flex-col gap-4 pt-6">
                {adminNavItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="flex items-center gap-2 text-lg font-medium hover:text-primary"
                  >
                    <item.icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                ))}
                <Link
                  to="/"
                  className="flex items-center gap-2 text-lg font-medium hover:text-primary mt-4 border-t pt-4"
                >
                  <Home className="h-5 w-5" />
                  Back to Public Site
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </header>
      <main className="flex-grow container mx-auto p-4">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;