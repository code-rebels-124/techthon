import { ArrowRight, Droplets, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import { CountUp } from '../count-up'
import { Button } from '../ui/button'

const MotionSection = motion.section

export function HeroBanner({ totals }) {
  return (
    <MotionSection
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-[34px] border border-white/70 bg-hero-grid p-7 shadow-glow dark:border-white/10 dark:bg-dark-grid"
    >
      <div className="absolute -right-14 -top-20 size-52 rounded-full bg-rose-300/40 blur-3xl dark:bg-rose-500/20" />
      <div className="absolute -bottom-10 left-1/3 size-40 rounded-full bg-orange-200/70 blur-3xl dark:bg-red-500/10" />

      <div className="relative grid gap-8 xl:grid-cols-[1.6fr_1fr] xl:items-end">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-white/75 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-rose-700 shadow-sm dark:bg-white/10 dark:text-rose-200">
            <Sparkles className="size-4" />
            Production-ready control room
          </div>
          <h2 className="mt-5 max-w-3xl text-3xl font-semibold leading-tight text-slate-900 dark:text-white xl:text-5xl">
            Predict demand early, protect reserves, and move blood where it matters most.
          </h2>
          <p className="mt-4 max-w-2xl text-base text-slate-600 dark:text-slate-300 xl:text-lg">
            LifeFlow turns fragmented blood bank data into a real-time command center for hospitals,
            alerts, and emergency redistribution.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button>
              Open Command Dashboard
              <ArrowRight className="size-4" />
            </Button>
            <Button variant="secondary">
              <Droplets className="size-4" />
              Emergency reserve active
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-[28px] bg-white/75 p-5 backdrop-blur dark:bg-white/10">
            <p className="text-sm text-muted-foreground">Total Units</p>
            <p className="mt-3 text-3xl font-semibold">
              <CountUp value={totals.totalUnits} />
            </p>
          </div>
          <div className="rounded-[28px] bg-white/75 p-5 backdrop-blur dark:bg-white/10">
            <p className="text-sm text-muted-foreground">Tomorrow Demand</p>
            <p className="mt-3 text-3xl font-semibold">
              <CountUp value={totals.predictedDemandTomorrow} />
            </p>
          </div>
          <div className="rounded-[28px] bg-white/75 p-5 backdrop-blur dark:bg-white/10">
            <p className="text-sm text-muted-foreground">Active Hospitals</p>
            <p className="mt-3 text-3xl font-semibold">
              <CountUp value={totals.activeHospitals} />
            </p>
          </div>
          <div className="rounded-[28px] bg-white/75 p-5 backdrop-blur dark:bg-white/10">
            <p className="text-sm text-muted-foreground">Critical Alerts</p>
            <p className="mt-3 text-3xl font-semibold text-rose-600 dark:text-rose-300">
              <CountUp value={totals.criticalAlerts} />
            </p>
          </div>
        </div>
      </div>
    </MotionSection>
  )
}
