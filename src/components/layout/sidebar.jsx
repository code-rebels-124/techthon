import { ChevronsLeft, Droplets, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";
import { getNavigationItems } from "../../data/navigation";
import { useAuth } from "../../context/AuthContext";

export function Sidebar({ collapsed = false, onToggleCollapse, mobile = false }) {
  const { profile, role, logout } = useAuth();
  const navigationItems = getNavigationItems(role);

  return (
    <aside
      className={cn(
        "glass-panel shrink-0 rounded-[32px] border border-white/45 p-4 transition-all duration-300",
        mobile ? "flex h-full w-[280px] flex-col" : "hidden lg:flex lg:flex-col",
        collapsed && !mobile ? "w-24" : "w-72",
      )}
    >
      <div className={cn("mb-8 flex items-center", collapsed && !mobile ? "justify-center" : "justify-between gap-4")}>
        <div className={cn("flex items-center", collapsed && !mobile ? "justify-center" : "gap-4")}>
          <div className="flex h-14 w-14 items-center justify-center rounded-[24px] bg-gradient-to-br from-rose-500 to-red-500 text-white shadow-lg shadow-rose-500/30">
            <Droplets className="h-7 w-7" />
          </div>
          {!collapsed || mobile ? (
            <div>
              <p className="font-display text-xl font-bold tracking-tight text-strong">LifeFlow</p>
              <p className="text-sm text-muted">Smart Blood Supply</p>
            </div>
          ) : null}
        </div>

        {!mobile ? (
          <button
            type="button"
            onClick={onToggleCollapse}
            className="glass-panel flex h-11 w-11 items-center justify-center rounded-2xl text-strong transition hover:bg-white/85 dark:hover:bg-white/10"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </button>
        ) : null}
      </div>

      <nav className="space-y-2">
        {navigationItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                "relative flex items-center gap-3 overflow-hidden rounded-2xl px-4 py-3 text-sm font-semibold text-muted transition-all duration-300",
                isActive && "text-white",
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive ? (
                  <motion.span
                    layoutId="nav-active"
                    className="absolute inset-0 rounded-2xl bg-gradient-to-r from-rose-500 via-red-500 to-pink-500"
                  />
                ) : null}
                <span className={cn("relative z-10 flex items-center", collapsed && !mobile ? "justify-center" : "gap-3")}>
                  <Icon className="h-4 w-4" />
                  {!collapsed || mobile ? label : null}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto space-y-4">
        <div className={cn("rounded-[28px] bg-gradient-to-br from-rose-500/90 to-red-500/90 text-white shadow-xl shadow-rose-500/25", collapsed && !mobile ? "p-4" : "p-5")}>
          {collapsed && !mobile ? (
            <div className="flex justify-center">
              <ChevronsLeft className="h-5 w-5 text-white/80" />
            </div>
          ) : (
            <>
              <p className="font-display text-lg font-bold">{profile?.name ?? "LifeFlow Access"}</p>
              <p className="mt-2 text-sm capitalize text-white/80">{role ?? "requester"} account</p>
              <p className="mt-4 break-all text-xs normal-case tracking-normal text-white/70">
                {profile?.email ?? "Demo mode"}
              </p>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={logout}
          className={cn(
            "glass-panel w-full rounded-2xl px-4 py-3 text-sm font-semibold text-strong transition hover:bg-white/85 dark:hover:bg-white/10",
            collapsed && !mobile && "px-0",
          )}
        >
          {collapsed && !mobile ? "Out" : "Logout"}
        </button>
      </div>
    </aside>
  );
}
