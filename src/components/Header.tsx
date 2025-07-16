import React from "react";
import { Link } from "react-router-dom"; // Removed useNavigate
import { Info, Search } from "lucide-react"; // Removed LogIn, LogOut
import { Button } from "@/components/ui/button";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { CreatorInfoDialog } from "@/components/CreatorInfoDialog";
// Removed useSession import
// Removed supabase import
// Removed showError import

const Header = () => {
  const [isCreatorInfoOpen, setIsCreatorInfoOpen] = React.useState(false);
  // Removed session and isLoading states
  // Removed navigate

  // Removed handleSignOut function

  const publicRoutes = [
    { name: "Home", path: "/" },
    { name: "Prayer Times", path: "/prayer-times" },
    { name: "Live Stream", path: "/live-stream" },
    { name: "Youth Activities", path: "/youth-activities" },
    { name: "Announcements", path: "/announcements" },
    { name: "About", path: "/about" },
    { name: "Members", path: "/members" },
    { name: "Contact", path: "/contact" },
    { name: "Donate", path: "/donate" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <Link to="/" className="mr-4 flex items-center">
          <span className="font-bold text-lg">Islamic Society of Evansville</span>
        </Link>

        {/* Desktop Navigation */}
        <NavigationMenu className="hidden md:flex">
          <NavigationMenuList>
            {publicRoutes.map((route) => (
              <NavigationMenuItem key={route.path}>
                <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                  <Link to={route.path}>{route.name}</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>

        <div className="flex items-center space-x-2">
          {/* Search Icon (placeholder) */}
          <Button variant="ghost" size="icon" aria-label="Search">
            <Search className="h-5 w-5" />
          </Button>

          {/* Info Icon */}
          <Button
            variant="ghost"
            size="icon"
            aria-label="Creator Info"
            onClick={() => setIsCreatorInfoOpen(true)}
          >
            <Info className="h-5 w-5" />
          </Button>

          {/* Admin Link (replaces auth button) */}
          <Button variant="ghost" size="sm" asChild>
            <Link to="/admin">Admin</Link>
          </Button>

          {/* Mobile Navigation */}
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" aria-label="Toggle navigation">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <nav className="flex flex-col gap-4 pt-6">
                {publicRoutes.map((route) => (
                  <Link
                    key={route.path}
                    to={route.path}
                    className="text-lg font-medium hover:text-primary"
                  >
                    {route.name}
                  </Link>
                ))}
                {/* Admin Link for mobile */}
                <Link
                  to="/admin"
                  className="text-lg font-medium hover:text-primary"
                >
                  Admin
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
      <CreatorInfoDialog isOpen={isCreatorInfoOpen} onOpenChange={setIsCreatorInfoOpen} />
    </header>
  );
};

export default Header;