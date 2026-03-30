const LOCAL_API = 'http://localhost:4000'

const buildCandidates = (path) => {
  const configuredBase = import.meta.env.VITE_API_URL
  const candidates = []

  if (configuredBase) candidates.push(`${configuredBase}${path}`)
  if (import.meta.env.DEV) candidates.push(path)
  candidates.push(`${LOCAL_API}${path}`)

  return [...new Set(candidates)]
}

async function request(path, options) {
  const candidates = buildCandidates(path)
  let lastError = null

  for (const url of candidates) {
    try {
      const response = await fetch(url, options)
      if (!response.ok) {
        lastError = new Error(`API request failed for ${url} with status ${response.status}`)
        continue
      }

      return await response.json()
    } catch (error) {
      lastError = error
    }
  }

  throw lastError || new Error(`API request failed for ${path}`)
}

export async function fetchDashboardData() {
  return request('/api/dashboard')
}

export async function fetchHospitals(search = '', status = 'all') {
  const query = new URLSearchParams({ search, status })
  return request(`/api/hospitals?${query.toString()}`)
}

export async function fetchEmergencyMatches(group) {
  return request(`/api/emergency?group=${encodeURIComponent(group)}`)
}

export async function fetchDonors(group = 'all') {
  return request(`/api/donors?group=${encodeURIComponent(group)}`)
}

export async function updateHospitalInventory(hospitalId, inventory) {
  return request(`/api/hospitals/${hospitalId}/inventory`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ inventory }),
  })
}
