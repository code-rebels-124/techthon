import { ArrowRightLeft } from 'lucide-react'
import { Badge } from '../ui/badge'
import { Card, CardDescription, CardHeader, CardTitle } from '../ui/card'

export function RedistributionPanel({ suggestions }) {
  return (
    <Card className="h-full">
      <CardHeader>
        <div>
          <CardDescription>Recommended actions</CardDescription>
          <CardTitle className="mt-2">Redistribution engine</CardTitle>
        </div>
      </CardHeader>
      <div className="space-y-3">
        {suggestions.map((item) => (
          <div
            key={item.id}
            className="rounded-[24px] border border-white/70 bg-white/70 p-4 dark:border-white/10 dark:bg-white/5"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex gap-3">
                <div className="flex size-10 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-300">
                  <ArrowRightLeft className="size-5" />
                </div>
                <div>
                  <p className="font-semibold">
                    Move {item.transferUnits} units of {item.bloodGroup}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {item.donorHospital} to {item.receiverHospital}
                  </p>
                </div>
              </div>
              <Badge variant={item.priority === 'Immediate' ? 'critical' : 'safe'}>{item.priority}</Badge>
            </div>
            <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
              <span>ETA {item.eta}</span>
              <span>Recommended Action</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
