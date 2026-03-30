import { useMemo, useState } from 'react'
import { Save } from 'lucide-react'
import { DashboardPage } from './dashboard-page'
import { Card, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import { updateHospitalInventory } from '../services/api'

export function HospitalDashboardPage({ data, loading }) {
  const hospitals = data.hospitalSummaries
  const [selectedHospitalId, setSelectedHospitalId] = useState(hospitals[0]?.id || '')
  const [selectedGroup, setSelectedGroup] = useState('O-')
  const [units, setUnits] = useState('')
  const [statusMessage, setStatusMessage] = useState('')
  const effectiveHospitalId = selectedHospitalId || hospitals[0]?.id || ''

  const selectedHospital = useMemo(
    () => hospitals.find((hospital) => hospital.id === effectiveHospitalId) || hospitals[0],
    [effectiveHospitalId, hospitals],
  )

  const handleUpdate = async (event) => {
    event.preventDefault()

    if (!selectedHospital) return

    const current = selectedHospital.inventory.find((item) => item.group === selectedGroup)
    const nextUnits = Number(units || current?.units || 0)

    try {
      await updateHospitalInventory(selectedHospital.id, [{ group: selectedGroup, units: nextUnits }])
      setStatusMessage(`${selectedGroup} inventory updated to ${nextUnits} units for ${selectedHospital.name}.`)
      setUnits('')
    } catch {
      setStatusMessage('Inventory editor is ready, but the API update could not be completed right now.')
    }
  }

  return (
    <div className="space-y-6">
      <DashboardPage data={data} loading={loading} />

      <Card>
        <CardHeader>
          <div>
            <CardDescription>Hospital controls</CardDescription>
            <CardTitle className="mt-2">Update blood inventory</CardTitle>
          </div>
        </CardHeader>

        <form className="grid gap-4 lg:grid-cols-[1.2fr_0.9fr_0.9fr_auto]" onSubmit={handleUpdate}>
          <select
            value={effectiveHospitalId}
            onChange={(event) => setSelectedHospitalId(event.target.value)}
            className="h-11 rounded-full border border-white/70 bg-white/70 px-4 text-sm outline-none dark:border-white/10 dark:bg-white/5"
          >
            {hospitals.map((hospital) => (
              <option key={hospital.id} value={hospital.id}>
                {hospital.name}
              </option>
            ))}
          </select>

          <select
            value={selectedGroup}
            onChange={(event) => setSelectedGroup(event.target.value)}
            className="h-11 rounded-full border border-white/70 bg-white/70 px-4 text-sm outline-none dark:border-white/10 dark:bg-white/5"
          >
            {selectedHospital?.inventory.map((item) => (
              <option key={item.group} value={item.group}>
                {item.group}
              </option>
            ))}
          </select>

          <Input
            type="number"
            min="0"
            value={units}
            onChange={(event) => setUnits(event.target.value)}
            placeholder={`Current ${selectedHospital?.inventory.find((item) => item.group === selectedGroup)?.units || 0}`}
          />

          <Button type="submit">
            <Save className="size-4" />
            Save
          </Button>
        </form>

        {statusMessage ? <p className="mt-4 text-sm text-muted-foreground">{statusMessage}</p> : null}
      </Card>
    </div>
  )
}
