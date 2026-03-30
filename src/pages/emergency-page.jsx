import { MapPinned, PhoneCall, Siren } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { fetchEmergencyMatches } from '../services/api'

const bloodGroups = ['O-', 'O+', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-']

export function EmergencyPage({ fallbackMatches }) {
  const [bloodGroup, setBloodGroup] = useState('O-')
  const [matches, setMatches] = useState(fallbackMatches)
  const [requested, setRequested] = useState(false)

  useEffect(() => {
    let active = true

    const loadMatches = async () => {
      try {
        const result = await fetchEmergencyMatches(bloodGroup)
        if (active) setMatches(result)
      } catch {
        if (active) setMatches(fallbackMatches)
      }
    }

    loadMatches()

    return () => {
      active = false
    }
  }, [bloodGroup, fallbackMatches])

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden bg-gradient-to-br from-red-700 via-rose-700 to-red-950 p-0 text-white">
        <div className="grid gap-6 p-8 lg:grid-cols-[1.2fr_1fr] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em]">
              <Siren className="size-4" />
              Emergency Mode
            </div>
            <h2 className="mt-4 text-3xl font-semibold lg:text-5xl">Critical request orchestration in one tap</h2>
            <p className="mt-4 max-w-2xl text-base text-rose-50/85">
              Trigger high-priority routing, surface the nearest viable blood banks, and accelerate dispatch
              coordination when every minute counts.
            </p>
          </div>

          <div className="rounded-[28px] bg-white/10 p-6 backdrop-blur">
            <p className="text-sm text-rose-100">Select blood group</p>
            <div className="mt-4 grid grid-cols-4 gap-2">
              {bloodGroups.map((group) => (
                <button
                  key={group}
                  onClick={() => setBloodGroup(group)}
                  className={`rounded-2xl px-3 py-3 text-sm font-semibold transition ${
                    bloodGroup === group ? 'bg-white text-red-700' : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  {group}
                </button>
              ))}
            </div>
            <Button
              variant="danger"
              size="lg"
              className="mt-6 w-full animate-pulseSoft"
              onClick={() => setRequested(true)}
            >
              <Siren className="size-5" />
              Request Emergency Blood
            </Button>
            {requested ? (
              <p className="mt-4 rounded-2xl bg-white/10 px-4 py-3 text-sm text-rose-50">
                Emergency request sent for {bloodGroup}. Dispatch team notified and matching banks prioritized.
              </p>
            ) : null}
          </div>
        </div>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1fr_1.15fr]">
        <Card>
          <CardHeader>
            <div>
              <CardDescription>Location intelligence</CardDescription>
              <CardTitle className="mt-2">Nearest available blood banks</CardTitle>
            </div>
          </CardHeader>
          <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-rose-100 via-white to-rose-50 p-5 dark:from-white/5 dark:via-transparent dark:to-white/5">
            <div className="absolute inset-0 opacity-60 [background-image:radial-gradient(circle_at_20%_20%,rgba(244,63,94,0.16),transparent_35%),radial-gradient(circle_at_80%_30%,rgba(249,115,22,0.12),transparent_30%),linear-gradient(rgba(255,255,255,0.3)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.3)_1px,transparent_1px)] [background-size:auto,auto,42px_42px,42px_42px]" />
            <div className="relative space-y-4">
              {matches.slice(0, 3).map((match, index) => (
                <div
                  key={match.id}
                  className={`flex items-center justify-between rounded-[22px] p-4 ${
                    index === 0 ? 'bg-white shadow-panel dark:bg-white/10' : 'bg-white/70 dark:bg-white/5'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <MapPinned className="size-4 text-rose-500" />
                      <p className="font-semibold">{match.name}</p>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {match.city} · {match.distanceKm} km away
                    </p>
                  </div>
                  <Badge variant={match.status}>{match.units} units</Badge>
                </div>
              ))}
            </div>
          </div>
        </Card>

        <div className="space-y-4">
          {matches.map((match) => (
            <Card key={match.id}>
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <CardTitle>{match.name}</CardTitle>
                    <Badge variant={match.status}>{match.status}</Badge>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {match.city} · {match.distanceKm} km · ETA {match.eta}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-white/70 px-4 py-3 text-right dark:bg-white/5">
                    <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Available</p>
                    <p className="text-2xl font-semibold">{match.units} units</p>
                  </div>
                  <Button variant="secondary">
                    <PhoneCall className="size-4" />
                    {match.contact}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
