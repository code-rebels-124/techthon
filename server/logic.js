import { randomUUID } from "crypto";
import { bloodGroups } from "./store.js";

const stockThresholds = {
  "A+": 18,
  "A-": 8,
  "B+": 18,
  "B-": 8,
  "AB+": 10,
  "AB-": 4,
  "O+": 24,
  "O-": 10,
};

function haversineDistance(a, b) {
  if (!a?.lat || !a?.lng || !b?.lat || !b?.lng) {
    return null;
  }

  const toRadians = (value) => (value * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const deltaLat = toRadians(b.lat - a.lat);
  const deltaLng = toRadians(b.lng - a.lng);
  const arc =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(toRadians(a.lat)) * Math.cos(toRadians(b.lat)) * Math.sin(deltaLng / 2) ** 2;

  return Number((earthRadiusKm * 2 * Math.atan2(Math.sqrt(arc), Math.sqrt(1 - arc))).toFixed(1));
}

function getBloodStatus(units, threshold) {
  if (units <= Math.max(3, Math.floor(threshold * 0.45))) {
    return "critical";
  }

  if (units <= threshold) {
    return "low";
  }

  return "safe";
}

function getHospitalStatus(items) {
  const criticalCount = items.filter((item) => item.status === "critical").length;
  const lowCount = items.filter((item) => item.status === "low").length;

  if (criticalCount >= 2) {
    return "critical";
  }

  if (criticalCount >= 1 || lowCount >= 3) {
    return "low";
  }

  return "safe";
}

export function getHospitalInventory(store, hospitalId) {
  return bloodGroups.map((bloodGroup) => {
    const record = store.inventories.find((item) => item.hospitalId === hospitalId && item.bloodGroup === bloodGroup);
    const units = record?.units ?? 0;
    const threshold = stockThresholds[bloodGroup];

    return {
      id: record?.id ?? randomUUID(),
      hospitalId,
      bloodGroup,
      units,
      threshold,
      status: getBloodStatus(units, threshold),
      updatedAt: record?.updatedAt ?? null,
    };
  });
}

export function getHospitalPublicView(store, hospital) {
  const inventory = getHospitalInventory(store, hospital.id);
  const totalUnits = inventory.reduce((sum, item) => sum + item.units, 0);

  return {
    id: hospital.id,
    name: hospital.name,
    email: hospital.email,
    type: hospital.type,
    city: hospital.city,
    address: hospital.address,
    coordinates: hospital.coordinates,
    createdAt: hospital.createdAt,
    totalUnits,
    status: getHospitalStatus(inventory),
    inventory,
    lowStockCount: inventory.filter((item) => item.status !== "safe").length,
  };
}

export function getPublicHospitals(store) {
  return store.hospitals
    .map((hospital) => getHospitalPublicView(store, hospital))
    .sort((a, b) => {
      if (a.status !== b.status) {
        const weight = { critical: 0, low: 1, safe: 2 };
        return weight[a.status] - weight[b.status];
      }

      return a.name.localeCompare(b.name);
    });
}

export function getRecentDonorActivity(store, hospitalId) {
  return store.activities
    .filter((activity) => activity.hospitalId === hospitalId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 6);
}

export function getDonationTrends(store, hospitalId) {
  const donorPool = store.donors.filter((donor) => donor.hospitalId === hospitalId);
  const labels = [];
  const now = new Date();

  for (let offset = 5; offset >= 0; offset -= 1) {
    const pointDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - offset * 5);
    labels.push({
      key: pointDate.toISOString(),
      label: pointDate.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    });
  }

  return labels.map(({ key, label }) => {
    const pointDate = new Date(key);
    const count = donorPool.filter((donor) => {
      if (!donor.lastDonationDate) {
        return false;
      }

      const donorDate = new Date(donor.lastDonationDate);
      return donorDate <= pointDate;
    }).length;

    return { label, donations: count };
  });
}

export function getEmergencyDemandTrends(store, hospitalId) {
  const requests = store.emergencyRequests.filter(
    (request) => hospitalId === null || request.acceptedByHospitalId === hospitalId || request.status === "active",
  );
  const labels = [];
  const now = new Date();

  for (let offset = 6; offset >= 0; offset -= 1) {
    const pointDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - offset);
    labels.push(pointDate.toISOString().slice(0, 10));
  }

  return labels.map((dayKey) => ({
    day: dayKey.slice(5),
    requests: requests.filter((request) => request.createdAt.slice(0, 10) === dayKey).length,
  }));
}

