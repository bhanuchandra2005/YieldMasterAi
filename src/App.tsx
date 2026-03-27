import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { ThemeProvider } from "next-themes";
import { DashboardLayoutWrapper } from "@/components/DashboardLayoutWrapper";
import Index from "./pages/Index.tsx";
import Login from "./pages/Login.tsx";
import Signup from "./pages/Signup.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import Predictions from "./pages/Predictions.tsx";
import Fields from "./pages/Fields.tsx";
import Weather from "./pages/Weather.tsx";
import Planning from "./pages/Planning.tsx";
import Profile from "./pages/Profile.tsx";
import SettingsPage from "./pages/Settings.tsx";
import AdminPanel from "./pages/AdminPanel.tsx";
import AnalyticsPage from "./pages/Analytics.tsx";
import KisanVision from "./pages/KisanVision.tsx";
import MandiConnect from "./pages/MandiConnect.tsx";
import SarkariSupport from "./pages/SarkariSupport.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route element={<ProtectedRoute><DashboardLayoutWrapper /></ProtectedRoute>}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/predictions" element={<Predictions />} />
                <Route path="/fields" element={<Fields />} />
                <Route path="/weather" element={<Weather />} />
                <Route path="/planning" element={<Planning />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/admin" element={<AdminPanel />} />
                <Route path="/analytics" element={<AnalyticsPage />} />
                <Route path="/vision" element={<KisanVision />} />
                <Route path="/mandi" element={<MandiConnect />} />
                <Route path="/schemes" element={<SarkariSupport />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
