import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Info, Search, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet, SheetContent, SheetTrigger
} from "@/components/ui/sheet";
import { CreatorInfoDialog } from "@/components/CreatorInfoDialog";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

const Header = () => {
  const [isCreatorInfoOpen, setIsCreatorInfoOpen] = React.useState(false);
  const [isSearchDialogOpen, setIsSearchDialogOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const navigate = useNavigate();

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
      setIsSearchDialogOpen(false);
      setSearchQuery("");
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex items-center justify-between h-16 py-2"> {/* Adjusted height and removed flex-col */}
        <Link to="/" className="mr-4 flex items-center flex-shrink-0">
          <span className="font-bold text-lg whitespace-nowrap">
            Islamic Society<br className="md:hidden" /> of Evansville
          </span>
        </Link>

        <div className="flex items-center gap-2"> {/* Consolidated all icons into one flex container */}
          {/* Search Icon */}
          <Button
            variant="ghost"
            size="icon"
            aria-label="Search"
            onClick={() => setIsSearchDialogOpen(true)}
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

          {/* Navigation Sheet Trigger (always visible) */}
          <Sheet>
            <SheetTrigger asChild>
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