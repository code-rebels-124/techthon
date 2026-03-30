import { motion } from 'framer-motion'
import { CountUp } from '../count-up'
import { StatusDot } from '../status-dot'
import { Badge } from '../ui/badge'
import { Card, CardDescription, CardHeader, CardTitle } from '../ui/card'

const MotionDiv = motion.div

export function InventoryGrid({ items }) {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {items.map((item, index) => (
        <MotionDiv
          key={item.group}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
        >
          <Card className="h-full">
            <CardHeader className="mb-3">
              <div>
                <CardDescription>Blood group</CardDescription>
                <CardTitle className="mt-2 text-3xl">{item.group}</CardTitle>
              </div>
              <Badge variant={item.status}>{item.status}</Badge>
            </CardHeader>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Available units</p>
                <p className="mt-2 text-3xl font-semibold">
                  <CountUp value={item.units} />
                </p>
              </div>
              <div className="rounded-2xl bg-white/70 px-3 py-2 dark:bg-white/5">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <StatusDot status={item.status} />
                  Threshold {item.threshold}
                </div>
              </div>
            </div>
          </Card>
        </MotionDiv>
      ))}
    </section>
  )
}
