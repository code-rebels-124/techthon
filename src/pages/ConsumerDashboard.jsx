import { useMemo, useState } from 'react'
import { ArrowRight, Search, Siren, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Skeleton } from '../components/ui/skeleton'

const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']

export function ConsumerDashboardPage({ data, loading = false }) {
  const [selectedGroup, setSelectedGroup] = useState('O-')

  const availability = useMemo(
    () =>
      (data?.hospitalSummaries || [])
        .map((hospital) => ({
          id: `${hospital.id}-${selectedGroup}`,
          name: hospital.name,
          city: hospital.city,
          stock: hospital.inventory.find((item) => item.group === selectedGroup),
        }))
        .filter((hospital) => hospital.stock)
        .sort((first, second) => second.stock.units - first.stock.units),
    [data?.hospitalSummaries, selectedGroup],
  )

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-[240px] rounded-[34px]" />
        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <Skeleton className="h-[340px]" />
          <Skeleton className="h-[340px]" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden bg-hero-grid dark:bg-dark-grid">
        <div className="grid gap-8 lg:grid-cols-[1.25fr_1fr] lg:items-end">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Consumer dashboard</p>
            <h2 className="mt-3 text-4xl font-semibold leading-tight">Search blood, trigger emergency support, and connect with donors fast.</h2>
            <p className="mt-4 max-w-2xl text-muted-foreground">
              This view is optimized for quick access during urgent situations, with blood availability,
              emergency mode, and donor finder shortcuts in one place.
            </p>
          </div>

          <div className="rounded-[28px] bg-white/75 p-6 shadow-panel backdrop-blur dark:bg-white/10">
            <p className="text-sm text-muted-foreground">Search availability by blood group</p>
            <div className="mt-4 grid grid-cols-4 gap-2">
              {bloodGroups.map((group) => (
                <button
                  key={group}
                  onClick={() => setSelectedGroup(group)}
                  className={`rounded-2xl px-3 py-3 text-sm font-semibold transition ${
                    selectedGroup === group
                      ? 'bg-gradient-to-r from-rose-500 to-red-500 text-white'
                      : 'bg-white/80 text-foreground dark:bg-white/10 dark:text-white'
                  }`}
                >
                  {group}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <Card>
          <CardHeader>
            <div>
              <CardDescription>Blood availability</CardDescription>
              <CardTitle className="mt-2">Best current matches for {selectedGroup}</CardTitle>
            </div>
          </CardHeader>
          <div className="space-y-3">
            {availability.slice(0, 5).map((hospital) => (
              <div
                key={hospital.id}
                className="flex items-center justify-between rounded-[24px] border border-white/70 bg-white/70 p-4 dark:border-white/10 dark:bg-white/5"
              >
                <div>
                  <p className="font-semibold">{hospital.name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{hospital.city}</p>
                </div>
                <Badge variant={hospital.stock.units <= hospital.stock.threshold ? 'critical' : hospital.stock.units <= hospital.stock.threshold * 1.35 ? 'low' : 'safe'}>
                  {hospital.stock.units} units
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        <div className="space-y-4">
          <Card className="bg-gradient-to-br from-rose-500 to-red-500 text-white">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.18em] text-rose-100">Emergency mode</p>
                <h3 className="mt-3 text-2xl font-semibold">Need blood right now?</h3>
                <p className="mt-3 text-sm text-rose-50/90">
                  Trigger emergency routing and discover the nearest available blood banks.
                </p>
              </div>
              <Siren className="size-8" />
            </div>
            <Button asChild variant="secondary" className="mt-5 bg-white text-rose-700 hover:bg-rose-50">
              <Link to="/emergency">
                Open emergency mode
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </Card>

          <Card>
            <CardHeader>
              <div>
                <CardDescription>Donor finder</CardDescription>
                <CardTitle className="mt-2">Nearby donors ready to help</CardTitle>
              </div>
            </CardHeader>
            <div className="space-y-3">
              {(data?.donors || []).map((donor) => (
                <div
                  key={donor.id}
                  className="rounded-[22px] border border-white/70 bg-white/70 p-4 dark:border-white/10 dark:bg-white/5"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold">{donor.name}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{donor.city}</p>
                    </div>
                    <Badge variant="safe">{donor.bloodGroup}</Badge>
                  </div>
                </div>
              ))}
            </div>
            <Button asChild variant="secondary" className="mt-5 w-full">
              <Link to="/donors">
                <Users className="size-4" />
                Open donor finder
              </Link>
            </Button>
          </Card>
        </div>
      </div>
    </div>
  )
}
