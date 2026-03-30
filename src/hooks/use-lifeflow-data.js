import { useEffect, useState } from 'react'
import { fallbackDashboard } from '../data/fallbackData'
import { fetchDashboardData } from '../services/api'

const mergeDashboardData = (nextData) => ({
  ...fallbackDashboard,
  ...nextData,
  totals: {
    ...fallbackDashboard.totals,
    ...(nextData?.totals || {}),
  },
  inventorySummary: nextData?.inventorySummary || fallbackDashboard.inventorySummary,
  demandHistory: nextData?.demandHistory || fallbackDashboard.demandHistory,
  alerts: nextData?.alerts || fallbackDashboard.alerts,
  predictions: nextData?.predictions || fallbackDashboard.predictions,
  redistributionSuggestions:
    nextData?.redistributionSuggestions || fallbackDashboard.redistributionSuggestions,
  emergencyMatches: nextData?.emergencyMatches || fallbackDashboard.emergencyMatches,
  notifications: nextData?.notifications || fallbackDashboard.notifications,
  hospitalSummaries: nextData?.hospitalSummaries || fallbackDashboard.hospitalSummaries,
  donors: nextData?.donors || fallbackDashboard.donors,
})

export function useLifeFlowData() {
  const [data, setData] = useState(fallbackDashboard)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true

    const load = async () => {
      setLoading(true)
      try {
        const nextData = await fetchDashboardData()
        if (active) {
          setData(mergeDashboardData(nextData))
          setError('')
        }
      } catch {
        if (active) {
          setError('Showing mock data while the API is unavailable.')
        }
      } finally {
        if (active) {
          window.setTimeout(() => setLoading(false), 700)
        }
      }
    }

    load()

    return () => {
      active = false
    }
  }, [])

  return { data, loading, error }
}
