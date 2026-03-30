import { AlertTriangle, CalendarClock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";

export function CriticalAlerts({ alerts }) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Critical alerts</CardTitle>
        <CardDescription>Shortages and expiring blood units requiring urgent action.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {alerts.map((alert) => (
          <div key={alert.id} className="rounded-[24px] bg-white/60 p-4 dark:bg-white/6">
            <div className="flex items-start justify-between gap-3">
              <div className="flex gap-3">
                <div className="rounded-2xl bg-rose-500/12 p-3 text-rose-500">
                  {alert.type === "expiry" ? <CalendarClock className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                </div>
                <div>
                  <p className="font-semibold text-strong">{alert.title}</p>
                  <p className="mt-1 text-sm leading-6 text-muted">{alert.description}</p>
                </div>
              </div>
              <Badge
                className={
                  alert.priority === "high"
                    ? "bg-rose-500/15 text-rose-600 dark:text-rose-300"
                    : "bg-amber-500/15 text-amber-700 dark:text-amber-300"
                }
              >
                {alert.priority}
              </Badge>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
