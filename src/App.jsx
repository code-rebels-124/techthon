import { useEffect, useMemo, useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/layout/app-shell";
import { LoginPage } from "./pages/Login";
import { RegisterPage } from "./pages/Register";
import { DashboardPage } from "./pages/dashboard-page";
import { HospitalsPage } from "./pages/hospitals-page";
import { EmergencyPage } from "./pages/emergency-page";
import { DonorFinderPage } from "./pages/donor-finder-page";
import { ConsumerDashboardPage } from "./pages/consumer-dashboard-page";
import { InventoryPage } from "./pages/inventory-page";
import { MapViewPage } from "./pages/map-view-page";
import { ProtectedRoute } from "./routes/ProtectedRoute";
import { useAuth } from "./context/AuthContext";
import { THEME_KEY } from "./utils/theme";
import { getHomeRoute } from "./utils/role-routes";

function RoleHomeRedirect() {
  const { role } = useAuth();
  return <Navigate to={getHomeRoute(role ?? "requester")} replace />;
}

export default function App() {
  const { currentUser } = useAuth();
  const [theme, setTheme] = useState(() => window.localStorage.getItem(THEME_KEY) ?? "light");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    window.localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  const shellProps = useMemo(
    () => ({
      theme,
      onThemeToggle: () => setTheme((current) => (current === "light" ? "dark" : "light")),
    }),
    [theme],
  );

  return (
    <Routes>
      <Route path="/login" element={currentUser ? <RoleHomeRedirect /> : <LoginPage />} />
      <Route path="/register" element={currentUser ? <RoleHomeRedirect /> : <RegisterPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell {...shellProps} />}>
          <Route path="/" element={<RoleHomeRedirect />} />
          <Route path="/hospitals" element={<HospitalsPage />} />
          <Route path="/map" element={<MapViewPage />} />
          <Route path="/emergency" element={<EmergencyPage />} />

          <Route element={<ProtectedRoute allowedRoles={["hospital"]} />}>
            <Route path="/hospital" element={<DashboardPage />} />
            <Route path="/inventory" element={<InventoryPage />} />
            <Route path="/donors" element={<DonorFinderPage />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["requester"]} />}>
            <Route path="/consumer" element={<ConsumerDashboardPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Route>
    </Routes>
  );
}