export function getEmergencyMatches(store, bloodGroup, location, unitsNeeded = 1) {
  const normalizedLocation = location?.trim().toLowerCase() ?? "";
  const locationHospital = store.hospitals.find((hospital) => {
    return (
      hospital.city.toLowerCase().includes(normalizedLocation) ||
      hospital.address.toLowerCase().includes(normalizedLocation)
    );
  });

  return getPublicHospitals(store)
    .map((hospital) => {
      const stock = hospital.inventory.find((item) => item.bloodGroup === bloodGroup);
      const distance = haversineDistance(locationHospital?.coordinates, hospital.coordinates);

      return {
        id: hospital.id,
        name: hospital.name,
        city: hospital.city,
        address: hospital.address,
        status: hospital.status,
        availableUnits: stock?.units ?? 0,
        canFulfill: (stock?.units ?? 0) >= unitsNeeded,
        distance,
      };
    })
    .filter((hospital) => hospital.availableUnits > 0)
    .sort((a, b) => {
      if (Number(b.canFulfill) !== Number(a.canFulfill)) {
        return Number(b.canFulfill) - Number(a.canFulfill);
      }

      if (b.availableUnits !== a.availableUnits) {
        return b.availableUnits - a.availableUnits;
      }

      return (a.distance ?? 999) - (b.distance ?? 999);
    });
}

export function getHospitalEmergencyFeed(store, hospitalId) {
  return store.emergencyRequests
    .map((request) => {
      const matches = getEmergencyMatches(store, request.bloodGroup, request.location, request.unitsNeeded);
      const hospitalMatch = matches.find((item) => item.id === hospitalId);

      return {
        ...request,
        matches,
        hospitalMatch,
        isRelevant: request.status === "active" && Boolean(hospitalMatch),
      };
    })
    .filter((request) => request.isRelevant || request.acceptedByHospitalId === hospitalId)
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
}

export function getRequesterEmergencyFeed(store, userId) {
  return store.emergencyRequests
    .filter((request) => request.requesterUserId === userId)
    .map((request) => ({
      ...request,
      matches: getEmergencyMatches(store, request.bloodGroup, request.location, request.unitsNeeded),
      acceptedHospital:
        store.hospitals.find((hospital) => hospital.id === request.acceptedByHospitalId)?.name ?? null,
    }))
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
}

export function getHospitalDashboard(store, hospitalId) {
  const hospital = store.hospitals.find((item) => item.id === hospitalId);
  const inventory = getHospitalInventory(store, hospitalId);
  const lowStock = inventory.filter((item) => item.status !== "safe");
  const emergencyFeed = getHospitalEmergencyFeed(store, hospitalId);
  const acceptedRequests = emergencyFeed.filter((item) => item.acceptedByHospitalId === hospitalId);
  const recentActivity = getRecentDonorActivity(store, hospitalId);
  const inventoryTotal = inventory.reduce((sum, item) => sum + item.units, 0);

  return {
    hospital: hospital ? getHospitalPublicView(store, hospital) : null,
    summary: {
      totalUnits: inventoryTotal,
      lowStockAlerts: lowStock.length,
      donorCount: store.donors.filter((donor) => donor.hospitalId === hospitalId).length,
      activeEmergencyRequests: emergencyFeed.filter((item) => item.status === "active").length,
      acceptedEmergencyRequests: acceptedRequests.length,
    },
    inventory,
    lowStock,
    recentActivity,
    emergencyFeed,
    emergencyResourcesActive: emergencyFeed
      .filter((item) => item.status === "active")
      .slice(0, 3)
      .map((item) => ({
        id: item.id,
        title: `${item.bloodGroup} needed in ${item.location}`,
        unitsNeeded: item.unitsNeeded,
        notes: item.notes,
      })),
    charts: {
      availability: inventory.map((item) => ({ bloodGroup: item.bloodGroup, units: item.units, threshold: item.threshold })),
      donationTrends: getDonationTrends(store, hospitalId),
      emergencyDemand: getEmergencyDemandTrends(store, hospitalId),
    },
  };
}

export function getRequesterDashboard(store, userId) {
  const hospitals = getPublicHospitals(store);
  const activeRequests = getRequesterEmergencyFeed(store, userId);

  return {
    summary: {
      hospitalsOnline: hospitals.length,
      criticalHospitals: hospitals.filter((hospital) => hospital.status === "critical").length,
      activeRequests: activeRequests.filter((item) => item.status === "active").length,
    },
    hospitals: hospitals.slice(0, 6),
    activeRequests,
    charts: {
      bloodAvailability: bloodGroups.map((bloodGroup) => ({
        bloodGroup,
        units: hospitals.reduce(
          (sum, hospital) => sum + (hospital.inventory.find((item) => item.bloodGroup === bloodGroup)?.units ?? 0),
          0,
        ),
      })),
      emergencyDemand: getEmergencyDemandTrends(store, null),
    },
  };
}

export function searchHospitalDonors(store, hospitalId, query = "") {
  const normalizedQuery = query.trim().toLowerCase();
  const donors = store.donors.filter((donor) => donor.hospitalId === hospitalId);

  if (!normalizedQuery) {
    return donors.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  }

  return donors
    .filter((donor) => {
      return (
        donor.name.toLowerCase().includes(normalizedQuery) ||
        donor.bloodGroup.toLowerCase().includes(normalizedQuery) ||
        donor.location.toLowerCase().includes(normalizedQuery)
      );
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}
