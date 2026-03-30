import { useOutletContext } from "react-router-dom";
import { Activity, AlertTriangle, Building2 } from "lucide-react";
import { ResponsiveContainer, Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";

function SummaryTile({ icon: Icon, label, value, tone }) {
  return (
    <Card className="interactive-surface">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-muted">{label}</p>
            <p className="mt-4 font-display text-4xl font-bold text-strong">{value}</p>
          </div>
          <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${tone}`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ConsumerDashboardPage() {
  const { dashboardData, isLoading } = useOutletContext();

  if (isLoading || !dashboardData) {
    return <div className="rounded-[28px] bg-white/5 p-10 text-center text-muted">Loading requester overview...</div>;
  }

  const summary = dashboardData.summary;

  return (
    <div className="space-y-5">
      <div className="grid gap-4 xl:grid-cols-3">
        <SummaryTile icon={Building2} label="Hospitals Online" value={summary.hospitalsOnline} tone="bg-cyan-500/15 text-cyan-300" />
        <SummaryTile icon={AlertTriangle} label="Critical Hospitals" value={summary.criticalHospitals} tone="bg-rose-500/15 text-rose-300" />
        <SummaryTile icon={Activity} label="Your Active Requests" value={summary.activeRequests} tone="bg-emerald-500/15 text-emerald-300" />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="interactive-surface min-w-0">
          <CardHeader>
            <CardTitle>Network Blood Availability</CardTitle>
            <CardDescription>Live totals across all hospitals currently connected to the platform.</CardDescription>
          </CardHeader>
          <CardContent className="h-[320px] min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dashboardData.charts.bloodAvailability}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="bloodGroup" stroke="var(--muted-text)" />
                <YAxis stroke="var(--muted-text)" />
                <Tooltip />
                <Bar dataKey="units" fill="#22d3ee" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="interactive-surface">
          <CardHeader>
            <CardTitle>Your Emergency Requests</CardTitle>
            <CardDescription>Track response progress and hospital matches here.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {dashboardData.activeRequests.length ? (
              dashboardData.activeRequests.map((request) => (
                <div key={request.id} className="rounded-[24px] border border-white/10 bg-black/20 p-4">
                  <p className="font-semibold text-strong">
                    {request.bloodGroup} in {request.location}
                  </p>
                  <p className="mt-2 text-sm text-muted">
                    {request.unitsNeeded} units | {request.matches.length} matching hospitals
                  </p>
                  <p className="mt-2 text-sm text-muted">
                    Status: {request.status}
                    {request.acceptedHospital ? ` by ${request.acceptedHospital}` : ""}
                  </p>
                </div>
              ))
            ) : (
              <div className="rounded-[24px] border border-white/10 bg-black/20 p-4 text-sm text-muted">
                No emergency requests yet. Use the Emergency page to create one.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
