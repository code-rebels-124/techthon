import { Search, SlidersHorizontal } from 'lucide-react'
import { startTransition, useDeferredValue, useEffect, useMemo, useState } from 'react'
import { Badge } from '../components/ui/badge'
import { Card, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Input } from '../components/ui/input'
import { fetchHospitals } from '../services/api'

const filters = ['all', 'safe', 'low', 'critical']

export function HospitalsPage({ fallbackHospitals }) {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('all')
  const safeFallbackHospitals = useMemo(
    () => (Array.isArray(fallbackHospitals) ? fallbackHospitals : []),
    [fallbackHospitals],
  )
  const [hospitals, setHospitals] = useState(safeFallbackHospitals)
  const deferredQuery = useDeferredValue(query)

  useEffect(() => {
    let active = true

    const loadHospitals = async () => {
      try {
        const result = await fetchHospitals(deferredQuery, status)
        if (active) setHospitals(Array.isArray(result) ? result : safeFallbackHospitals)
      } catch {
        if (active) {
          const localResults = safeFallbackHospitals.filter((hospital) => {
            const matchesSearch =
              hospital.name.toLowerCase().includes(deferredQuery.toLowerCase()) ||
              hospital.city.toLowerCase().includes(deferredQuery.toLowerCase())
            const matchesStatus = status === 'all' ? true : hospital.status === status
            return matchesSearch && matchesStatus
          })

          setHospitals(localResults)
        }
      }
    }

    loadHospitals()

    return () => {
      active = false
    }
  }, [deferredQuery, safeFallbackHospitals, status])

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Network visibility</p>
            <h2 className="mt-3 text-3xl font-semibold">Hospitals and blood banks</h2>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              Search across partner hospitals, watch reserve health in real time, and identify where
              support is needed before shortages cascade.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-3.5 size-4 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => {
                  const nextQuery = event.target.value
                  startTransition(() => setQuery(nextQuery))
                }}
                placeholder="Search hospitals or cities"
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2 rounded-full border border-white/70 bg-white/70 px-4 dark:border-white/10 dark:bg-white/5">
              <SlidersHorizontal className="size-4 text-muted-foreground" />
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value)}
                className="bg-transparent py-3 text-sm outline-none"
              >
                {filters.map((filter) => (
                  <option key={filter} value={filter}>
                    {filter}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        {hospitals.map((hospital) => (
          <Card key={hospital.id}>
            <CardHeader>
              <div>
                <CardDescription>
                  {hospital.city} · {hospital.type}
                </CardDescription>
                <CardTitle className="mt-2">{hospital.name}</CardTitle>
              </div>
              <Badge variant={hospital.status}>{hospital.status}</Badge>
            </CardHeader>
            <div className="grid gap-4 md:grid-cols-[1fr_auto]">
              <div className="grid grid-cols-2 gap-3">
                {hospital.inventory.map((item) => (
                  <div
                    key={`${hospital.id}-${item.group}`}
                    className="rounded-[20px] border border-white/70 bg-white/65 p-3 dark:border-white/10 dark:bg-white/5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">{item.group}</span>
                      <Badge variant={item.units <= item.threshold ? 'critical' : item.units <= item.threshold * 1.35 ? 'low' : 'safe'}>
                        {item.units}u
                      </Badge>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">Expires in {item.expiryDays} days</p>
                  </div>
                ))}
              </div>

              <div className="rounded-[24px] bg-gradient-to-b from-rose-500 to-red-500 p-5 text-white">
                <p className="text-sm text-rose-100">Total reserve</p>
                <p className="mt-3 text-4xl font-semibold">{hospital.totalUnits}</p>
                <div className="mt-5 space-y-2 text-sm text-rose-50/90">
                  <p>{hospital.distanceKm} km away</p>
                  <p>{hospital.nearExpiryCount} groups near expiry</p>
                  <p>Updated {new Date(hospital.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {hospitals.length === 0 ? (
        <Card>
          <p className="text-sm text-muted-foreground">
            Hospital data is unavailable right now. Start the LifeFlow API and refresh the page.
          </p>
        </Card>
      ) : null}
    </div>
  )
}
