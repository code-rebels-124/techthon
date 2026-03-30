import { bloodGroups, demandHistory, donors, hospitals, notifications } from '../data/mockData.js'

const getStatus = (units, threshold) => {
  if (units <= threshold) return 'critical'
  if (units <= threshold * 1.35) return 'low'
  return 'safe'
}

const buildInventorySummary = () =>
  bloodGroups.map((group) => {
    const totalUnits = hospitals.reduce((sum, hospital) => {
      const match = hospital.inventory.find((item) => item.group === group)
      return sum + (match?.units ?? 0)
    }, 0)

    const threshold = hospitals.reduce((sum, hospital) => {
      const match = hospital.inventory.find((item) => item.group === group)
      return sum + (match?.threshold ?? 0)
    }, 0)

    return {
      group,
      units: totalUnits,
      threshold,
      status: getStatus(totalUnits, threshold),
    }
  })

const buildHospitalStatus = (hospital) => {
  const criticalUnits = hospital.inventory.filter((item) => item.units <= item.threshold).length
  const lowUnits = hospital.inventory.filter(
    (item) => item.units > item.threshold && item.units <= item.threshold * 1.35,
  ).length

  let status = 'safe'
  if (criticalUnits >= 2) status = 'critical'
  else if (criticalUnits === 1 || lowUnits >= 2) status = 'low'

  return {
    ...hospital,
    totalUnits: hospital.inventory.reduce((sum, item) => sum + item.units, 0),
    nearExpiryCount: hospital.inventory.filter((item) => item.expiryDays <= 4).length,
    status,
  }
}

const buildAlerts = () => {
  const alerts = []

  hospitals.forEach((hospital) => {
    hospital.inventory.forEach((item) => {
      if (item.units <= item.threshold) {
        alerts.push({
          id: `${hospital.id}-${item.group}-critical`,
          hospital: hospital.name,
          group: item.group,
          severity: 'critical',
          message: `${item.group} is below safe threshold at ${hospital.name}.`,
        })
      }

      if (item.expiryDays <= 4) {
        alerts.push({
          id: `${hospital.id}-${item.group}-expiry`,
          hospital: hospital.name,
          group: item.group,
          severity: item.expiryDays <= 2 ? 'critical' : 'warning',
          message: `${item.group} stock at ${hospital.name} expires in ${item.expiryDays} days.`,
        })
      }
    })
  })

  return alerts.slice(0, 8)
}

const forecastNextDemand = () => {
  const recent = demandHistory.slice(-3)
  const average = recent.reduce(
    (accumulator, day) => {
      accumulator.APlus += day.APlus
      accumulator.BPlus += day.BPlus
      accumulator.OPlus += day.OPlus
      accumulator.ONeg += day.ONeg
      accumulator.emergency += day.emergency
      return accumulator
    },
    { APlus: 0, BPlus: 0, OPlus: 0, ONeg: 0, emergency: 0 },
  )

  const trendBoost = {
    APlus: recent.at(-1).APlus - recent[0].APlus,
    BPlus: recent.at(-1).BPlus - recent[0].BPlus,
    OPlus: recent.at(-1).OPlus - recent[0].OPlus,
    ONeg: recent.at(-1).ONeg - recent[0].ONeg,
    emergency: recent.at(-1).emergency - recent[0].emergency,
  }

  return {
    APlus: Math.round(average.APlus / 3 + trendBoost.APlus * 0.7),
    BPlus: Math.round(average.BPlus / 3 + trendBoost.BPlus * 0.7),
    OPlus: Math.round(average.OPlus / 3 + trendBoost.OPlus * 0.7),
    ONeg: Math.round(average.ONeg / 3 + trendBoost.ONeg * 0.7),
    emergency: Math.round(average.emergency / 3 + trendBoost.emergency * 0.5),
  }
}

