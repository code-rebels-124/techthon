import { BrainCircuit, Sparkles, TrendingUp } from 'lucide-react'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '../components/ui/card'

export function InsightsPage({ predictions = [], suggestions = [] }) {
  return (
    <div className="space-y-6">
      <Card className="overflow-hidden bg-gradient-to-br from-slate-900 via-rose-950 to-red-900 text-white dark:border-white/10">
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em]">
              <BrainCircuit className="size-4" />
              AI Insights
            </div>
            <h2 className="mt-4 text-3xl font-semibold">Demand prediction and smart redistribution</h2>
            <p className="mt-3 max-w-2xl text-rose-100/85">
              Forecasts are powered by rolling demand averages and network availability patterns to help teams
              act before a shortage becomes an emergency.
            </p>
          </div>
          <Button variant="secondary" className="bg-white text-slate-900 hover:bg-rose-50">
            <Sparkles className="size-4" />
            Generate executive summary
          </Button>
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_1fr]">
        <Card>
          <CardHeader>
            <div>
              <CardDescription>Predictions</CardDescription>
              <CardTitle className="mt-2">Next 24 hour outlook</CardTitle>
            </div>
          </CardHeader>
          <div className="space-y-4">
            {predictions.map((prediction, index) => (
              <div
                key={prediction.id}
                className="rounded-[24px] border border-white/70 bg-white/70 p-5 dark:border-white/10 dark:bg-white/5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{prediction.title}</p>
                    <p className="mt-2 text-sm text-muted-foreground">{prediction.summary}</p>
                  </div>
                  <Badge variant={index === 0 ? 'critical' : 'info'}>{prediction.confidence}%</Badge>
                </div>
                <div className="mt-4 flex items-center justify-between text-sm">
                  <span className="inline-flex items-center gap-2 text-muted-foreground">
                    <TrendingUp className="size-4" />
                    Impact {prediction.impact}
                  </span>
                  {index === 0 ? (
                    <span className="font-semibold text-rose-600 dark:text-rose-300">Recommended Action</span>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardDescription>Redistribution playbook</CardDescription>
              <CardTitle className="mt-2">Suggested transfers</CardTitle>
            </div>
          </CardHeader>
          <div className="space-y-4">
            {suggestions.map((suggestion, index) => (
              <div
                key={suggestion.id}
                className={`rounded-[24px] p-5 ${
                  index === 0
                    ? 'bg-gradient-to-br from-rose-500 to-red-500 text-white'
                    : 'border border-white/70 bg-white/70 dark:border-white/10 dark:bg-white/5'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-lg font-semibold">
                    {suggestion.transferUnits} units · {suggestion.bloodGroup}
                  </p>
                  <Badge variant={index === 0 ? 'safe' : 'info'}>{suggestion.priority}</Badge>
                </div>
                <p className={`mt-3 text-sm ${index === 0 ? 'text-rose-50/90' : 'text-muted-foreground'}`}>
                  Transfer from {suggestion.donorHospital} to {suggestion.receiverHospital}.
                </p>
                <div
                  className={`mt-4 flex items-center justify-between text-sm ${
                    index === 0 ? 'text-rose-50' : 'text-muted-foreground'
                  }`}
                >
                  <span>ETA {suggestion.eta}</span>
                  <span>{index === 0 ? 'Highest priority route' : 'Ready to dispatch'}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
