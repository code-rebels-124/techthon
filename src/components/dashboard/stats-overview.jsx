import { Activity, Droplet, ShieldAlert, Truck } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { AnimatedNumber } from "./animated-number";

const statIcons = {
  inventory: Droplet,
  critical: ShieldAlert,
  demand: Activity,
  transfers: Truck,
};

export function StatsOverview({ summary }) {
  const items = [
    { key: "inventory", label: "Total units live", value: summary.totalUnits, accent: "from-rose-500/15 to-transparent" },
    { key: "critical", label: "Critical alerts", value: summary.criticalCount, accent: "from-red-500/15 to-transparent" },
    {
      key: "demand",
      label: "Predicted tomorrow",
      value: summary.predictedDemandTomorrow,
      accent: "from-pink-500/15 to-transparent",
    },
    {
      key: "transfers",
      label: "Recommended transfers",
      value: summary.redistributionCount,
      accent: "from-amber-500/15 to-transparent",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => {
        const Icon = statIcons[item.key];

        return (
          <Card key={item.key} className="overflow-hidden">
            <CardContent className="relative p-6">
              <div className={`absolute inset-0 bg-gradient-to-br ${item.accent}`} />
              <div className="relative flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted">{item.label}</p>
                  <p className="mt-4 font-display text-4xl font-bold text-strong">
                    <AnimatedNumber value={item.value} />
                  </p>
                </div>
                <div className="rounded-2xl bg-white/65 p-3 text-rose-500 shadow-sm dark:bg-white/8">
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
