import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Activity, AlertTriangle, Droplets, RadioTower, Users } from "lucide-react";
import { ResponsiveContainer, Area, AreaChart, Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { getStatusTone } from "../lib/utils";

function StatCard({ icon: Icon, label, value, accent }) {
  return (
    <Card className="interactive-surface">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-muted">{label}</p>
            <p className="mt-4 font-display text-4xl font-bold text-strong">{value}</p>
          </div>
          <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${accent}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function DashboardPage() {
  const { dashboardData, isLoading, refetch } = useOutletContext();
  const [completingId, setCompletingId] = useState(null);

  if (isLoading || !dashboardData) {
    return <div className="rounded-[28px] bg-white/5 p-10 text-center text-muted">Loading live hospital dashboard...</div>;
  }

  const summary = dashboardData.summary;
  const acceptedFeed = dashboardData.emergencyFeed.filter((request) => request.status === "accepted");

  return (
    <div className="space-y-5">
      <div className="grid gap-4 xl:grid-cols-4">
        <StatCard icon={Droplets} label="Available Units" value={summary.totalUnits} accent="bg-rose-500/15 text-rose-400" />
        <StatCard icon={AlertTriangle} label="Low Stock Alerts" value={summary.lowStockAlerts} accent="bg-amber-500/15 text-amber-300" />
        <StatCard icon={Users} label="Donor Registry" value={summary.donorCount} accent="bg-emerald-500/15 text-emerald-300" />
        <StatCard icon={RadioTower} label="Active Emergencies" value={summary.activeEmergencyRequests} accent="bg-cyan-500/15 text-cyan-300" />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.35fr_1fr]">
        <Card className="interactive-surface min-w-0">
          <CardHeader>
            <CardTitle>Blood Availability by Type</CardTitle>
            <CardDescription>Inventory updates are reflected here from the same backend records used by emergency matching.</CardDescription>
          </CardHeader>
          <CardContent className="h-[320px] min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dashboardData.charts.availability}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="bloodGroup" stroke="var(--muted-text)" />
                <YAxis stroke="var(--muted-text)" />
                <Tooltip />
                <Bar dataKey="units" fill="#ff4d6d" radius={[10, 10, 0, 0]} />
                <Bar dataKey="threshold" fill="#22d3ee" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="interactive-surface min-w-0">
          <CardHeader>
            <CardTitle>Emergency Resources Active</CardTitle>
            <CardDescription>Urgent requests matched to your hospital right now.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {dashboardData.emergencyResourcesActive.length ? (
              dashboardData.emergencyResourcesActive.map((item) => (
                <div key={item.id} className="rounded-[24px] border border-white/10 bg-black/20 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-strong">{item.title}</p>
                    <Badge className="bg-rose-500/15 text-rose-300">{item.unitsNeeded} units</Badge>
                  </div>
                  <p className="mt-2 text-sm text-muted">{item.notes || "Priority dispatch recommended."}</p>
                </div>
              ))
            ) : (
              <div className="rounded-[24px] border border-white/10 bg-black/20 p-4 text-sm text-muted">No urgent matches at the moment.</div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="interactive-surface">
          <CardHeader>
            <CardTitle>Donation Trends</CardTitle>
            <CardDescription>Recent donor readiness growth for this hospital.</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px] min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dashboardData.charts.donationTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="label" stroke="var(--muted-text)" />
                <YAxis stroke="var(--muted-text)" />
                <Tooltip />
                <Area type="monotone" dataKey="donations" stroke="#34d399" fill="#34d39933" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="interactive-surface">
          <CardHeader>
            <CardTitle>Recent Donor Activity</CardTitle>
            <CardDescription>Last updates generated by donor and inventory operations.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {dashboardData.recentActivity.map((item) => (
              <div key={item.id} className="rounded-[24px] border border-white/10 bg-black/20 p-4">
                <p className="font-semibold text-strong">{item.title}</p>
                <p className="mt-2 text-sm text-muted">{item.description}</p>
                <p className="mt-3 text-xs uppercase tracking-[0.2em] text-muted">
                  {new Date(item.createdAt).toLocaleString()}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="interactive-surface">
        <CardHeader className="flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>Accepted Emergency Dispatches</CardTitle>
            <CardDescription>Complete accepted requests once the blood transfer is finalized.</CardDescription>
          </div>
          <Button variant="secondary" onClick={refetch}>
            Refresh
          </Button>
        </CardHeader>
        <CardContent className="grid gap-3 xl:grid-cols-2">
          {acceptedFeed.length ? (
            acceptedFeed.map((request) => (
              <div key={request.id} className="rounded-[24px] border border-white/10 bg-black/20 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold text-strong">
                      {request.bloodGroup} for {request.location}
                    </p>
                    <p className="mt-1 text-sm text-muted">
                      {request.unitsNeeded} units accepted on {new Date(request.acceptedAt).toLocaleString()}
                    </p>
                  </div>
                  <Badge className={getStatusTone("low")}>accepted</Badge>
                </div>
                <p className="mt-3 text-sm text-muted">{request.notes || "Requester awaiting confirmation."}</p>
                <div className="mt-4">
                  <Button
                    size="sm"
                    onClick={async () => {
                      setCompletingId(request.id);
                      try {
                        const { respondToEmergencyRequest } = await import("../services/api");
                        await respondToEmergencyRequest(request.id, "complete");
                        await refetch();
                      } finally {
                        setCompletingId(null);
                      }
                    }}
                    disabled={completingId === request.id}
                  >
                    {completingId === request.id ? "Completing..." : "Mark completed"}
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-[24px] border border-white/10 bg-black/20 p-4 text-sm text-muted">
              No accepted transfers are waiting for completion.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
