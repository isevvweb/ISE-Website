import React from "react";
import { Link, useNavigate } from "react-router-dom"; // Import useNavigate
import { Info, Search, Menu } from "lucide-react";
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
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"; // Import Dialog components
import { Input } from "@/components/ui/input"; // Import Input

const Header = () => {
  const [isCreatorInfoOpen, setIsCreatorInfoOpen] = React.useState(false);
  const [isSearchDialogOpen, setIsSearchDialogOpen] = React.useState(false); // State for search dialog
  const [searchQuery, setSearchQuery] = React.useState(""); // State for search input
  const navigate = useNavigate(); // Initialize useNavigate

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

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchDialogOpen(false); // Close dialog after search
      setSearchQuery(""); // Clear search query
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <Link to="/" className="mr-4 flex items-center flex-shrink-0">
          <span className="font-bold text-lg whitespace-nowrap">Islamic Society of Evansville</span>
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
          {/* Search Icon */}
          <Button
            variant="ghost"
            size="icon"
            aria-label="Search"
            onClick={() => setIsSearchDialogOpen(true)} // Open search dialog
          >
            <Search className="h-5 w-5" />
          </Button>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Info Icon */}
          <Button
            variant="ghost"
            size="icon"
            aria-label="Creator Info"
            onClick={() => setIsCreatorInfoOpen(true)}
          >
            <Info className="h-5 w-5" />
          </Button>

          {/* Mobile Navigation */}
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon" aria-label="Toggle navigation">
                <Menu className="h-6 w-6" />
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
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
      <CreatorInfoDialog isOpen={isCreatorInfoOpen} onOpenChange={setIsCreatorInfoOpen} />

      {/* Search Dialog */}
      <Dialog open={isSearchDialogOpen} onOpenChange={setIsSearchDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Search Website</DialogTitle>
            <DialogDescription>
              Enter keywords to find information across the site.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <Input
              type="text"
              placeholder="e.g., announcements, youth programs"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-grow"
            />
            <Button type="submit">Search</Button>
          </form>
        </DialogContent>
      </Dialog>
    </header>
  );
};

export default Header;