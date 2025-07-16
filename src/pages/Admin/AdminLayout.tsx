import React from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, Bell, Clock, FileText, Users, DollarSign, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/components/SessionContextProvider";
import { showSuccess, showError } from "@/utils/toast";

const AdminLayout = () => {
  const navigate = useNavigate();
  const { isLoading } = useSession(); // Use useSession to check loading state

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      showError("Failed to sign out: " + error.message);
    } else {
      // showSuccess("Successfully signed out!"); // Handled by SessionContextProvider
      navigate("/login");
    }
  };

  const adminNavItems = [
    { name: "Dashboard", path: "/admin", icon: Home },
    { name: "Announcements", path: "/admin/announcements", icon: Bell },
    { name: "Iqamah Times", path: "/admin/iqamah", icon: Clock },
    { name: "Annual Reports", path: "/admin/reports", icon: FileText },
    { name: "Board Members", path: "/admin/board-members", icon: Users },
    { name: "Donation Causes", path: "/admin/donation-causes", icon: DollarSign },
  ];

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading admin panel...</div>;
  }

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
            <Button variant="destructive" onClick={handleSignOut} className="flex items-center gap-2">
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign Out</span>
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