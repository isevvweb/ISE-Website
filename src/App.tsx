import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, Outlet } from "react-router-dom";
import Header from "./components/Header";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import PrayerTimes from "./pages/PrayerTimes";
import LiveStream from "./pages/LiveStream";
import YouthActivities from "./pages/YouthActivities";
import Announcements from "./pages/Announcements";
import About from "./pages/About";
import Members from "./pages/Members";
import Contact from "./pages/Contact";
import Donate from "./pages/Donate";
import BoardMembers from "./pages/BoardMembers";
import BoardOfTrustees from "./pages/BoardOfTrustees"; // Import the new BoardOfTrustees page
import AdminLayout from "@/pages/Admin/AdminLayout.tsx";
import AdminDashboard from "@/pages/Admin/AdminDashboard.tsx";
import AnnouncementsAdmin from "@/pages/Admin/AnnouncementsAdmin.tsx";
import IqamahAdmin from "@/pages/Admin/IqamahAdmin.tsx";
import AnnualReportsAdmin from "@/pages/Admin/AnnualReportsAdmin.tsx";
import BoardMembersAdmin from "@/pages/Admin/BoardMembersAdmin.tsx";
import DonationCausesAdmin from "@/pages/Admin/DonationCausesAdmin.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <Routes>
        {/* Public Routes with Header */}
        <Route element={<div className="flex flex-col min-h-screen"><Header /><main className="flex-grow"><Outlet /></main></div>}>
          <Route path="/" element={<Index />} />
          <Route path="/prayer-times" element={<PrayerTimes />} />
          <Route path="/live-stream" element={<LiveStream />} />
          <Route path="/youth-activities" element={<YouthActivities />} />
          <Route path="/announcements" element={<Announcements />} />
          <Route path="/about" element={<About />} />
          <Route path="/members" element={<Members />} />
          <Route path="/members/board" element={<BoardMembers />} />
          <Route path="/members/trustees" element={<BoardOfTrustees />} /> {/* New route for Board of Trustees */}
          <Route path="/contact" element={<Contact />} />
          <Route path="/donate" element={<Donate />} />
        </Route>

        {/* Admin Routes (now public) */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="announcements" element={<AnnouncementsAdmin />} />
          <Route path="iqamah" element={<IqamahAdmin />} />
          <Route path="reports" element={<AnnualReportsAdmin />} />
          <Route path="board-members" element={<BoardMembersAdmin />} />
          <Route path="donation-causes" element={<DonationCausesAdmin />} />
        </Route>

        {/* Catch-all route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;