import { Menu } from "lucide-react";
import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { motion } from "framer-motion";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";
import { Button } from "../ui/button";
import { useCommandCenter } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

export function AppShell({ theme, onThemeToggle }) {
  const { role } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    const saved = window.localStorage.getItem("lifeflow-sidebar-collapsed");
    return saved === "true";
  });
  const { data, isLoading, isRefreshing, error, refetch } = useCommandCenter();

  useEffect(() => {
    const closeOnResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener("resize", closeOnResize);
    return () => window.removeEventListener("resize", closeOnResize);
  }, []);

  useEffect(() => {
    window.localStorage.setItem("lifeflow-sidebar-collapsed", String(sidebarCollapsed));
  }, [sidebarCollapsed]);

  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="mx-auto flex max-w-[1680px] gap-6">
        <Sidebar collapsed={sidebarCollapsed} onToggleCollapse={() => setSidebarCollapsed((value) => !value)} />

        {sidebarOpen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-[#12070b]/60 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <div className="h-full w-[280px] p-4" onClick={(event) => event.stopPropagation()}>
              <Sidebar mobile onToggleCollapse={() => undefined} />
            </div>
          </motion.div>
        ) : null}

        <main className="min-w-0 flex-1">
          <div className="mb-5 flex items-center justify-between gap-3 lg:hidden">
            <Button size="icon" variant="secondary" onClick={() => setSidebarOpen(true)}>
              <Menu className="h-4 w-4" />
            </Button>
            <Button variant="secondary" onClick={refetch}>
              Refresh data
            </Button>
          </div>

          <Topbar
            theme={theme}
            onThemeToggle={onThemeToggle}
            mode={data?.mode}
            dashboard={data?.dashboard}
            isLoading={isLoading}
            isRefreshing={isRefreshing}
          />

          {error ? (
            <div className="mt-6 rounded-[24px] border border-rose-500/25 bg-rose-500/10 px-5 py-4 text-sm text-rose-200">
              Command center sync failed: {error.message}
            </div>
          ) : null}

          <section className="mt-8">
            <Outlet
              context={{
                commandCenter: data,
                dashboardData: data?.dashboard ?? null,
                hospitals: data?.hospitals ?? [],
                emergencyFeed: data?.emergencyFeed ?? [],
                isLoading,
                isRefreshing,
                error,
                refetch,
                role,
              }}
            />
          </section>
        </main>
      </div>
    </div>
  );
}
