import { useCallback, useEffect, useState } from "react";
import { getAccessToken } from "./firebase";

const apiBaseUrl = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

function buildApiUrl(path) {
  if (!apiBaseUrl) {
    return path;
  }

  return `${apiBaseUrl}${path}`;
}

async function requestJson(path, options = {}) {
  const token = getAccessToken();
  const response = await fetch(buildApiUrl(path), {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    ...options,
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.message || `Request failed with status ${response.status}`);
  }

  return payload;
}

export function useCommandCenter() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async ({ silent = false } = {}) => {
    if (silent) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const payload = await requestJson("/api/command-center");
      setData(payload);
      setError(null);
    } catch (fetchError) {
      setError(fetchError);
    } finally {
      if (silent) {
        setIsRefreshing(false);
      } else {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      fetchData({ silent: true });
    }, 5000);

    return () => window.clearInterval(timer);
  }, [fetchData]);

  return { data, isLoading, isRefreshing, error, refetch: fetchData };
}

export function fetchHospitals() {
  return requestJson("/api/hospitals");
}

export function fetchNearbyHospitals({ lat, lng, limit = 8 }) {
  const params = new URLSearchParams({
    lat: String(lat),
    lng: String(lng),
    limit: String(limit),
  });
  return requestJson(`/api/hospitals/nearby?${params.toString()}`);
}

export function updateInventory(id, units) {
  return requestJson(`/api/inventory/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ units: Number(units) }),
  });
}

export function clearInventory(id) {
  return requestJson(`/api/inventory/${id}`, {
    method: "DELETE",
  });
}

export function fetchDonors(query = "") {
  const params = new URLSearchParams();

  if (query) {
    params.set("q", query);
  }

  return requestJson(`/api/donors${params.toString() ? `?${params.toString()}` : ""}`);
}

export function createDonor(payload) {
  return requestJson("/api/donors", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateDonor(id, payload) {
  return requestJson(`/api/donors/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function deleteDonor(id) {
  return requestJson(`/api/donors/${id}`, {
    method: "DELETE",
  });
}

export function createEmergencyRequest(payload) {
  return requestJson("/api/emergency-requests", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function respondToEmergencyRequest(id, action) {
  return requestJson(`/api/emergency-requests/${id}/respond`, {
    method: "POST",
    body: JSON.stringify({ action }),
  });
}
