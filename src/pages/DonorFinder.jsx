import { useEffect, useState } from 'react'
import { HeartHandshake } from 'lucide-react'
import { Badge } from '../components/ui/badge'
import { Card, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { fetchDonors } from '../services/api'

export function DonorFinderPage({ fallbackDonors = [] }) {
  const [donors, setDonors] = useState(Array.isArray(fallbackDonors) ? fallbackDonors : [])

  useEffect(() => {
    let active = true

    const load = async () => {
      try {
        const nextDonors = await fetchDonors('all')
        if (active) setDonors(Array.isArray(nextDonors) ? nextDonors : [])
      } catch {
        if (active) setDonors(Array.isArray(fallbackDonors) ? fallbackDonors : [])
      }
    }

    load()

    return () => {
      active = false
    }
  }, [fallbackDonors])

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-rose-500 to-red-500 text-white">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.18em] text-rose-100">Donor network</p>
            <h2 className="mt-3 text-3xl font-semibold">Find matching donors quickly</h2>
            <p className="mt-3 max-w-2xl text-sm text-rose-50/90">
              A clean donor finder for consumer use, ready to expand into live donor workflows after the demo.
            </p>
          </div>
          <HeartHandshake className="size-10" />
        </div>
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        {donors.map((donor) => (
          <Card key={donor.id}>
            <CardHeader>
              <div>
                <CardDescription>{donor.city}</CardDescription>
                <CardTitle className="mt-2">{donor.name}</CardTitle>
              </div>
              <Badge variant="safe">{donor.bloodGroup}</Badge>
            </CardHeader>
            <div className="grid gap-3 text-sm text-muted-foreground md:grid-cols-2">
              <p>Availability: {donor.availability}</p>
              <p>Last donation: {donor.lastDonation}</p>
            </div>
          </Card>
        ))}
      </div>

      {donors.length === 0 ? (
        <Card>
          <p className="text-sm text-muted-foreground">
            Donor data is not available right now. Start the Express API with `npm run dev` and refresh.
          </p>
        </Card>
      ) : null}
    </div>
  )
}