const buildPredictions = () => {
  const forecast = forecastNextDemand()

  return [
    {
      id: 'prediction-1',
      title: 'O- demand will increase tomorrow',
      confidence: 92,
      impact: 'High',
      summary: `Projected O- requests may reach ${forecast.ONeg} units, driven by emergency case patterns.`,
    },
    {
      id: 'prediction-2',
      title: 'Weekend trauma demand is sustaining',
      confidence: 88,
      impact: 'Medium',
      summary: `Emergency utilization is trending toward ${forecast.emergency} urgent requests in the next cycle.`,
    },
    {
      id: 'prediction-3',
      title: 'O+ remains the largest load on supply',
      confidence: 90,
      impact: 'High',
      summary: `O+ demand is expected to remain near ${forecast.OPlus} units tomorrow, maintaining system pressure.`,
    },
  ]
}

const buildRedistributionSuggestions = () => {
  const suggestions = []

  hospitals.forEach((receiver) => {
    receiver.inventory.forEach((needed) => {
      if (needed.units > needed.threshold) return

      const donor = hospitals.find((candidate) => {
        if (candidate.id === receiver.id) return false
        const donorStock = candidate.inventory.find((item) => item.group === needed.group)
        return donorStock && donorStock.units >= donorStock.threshold * 1.8
      })

      if (!donor) return

      const donorStock = donor.inventory.find((item) => item.group === needed.group)
      const transferUnits = Math.min(
        Math.max(needed.threshold - needed.units + 2, 2),
        Math.max(donorStock.units - donorStock.threshold - 4, 2),
      )

      suggestions.push({
        id: `${donor.id}-${receiver.id}-${needed.group}`,
        bloodGroup: needed.group,
        donorHospital: donor.name,
        receiverHospital: receiver.name,
        transferUnits,
        priority: needed.group === 'O-' ? 'Immediate' : 'Recommended',
        eta: `${Math.round(Math.abs(donor.distanceKm - receiver.distanceKm) + 18)} min`,
      })
    })
  })

  return suggestions.slice(0, 5)
}

const buildEmergencyMatches = (bloodGroup) =>
  hospitals
    .map((hospital) => {
      const stock = hospital.inventory.find((item) => item.group === bloodGroup)
      return {
        id: `${hospital.id}-${bloodGroup}`,
        name: hospital.name,
        city: hospital.city,
        distanceKm: hospital.distanceKm,
        units: stock?.units ?? 0,
        status: getStatus(stock?.units ?? 0, stock?.threshold ?? 0),
        eta: `${Math.round(hospital.distanceKm * 4 + 7)} min`,
        contact: hospital.contact,
      }
    })
    .filter((hospital) => hospital.units > 0)
    .sort((a, b) => a.distanceKm - b.distanceKm)

const buildDashboardPayload = () => ({
  generatedAt: new Date('2026-03-30T09:15:00.000Z').toISOString(),
  inventorySummary: buildInventorySummary(),
  hospitalSummaries: hospitals.map(buildHospitalStatus),
  demandHistory,
  alerts: buildAlerts(),
  predictions: buildPredictions(),
  redistributionSuggestions: buildRedistributionSuggestions(),
  notifications,
  emergencyMatches: buildEmergencyMatches('O-'),
  donors: buildDonorMatches('all').slice(0, 3),
  totals: {
    totalUnits: hospitals.reduce(
      (sum, hospital) => sum + hospital.inventory.reduce((inner, item) => inner + item.units, 0),
      0,
    ),
    activeHospitals: hospitals.length,
    criticalAlerts: buildAlerts().filter((alert) => alert.severity === 'critical').length,
    predictedDemandTomorrow: Object.values(forecastNextDemand()).reduce((sum, value) => sum + value, 0),
  },
})

export { buildDashboardPayload, buildEmergencyMatches, buildHospitalStatus }
export const buildDonorMatches = (bloodGroup = 'O-') =>
  donors.filter((donor) => donor.bloodGroup === bloodGroup || bloodGroup === 'all')
