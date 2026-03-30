import { AlertsPanel } from '../components/dashboard/alerts-panel'
import { ChartsPanel } from '../components/dashboard/charts-panel'
import { HeroBanner } from '../components/dashboard/hero-banner'
import { InventoryGrid } from '../components/dashboard/inventory-grid'
import { RedistributionPanel } from '../components/dashboard/redistribution-panel'
import { Card, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Skeleton } from '../components/ui/skeleton'

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-[280px] rounded-[34px]" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <Skeleton key={index} className="h-[170px]" />
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <Skeleton className="h-[340px]" />
        <Skeleton className="h-[340px]" />
      </div>
    </div>
  )
}

export function DashboardPage({ data, loading }) {
  if (loading) return <DashboardSkeleton />

  return (
    <div className="space-y-6">
      <HeroBanner totals={data.totals} />
      <InventoryGrid items={data.inventorySummary} />
      <ChartsPanel demandHistory={data.demandHistory} inventorySummary={data.inventorySummary} />

      <div className="grid gap-6 xl:grid-cols-[1.1fr_1fr_1fr]">
        <AlertsPanel alerts={data.alerts} />
        <RedistributionPanel suggestions={data.redistributionSuggestions} />
        <Card>
          <CardHeader>
            <div>
              <CardDescription>AI outlook</CardDescription>
              <CardTitle className="mt-2">Tomorrow's pulse</CardTitle>
            </div>
          </CardHeader>
          <div className="space-y-3">
            {data.predictions.map((prediction) => (
              <div
                key={prediction.id}
                className="rounded-[24px] border border-white/70 bg-white/70 p-4 dark:border-white/10 dark:bg-white/5"
              >
                <p className="font-semibold">{prediction.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{prediction.summary}</p>
                <div className="mt-3 flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Confidence {prediction.confidence}%</span>
                  <span className="font-semibold text-rose-600 dark:text-rose-300">{prediction.impact}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
