import React from "react";
import { Link, Outlet } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, Menu } from "lucide-react"; // Only need Home and Menu icons
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const AdminLayout = () => {
  // Simplified admin navigation items for clarity and brevity
  const adminNavItems = [
    { name: "Dashboard", path: "/admin", icon: Home },
    { name: "Back to Public Site", path: "/", icon: Home }, // Reusing Home icon for simplicity
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
            <Button variant="ghost" asChild className="text-primary-foreground hover:bg-primary/80">
              <Link to="/admin" className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                <span>Dashboard</span>
              </Link>
            </Button>
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
                <Link
                  to="/admin"
                  className="flex items-center gap-2 text-lg font-medium hover:text-primary"
                >
                  <Home className="h-5 w-5" />
                  Dashboard
                </Link>
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