import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, Outlet } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { Analytics } from "@vercel/analytics/react"; // Import Vercel Analytics

import Header from "./components/Header";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import PrayerTimes from "./pages/PrayerTimes";
import LiveStream from "./pages/LiveStream";
import YouthActivities from "./pages/YouthActivities";
import PastYouthEvents from "./pages/PastYouthEvents";
import WeeklyYouthHalaqa from "@/pages/YouthActivities/WeeklyYouthHalaqa.tsx";
import SportsRecreation from "@/pages/YouthActivities/SportsRecreation.tsx";
import CommunityServiceProjects from "@/pages/YouthActivities/CommunityServiceProjects.tsx";
import Announcements from "./pages/Announcements";
import About from "./pages/About";
import Members from "./pages/Members";
import Contact from "./pages/Contact";
import Donate from "./pages/Donate";
import AnnualReports from "./pages/AnnualReports";
import BoardMembers from "./pages/BoardMembers";
import BoardOfTrustees from "./pages/BoardOfTrustees";
import AdminLayout from "@/pages/Admin/AdminLayout.tsx";
import AdminDashboard from "@/pages/Admin/AdminDashboard.tsx";
import AnnouncementsAdmin from "@/pages/Admin/AnnouncementsAdmin.tsx";
import IqamahAdmin from "@/pages/Admin/IqamahAdmin.tsx";
import AnnualReportsAdmin from "@/pages/Admin/AnnualReportsAdmin.tsx";
import BoardMembersAdmin from "@/pages/Admin/BoardMembersAdmin.tsx";
import BoardOfTrusteesAdmin from "@/pages/Admin/BoardOfTrusteesAdmin.tsx";
import LeadershipAdmin from "@/pages/Admin/LeadershipAdmin.tsx";
import DonationCausesAdmin from "@/pages/Admin/DonationCausesAdmin.tsx";
import YouthEventsAdmin from "@/pages/Admin/YouthEventsAdmin.tsx";
import YouthSubprogramsAdmin from "@/pages/Admin/YouthSubprogramsAdmin.tsx";
import DigitalSignSettingsAdmin from "@/pages/Admin/DigitalSignSettingsAdmin.tsx";
import Search from "./pages/Search";
import DigitalSign from "./pages/DigitalSign";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Analytics /> {/* Vercel Analytics component added here */}
        <Routes>
          {/* Public Routes with Header */}
          <Route element={<div className="flex flex-col min-h-screen"><Header /><main className="flex-grow"><Outlet /></main></div>}>
            <Route path="/" element={<Index />} />
            <Route path="/prayer-times" element={<PrayerTimes />} />
            <Route path="/live-stream" element={<LiveStream />} />
            <Route path="/youth-activities" element={<YouthActivities />} />
            <Route path="/youth-activities/past-events" element={<PastYouthEvents />} />
            <Route path="/youth-activities/halaqa" element={<WeeklyYouthHalaqa />} />
            <Route path="/youth-activities/sports" element={<SportsRecreation />} />
            <Route path="/youth-activities/community-service" element={<CommunityServiceProjects />} />
            <Route path="/announcements" element={<Announcements />} />
            <Route path="/about" element={<About />} />
            <Route path="/members" element={<Members />} />
            <Route path="/members/board" element={<BoardMembers />} />
            <Route path="/members/trustees" element={<BoardOfTrustees />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/donate" element={<Donate />} />
            <Route path="/annual-reports" element={<AnnualReports />} />
            <Route path="/search" element={<Search />} />
          </Route>

          {/* Admin Routes (Publicly Accessible) */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="announcements" element={<AnnouncementsAdmin />} />
            <Route path="iqamah" element={<IqamahAdmin />} />
            <Route path="reports" element={<AnnualReportsAdmin />} />
            <Route path="donation-causes" element={<DonationCausesAdmin />} />
            <Route path="leadership" element={<LeadershipAdmin />} />
            <Route path="board-members" element={<BoardMembersAdmin />} />
            <Route path="trustees" element={<BoardOfTrusteesAdmin />} />
            <Route path="youth-events" element={<YouthEventsAdmin />} />
            <Route path="youth-subprograms" element={<YouthSubprogramsAdmin />} />
            <Route path="digital-sign-settings" element={<DigitalSignSettingsAdmin />} />
          </Route>

          {/* Digital Sign Route (no header/footer) */}
          <Route path="/digital-sign" element={<DigitalSign />} />

          {/* Catch-all route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;