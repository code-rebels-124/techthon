import { AlertTriangle, CheckCircle2, TimerReset } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { getStatusTone } from "../../lib/utils";

const statusCopy = {
  critical: { icon: AlertTriangle, label: "Critical" },
  low: { icon: TimerReset, label: "Low stock" },
  safe: { icon: CheckCircle2, label: "Safe" },
};

export function BloodGroupGrid({ inventory }) {
  return (
    <Card>
      <CardHeader className="flex-row items-end justify-between">
        <div>
          <CardTitle>Blood inventory pulse</CardTitle>
          <CardDescription>Cross-network stock signal across all supported blood groups.</CardDescription>
        </div>
        <Badge className="bg-accent-soft text-accent">Real-time overview</Badge>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {inventory.map((item, index) => {
            const statusMeta = statusCopy[item.status];
            const StatusIcon = statusMeta.icon;

            return (
              <motion.div
                key={item.group}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.04 }}
                className="rounded-[26px] bg-white/60 p-5 dark:bg-white/6"
              >
                <div className="flex items-center justify-between">
                  <div className="rounded-2xl bg-gradient-to-br from-rose-500 to-red-500 px-4 py-3 font-display text-2xl font-bold text-white shadow-lg shadow-rose-500/20">
                    {item.group}
                  </div>
                  <div className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusTone(item.status)}`}>
                    <span className="inline-flex items-center gap-1">
                      <StatusIcon className="h-3.5 w-3.5" />
                      {statusMeta.label}
                    </span>
                  </div>
                </div>
                <p className="mt-6 text-3xl font-bold text-strong">{item.units} units</p>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-rose-100 dark:bg-white/8">
                  <div
                    className={`h-full rounded-full ${
                      item.status === "critical"
                        ? "bg-rose-500"
                        : item.status === "low"
                          ? "bg-amber-500"
                          : "bg-emerald-500"
                    }`}
                    style={{ width: `${item.fillRate}%` }}
                  />
                </div>
                <p className="mt-3 text-sm text-muted">
                  Threshold {item.threshold} units • Expiring soon: {item.expiringSoon}
                </p>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
