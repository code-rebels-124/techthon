import { ArrowRight, Sparkles } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";

export function RecommendedActions({ suggestions }) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <div>
          <CardTitle>Redistribution engine</CardTitle>
          <CardDescription>Suggested inter-hospital transfers generated from shortage and surplus signals.</CardDescription>
        </div>
        <Button variant="secondary">
          <Sparkles className="h-4 w-4" />
          Smart routing
        </Button>
      </CardHeader>
      <CardContent className="grid gap-4 xl:grid-cols-3">
        {suggestions.map((item) => (
          <div key={item.id} className="rounded-[28px] bg-gradient-to-br from-white/70 to-white/45 p-5 dark:from-white/7 dark:to-white/4">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-rose-500">Recommended action</p>
            <p className="mt-3 font-display text-xl font-bold text-strong">{item.group} transfer</p>
            <div className="mt-4 flex items-center gap-3 text-sm font-medium text-muted">
              <span>{item.from}</span>
              <ArrowRight className="h-4 w-4 text-rose-500" />
              <span>{item.to}</span>
            </div>
            <p className="mt-4 text-sm leading-6 text-muted">
              Move <span className="font-semibold text-strong">{item.units} units</span> within the next{" "}
              <span className="font-semibold text-strong">{item.timeline}</span> to cover forecast demand.
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
