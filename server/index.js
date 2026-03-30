import cors from 'cors'
import express from 'express'
import { hospitals } from './data/mockData.js'
import {
  buildDashboardPayload,
  buildDonorMatches,
  buildEmergencyMatches,
  buildHospitalStatus,
} from './utils/analytics.js'

const app = express()
const port = process.env.PORT || 4000

app.use(cors())
app.use(express.json())

app.get('/api/health', (_request, response) => {
  response.json({ ok: true, service: 'LifeFlow API' })
})

app.get('/api/dashboard', (_request, response) => {
  response.json(buildDashboardPayload())
})

app.get('/api/hospitals', (request, response) => {
  const { search = '', status = 'all' } = request.query
  const normalizedSearch = String(search).toLowerCase()

  const filtered = hospitals
    .map(buildHospitalStatus)
    .filter((hospital) => {
      const matchesSearch =
        hospital.name.toLowerCase().includes(normalizedSearch) ||
        hospital.city.toLowerCase().includes(normalizedSearch)

      const matchesStatus = status === 'all' ? true : hospital.status === status
      return matchesSearch && matchesStatus
    })

  response.json(filtered)
})

app.get('/api/emergency', (request, response) => {
  const bloodGroup = String(request.query.group || 'O-')
  response.json(buildEmergencyMatches(bloodGroup))
})

app.get('/api/donors', (request, response) => {
  const bloodGroup = String(request.query.group || 'all')
  response.json(buildDonorMatches(bloodGroup))
})

app.patch('/api/hospitals/:id/inventory', (request, response) => {
  const hospital = hospitals.find((entry) => entry.id === request.params.id)

  if (!hospital) {
    response.status(404).json({ message: 'Hospital not found' })
    return
  }

  const updates = Array.isArray(request.body?.inventory) ? request.body.inventory : []

  hospital.inventory = hospital.inventory.map((item) => {
    const update = updates.find((entry) => entry.group === item.group)
    return update ? { ...item, ...update } : item
  })
  hospital.lastUpdated = new Date().toISOString()

  response.json(buildHospitalStatus(hospital))
})

app.listen(port, () => {
  console.log(`LifeFlow API listening on port ${port}`)
})
