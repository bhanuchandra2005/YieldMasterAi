import { Outlet, useLocation } from "react-router-dom";
import { DashboardLayout } from "./DashboardLayout";

export function DashboardLayoutWrapper() {
  const location = useLocation();
  
  // Map path to titles
  const titles: Record<string, string> = {
    "/dashboard": "Dashboard",
    "/predictions": "Predictions",
    "/analytics": "Analytics",
    "/fields": "Fields",
    "/weather": "Weather",
    "/planning": "Planning",
    "/vision": "Kisan Vision",
    "/mandi": "Mandi Connect",
    "/schemes": "Sarkari Support",
    "/profile": "Profile",
    "/settings": "Settings",
    "/admin": "Admin Panel",
  };

  const title = titles[location.pathname] || "YieldMaster AI";

  return (
    <DashboardLayout title={title}>
      <Outlet />
    </DashboardLayout>
  );
}
