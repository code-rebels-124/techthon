import { ArrowRight, ShieldCheck, TrendingUp, TriangleAlert } from "lucide-react";
import { useOutletContext } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { getDemandSignalCards } from "../utils/blood-logic";

const signalMeta = {
  warning: {
    icon: TriangleAlert,
    card: "from-rose-500 to-red-500",
    badge: "bg-rose-500/15 text-rose-600 dark:text-rose-300",
  },
  up: {
    icon: TrendingUp,
    card: "from-amber-500 to-orange-500",
    badge: "bg-amber-500/15 text-amber-700 dark:text-amber-300",
  },
  stable: {
    icon: ShieldCheck,
    card: "from-emerald-500 to-green-500",
    badge: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
  },
};

export function InsightsPage() {
  const { dashboardData, isLoading } = useOutletContext();
  const insights = dashboardData?.insights ?? [];
  const demandCards = getDemandSignalCards(dashboardData?.demandSignals ?? { "O-": "rising", "B+": "rising", "A+": "stable" });

  return (
    <div className="space-y-4">
      <div className="grid gap-4 xl:grid-cols-3">
        {demandCards.map((card, index) => {
          const meta = signalMeta[card.tone];
          const Icon = meta.icon;

          return (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06 }}
            >
              <Card className="overflow-hidden">
                <CardContent className="relative p-6">
                  <div className={`absolute inset-0 bg-gradient-to-br ${meta.card} opacity-95`} />
                  <div className="relative text-white">
                    <div className="flex items-center justify-between gap-3">
                      <Icon className="h-5 w-5" />
                      <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em]">
                        {card.status}
                      </span>
                    </div>
                    <p className="mt-10 font-display text-2xl font-bold">{card.title}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>AI insights and demand prediction</CardTitle>
            <CardDescription>Mock trend analysis based on historical movement and reserve pressure.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading
              ? Array.from({ length: 3 }).map((_, index) => <div key={index} className="h-28 animate-pulse rounded-[24px] bg-rose-100/60 dark:bg-white/8" />)
              : insights.map((insight, index) => (
                  <motion.div
                    key={insight.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.06 }}
                    className="rounded-[28px] bg-white/60 p-5 transition hover:-translate-y-1 hover:bg-white/85 dark:bg-white/6 dark:hover:bg-white/10"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-display text-xl font-bold text-strong">{insight.title}</p>
                      <Badge className="bg-rose-500/15 text-rose-600 dark:text-rose-300">
                        {insight.confidence}% confidence
                      </Badge>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-muted">{insight.description}</p>
                    <div className="mt-4 rounded-[22px] bg-gradient-to-r from-rose-500 to-red-500 p-4 text-white">
                      <p className="text-xs uppercase tracking-[0.22em] text-white/75">Recommended action</p>
                      <p className="mt-2 font-semibold">{insight.recommendedAction}</p>
                    </div>
                  </motion.div>
                ))}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Transfer guidance</CardTitle>
              <CardDescription>Actionable redistribution suggestions generated from shortage and surplus signals.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {(dashboardData?.redistribution ?? []).map((item) => (
                <div key={item.id} className="rounded-[24px] bg-white/60 p-4 dark:bg-white/6">
                  <p className="text-xs uppercase tracking-[0.22em] text-rose-500">Recommended action</p>
                  <p className="mt-2 text-sm font-semibold text-strong">{item.group} balancing route</p>
                  <div className="mt-3 flex items-center gap-2 text-sm text-muted">
                    <span>{item.from}</span>
                    <ArrowRight className="h-4 w-4 text-rose-500" />
                    <span>{item.to}</span>
                  </div>
                  <p className="mt-3 text-sm text-muted">{item.units} units • {item.timeline}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
