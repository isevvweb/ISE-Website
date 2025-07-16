import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, Outlet, Navigate } from "react-router-dom";
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
import AdminLayout from "@/pages/Admin/AdminLayout.tsx";
import AdminDashboard from "@/pages/Admin/AdminDashboard.tsx";
import AnnouncementsAdmin from "@/pages/Admin/AnnouncementsAdmin.tsx";
import IqamahAdmin from "@/pages/Admin/IqamahAdmin.tsx";
import AnnualReportsAdmin from "@/pages/Admin/AnnualReportsAdmin.tsx";
import BoardMembersAdmin from "@/pages/Admin/BoardMembersAdmin.tsx";
import DonationCausesAdmin from "@/pages/Admin/DonationCausesAdmin.tsx";
import Login from "@/pages/Login.tsx"; // Import the new Login page
import { useSession } from "@/components/SessionContextProvider.tsx"; // Import useSession

const queryClient = new QueryClient();

// PrivateRoute component to protect admin routes
const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, isLoading } = useSession();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading authentication...</div>;
  }

  return session ? <>{children}</> : <Navigate to="/login" replace />;
};

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
          <Route path="/contact" element={<Contact />} />
          <Route path="/donate" element={<Donate />} />
        </Route>

        {/* Login Route */}
        <Route path="/login" element={<Login />} />

        {/* Admin Routes (hidden from public navigation) - Protected */}
        <Route path="/admin" element={<PrivateRoute><AdminLayout /></PrivateRoute>}>
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