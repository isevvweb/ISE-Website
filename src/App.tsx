import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
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
import AdminLayout from "@/pages/Admin/AdminLayout.tsx"; // Corrected path
import AdminDashboard from "@/pages/Admin/AdminDashboard.tsx"; // Corrected path
import AnnouncementsAdmin from "@/pages/Admin/AnnouncementsAdmin.tsx"; // Corrected path
import IqamahAdmin from "@/pages/Admin/IqamahAdmin.tsx"; // Corrected path
import AnnualReportsAdmin from "@/pages/Admin/AnnualReportsAdmin.tsx"; // Corrected path
import BoardMembersAdmin from "@/pages/Admin/BoardMembersAdmin.tsx"; // Corrected path
import DonationCausesAdmin from "@/pages/Admin/DonationCausesAdmin.tsx"; // Corrected path

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
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
            <Route path="/contact" element={<Contact />} />
            <Route path="/donate" element={<Donate />} />
          </Route>

          {/* Admin Routes (hidden from public navigation) */}
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
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;