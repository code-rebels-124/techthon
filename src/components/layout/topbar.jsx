import { Activity, Bell, MoonStar, ShieldAlert, SunMedium } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { useAuth } from "../../context/AuthContext";

export function Topbar({ theme, onThemeToggle, dashboard, isLoading, isRefreshing, mode }) {
  const { profile, role } = useAuth();
  const [open, setOpen] = useState(false);

  const notifications = useMemo(() => {
    if (!dashboard) {
      return [];
    }

    if (role === "hospital") {
      return [
        ...(dashboard.lowStock ?? []).map((item) => ({
          id: `stock-${item.bloodGroup}`,
          title: `${item.bloodGroup} stock ${item.status}`,
          description: `${item.units} units available against threshold ${item.threshold}.`,
        })),
        ...(dashboard.emergencyResourcesActive ?? []).map((item) => ({
          id: item.id,
          title: item.title,
          description: `${item.unitsNeeded} units required. ${item.notes || "Emergency response pending."}`,
        })),
      ];
    }

    return (dashboard.activeRequests ?? []).map((item) => ({
      id: item.id,
      title: `${item.bloodGroup} request ${item.status}`,
      description:
        item.acceptedHospital ?? `${item.matches?.length ?? 0} matching hospitals found near ${item.location}.`,
    }));
  }, [dashboard, role]);

  return (
    <header className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-sm font-medium uppercase tracking-[0.3em] text-rose-500">Neural blood command center</p>
          {mode ? (
            <Badge className={mode === "mongo" ? "bg-emerald-500/15 text-emerald-300" : "bg-amber-500/15 text-amber-300"}>
              {mode === "mongo" ? "mongo live" : "local demo"}
            </Badge>
          ) : null}
        </div>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-strong md:text-4xl">
          {role === "hospital" ? "Hospital Operations Grid" : "Emergency Request Network"}
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted md:text-base">
          {role === "hospital"
            ? "Manage isolated hospital inventory, donor readiness, and emergency responses from one live control surface."
            : "Submit urgent blood requests, monitor matching hospitals, and track active responses in real time."}
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="glass-panel hidden rounded-2xl px-4 py-3 text-right sm:block">
          <p className="text-xs uppercase tracking-[0.2em] text-muted">{role ?? "guest"}</p>
          <p className="mt-1 text-sm font-semibold text-strong">{profile?.name ?? "Secure access"}</p>
          <p className="mt-1 text-xs text-muted">
            {profile?.email ?? "No active session"}
            {isRefreshing ? " | syncing..." : ""}
          </p>
        </div>

        <Button size="icon" variant="secondary" onClick={onThemeToggle} aria-label="Toggle theme">
          {theme === "light" ? <MoonStar className="h-4 w-4" /> : <SunMedium className="h-4 w-4" />}
        </Button>

        <div className="relative">
          <Button size="icon" variant="secondary" onClick={() => setOpen((value) => !value)} aria-label="Alerts">
            <Bell className="h-4 w-4" />
          </Button>
          {notifications.length > 0 ? (
            <span className="absolute right-1 top-1 h-2.5 w-2.5 rounded-full bg-rose-500 ring-4 ring-white/70 dark:ring-[#13090d]" />
          ) : null}

          {open ? (
            <Card className="absolute right-0 top-14 z-30 w-[320px] p-4">
              <div className="mb-4 flex items-center justify-between">
                <p className="font-display text-base font-bold text-strong">Live status</p>
                <Badge className="bg-accent-soft text-accent">{notifications.length} active</Badge>
              </div>
              <div className="space-y-3">
                {isLoading ? (
                  <div className="rounded-2xl bg-white/55 p-3 text-sm text-muted dark:bg-white/6">Refreshing feed...</div>
                ) : notifications.length ? (
                  notifications.slice(0, 5).map((item) => (
                    <div key={item.id} className="rounded-2xl bg-white/55 p-3 dark:bg-white/6">
                      <div className="flex items-center gap-2">
                        {role === "hospital" ? (
                          <ShieldAlert className="h-3.5 w-3.5 text-rose-500" />
                        ) : (
                          <Activity className="h-3.5 w-3.5 text-cyan-400" />
                        )}
                        <p className="text-sm font-semibold text-strong">{item.title}</p>
                      </div>
                      <p className="mt-1 text-xs leading-5 text-muted">{item.description}</p>
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl bg-white/55 p-3 text-sm text-muted dark:bg-white/6">No urgent items right now.</div>
                )}
              </div>
            </Card>
          ) : null}
        </div>
      </div>
    </header>
  );
}
