import { AlertTriangle } from 'lucide-react'
import { Badge } from '../ui/badge'
import { Card, CardDescription, CardHeader, CardTitle } from '../ui/card'

export function AlertsPanel({ alerts }) {
  return (
    <Card className="h-full">
      <CardHeader>
        <div>
          <CardDescription>Critical alerts</CardDescription>
          <CardTitle className="mt-2">Immediate interventions</CardTitle>
        </div>
      </CardHeader>
      <div className="space-y-3">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className="flex items-start justify-between gap-4 rounded-[24px] border border-white/70 bg-white/70 p-4 dark:border-white/10 dark:bg-white/5"
          >
            <div className="flex gap-3">
              <div className="mt-1 flex size-10 items-center justify-center rounded-2xl bg-rose-500/10 text-rose-600 dark:text-rose-300">
                <AlertTriangle className="size-5" />
              </div>
              <div>
                <p className="font-semibold">{alert.group}</p>
                <p className="mt-1 text-sm text-muted-foreground">{alert.message}</p>
                <p className="mt-2 text-xs uppercase tracking-[0.16em] text-muted-foreground">{alert.hospital}</p>
              </div>
            </div>
            <Badge variant={alert.severity === 'warning' ? 'low' : 'critical'}>{alert.severity}</Badge>
          </div>
        ))}
      </div>
    </Card>
  )
}
