import { Types } from "mongoose";
import { Account, ActivityLog, Donor, EmergencyRequest, Inventory } from "./models.js";

export const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

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

function toId(id) {
  return typeof id === "string" ? new Types.ObjectId(id) : id;
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

function getHospitalStatus(inventory) {
  const criticalCount = inventory.filter((item) => item.status === "critical").length;
  const lowCount = inventory.filter((item) => item.status === "low").length;

  if (criticalCount >= 2) return "critical";
  if (criticalCount >= 1 || lowCount >= 3) return "low";
  return "safe";
}

export function haversineDistance(a, b) {
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

export function sanitizeAccount(account) {
  if (!account) return null;

  return {
    id: String(account._id),
    role: account.role,
    name: account.name,
    email: account.email,
    city: account.city,
    state: account.state,
    address: account.address,
    hospitalType: account.hospitalType,
    contactPhone: account.contactPhone,
    contactEmail: account.contactEmail,
    coordinates: account.coordinates,
    createdAt: account.createdAt,
  };
}

export async function ensureHospitalInventory(hospitalId) {
  const existing = await Inventory.find({ hospitalId: toId(hospitalId) }).lean();
  const existingGroups = new Set(existing.map((item) => item.bloodGroup));
  const missingGroups = bloodGroups.filter((group) => !existingGroups.has(group));

  if (!missingGroups.length) {
    return;
  }

  await Inventory.insertMany(
    missingGroups.map((bloodGroup) => ({
      hospitalId: toId(hospitalId),
      bloodGroup,
      units: 0,
      lastUpdatedAt: new Date(),
    })),
  );
}

export async function getHospitalInventory(hospitalId) {
  await ensureHospitalInventory(hospitalId);
  const inventory = await Inventory.find({ hospitalId: toId(hospitalId) }).sort({ bloodGroup: 1 }).lean();

  return bloodGroups.map((bloodGroup) => {
    const record = inventory.find((item) => item.bloodGroup === bloodGroup);
    const units = record?.units ?? 0;
    const threshold = stockThresholds[bloodGroup];

    return {
      id: String(record?._id),
      hospitalId: String(hospitalId),
      bloodGroup,
      units,
      threshold,
      status: getBloodStatus(units, threshold),
      updatedAt: record?.lastUpdatedAt ?? record?.updatedAt ?? null,
    };
  });
}

export async function getPublicHospitals() {
  const hospitals = await Account.find({ role: "hospital" }).sort({ name: 1 }).lean();
  const inventories = await Inventory.find({ hospitalId: { $in: hospitals.map((hospital) => hospital._id) } }).lean();

  return hospitals
    .map((hospital) => {
      const hospitalInventory = bloodGroups.map((bloodGroup) => {
        const record = inventories.find(
          (item) => String(item.hospitalId) === String(hospital._id) && item.bloodGroup === bloodGroup,
        );
        const units = record?.units ?? 0;
        return {
          id: String(record?._id),
          bloodGroup,
          units,
          threshold: stockThresholds[bloodGroup],
          status: getBloodStatus(units, stockThresholds[bloodGroup]),
        };
      });

      return {
        ...sanitizeAccount(hospital),
        latitude: hospital.coordinates?.lat ?? null,
        longitude: hospital.coordinates?.lng ?? null,
        totalUnits: hospitalInventory.reduce((sum, item) => sum + item.units, 0),
        bloodAvailabilitySummary: Object.fromEntries(
          hospitalInventory.map((item) => [item.bloodGroup, item.units]),
        ),
        inventory: hospitalInventory,
        status: getHospitalStatus(hospitalInventory),
      };
    })
    .sort((a, b) => {
      const weight = { critical: 0, low: 1, safe: 2 };
      if (weight[a.status] !== weight[b.status]) {
        return weight[a.status] - weight[b.status];
      }

      return a.name.localeCompare(b.name);
    });
}

export async function getNearbyHospitals(latitude, longitude, limit = 8) {
  const hospitals = await getPublicHospitals();
  const origin = { lat: Number(latitude), lng: Number(longitude) };

  return hospitals
    .map((hospital) => ({
      ...hospital,
      distanceKm: haversineDistance(origin, hospital.coordinates),
    }))
    .filter((hospital) => hospital.distanceKm !== null)
    .sort((a, b) => (a.distanceKm ?? 9999) - (b.distanceKm ?? 9999) || b.totalUnits - a.totalUnits)
    .slice(0, Number(limit) || 8);
}

export async function getEmergencyMatches(bloodGroup, location, unitsNeeded = 1, requesterCoordinates = null) {
  const hospitals = await getPublicHospitals();
  const normalizedLocation = location?.trim().toLowerCase() ?? "";
  const locationAnchor =
    requesterCoordinates ||
    hospitals.find(
      (hospital) =>
        hospital.city.toLowerCase().includes(normalizedLocation) || hospital.state.toLowerCase().includes(normalizedLocation),
    )?.coordinates;

  return hospitals
    .map((hospital) => {
      const stock = hospital.inventory.find((item) => item.bloodGroup === bloodGroup);
      return {
        id: hospital.id,
        name: hospital.name,
        city: hospital.city,
        state: hospital.state,
        address: hospital.address,
        contactPhone: hospital.contactPhone,
        status: hospital.status,
        availableUnits: stock?.units ?? 0,
        canFulfill: (stock?.units ?? 0) >= unitsNeeded,
        distance: haversineDistance(locationAnchor, hospital.coordinates),
      };
    })
    .filter((hospital) => hospital.availableUnits > 0)
    .sort((a, b) => {
      if (Number(b.canFulfill) !== Number(a.canFulfill)) return Number(b.canFulfill) - Number(a.canFulfill);
      if ((a.distance ?? 999) !== (b.distance ?? 999)) return (a.distance ?? 999) - (b.distance ?? 999);
      return b.availableUnits - a.availableUnits;
    });
}

export async function getRecentDonorActivity(hospitalId) {
  const activity = await ActivityLog.find({ hospitalId: toId(hospitalId) }).sort({ createdAt: -1 }).limit(6).lean();

  return activity.map((item) => ({
    id: String(item._id),
    kind: item.kind,
    title: item.title,
    description: item.description,
    createdAt: item.createdAt,
  }));
}

async function getDonationTrends(hospitalId) {
  const donors = await Donor.find({ hospitalId: toId(hospitalId) }).lean();
  const now = new Date();
  const timeline = [];

  for (let offset = 5; offset >= 0; offset -= 1) {
    const pointDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - offset * 5);
    timeline.push({
      label: pointDate.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      donations: donors.filter((donor) => donor.lastDonationDate <= pointDate).length,
    });
  }

  return timeline;
}

async function getEmergencyDemandTrends(hospitalId = null) {
  const filter = hospitalId
    ? { $or: [{ acceptedByHospitalId: toId(hospitalId) }, { status: "active" }] }
    : {};
  const requests = await EmergencyRequest.find(filter).lean();
  const now = new Date();
  const timeline = [];

  for (let offset = 6; offset >= 0; offset -= 1) {
    const pointDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - offset);
    const dayKey = pointDate.toISOString().slice(0, 10);
    timeline.push({
      day: dayKey.slice(5),
      requests: requests.filter((request) => request.createdAt.toISOString().slice(0, 10) === dayKey).length,
    });
  }

  return timeline;
}

export async function searchHospitalDonors(hospitalId, query = "") {
  const filter = { hospitalId: toId(hospitalId) };
  const normalizedQuery = query.trim();

  if (normalizedQuery) {
    filter.$or = [
      { name: { $regex: normalizedQuery, $options: "i" } },
      { bloodGroup: { $regex: normalizedQuery, $options: "i" } },
      { location: { $regex: normalizedQuery, $options: "i" } },
    ];
  }

  const donors = await Donor.find(filter).sort(normalizedQuery ? { name: 1 } : { updatedAt: -1 }).lean();

  return donors.map((donor) => ({
    id: String(donor._id),
    name: donor.name,
    bloodGroup: donor.bloodGroup,
    location: donor.location,
    phone: donor.phone,
    lastDonationDate: donor.lastDonationDate,
    availability: donor.availability,
    createdAt: donor.createdAt,
    updatedAt: donor.updatedAt,
  }));
}

export async function getHospitalEmergencyFeed(hospitalId) {
  const requests = await EmergencyRequest.find({
    $or: [{ status: "active" }, { acceptedByHospitalId: toId(hospitalId) }],
  })
    .sort({ updatedAt: -1 })
    .lean();

  const feed = [];

  for (const request of requests) {
    const matches = await getEmergencyMatches(
      request.bloodGroup,
      request.location,
      request.unitsNeeded,
      request.requesterCoordinates,
    );
    const hospitalMatch = matches.find((item) => item.id === String(hospitalId));

    if (request.status === "active" && !hospitalMatch) {
      continue;
    }

    feed.push({
      id: String(request._id),
      requesterName: request.requesterName,
      bloodGroup: request.bloodGroup,
      unitsNeeded: request.unitsNeeded,
      location: request.location,
      notes: request.notes,
      status: request.status,
      matches,
      hospitalMatch,
      acceptedByHospitalId: request.acceptedByHospitalId ? String(request.acceptedByHospitalId) : null,
      acceptedAt: request.acceptedAt,
      createdAt: request.createdAt,
      updatedAt: request.updatedAt,
    });
  }

  return feed;
}

export async function getRequesterEmergencyFeed(userId) {
  const requests = await EmergencyRequest.find({ requesterUserId: toId(userId) }).sort({ updatedAt: -1 }).lean();

  return Promise.all(
    requests.map(async (request) => {
      const matches = await getEmergencyMatches(
        request.bloodGroup,
        request.location,
        request.unitsNeeded,
        request.requesterCoordinates,
      );
      const acceptedHospital = request.acceptedByHospitalId
        ? await Account.findById(request.acceptedByHospitalId).lean()
        : null;

      return {
        id: String(request._id),
        requesterName: request.requesterName,
        bloodGroup: request.bloodGroup,
        unitsNeeded: request.unitsNeeded,
        location: request.location,
        notes: request.notes,
        status: request.status,
        matches,
        acceptedHospital: acceptedHospital?.name ?? null,
        acceptedByHospitalId: request.acceptedByHospitalId ? String(request.acceptedByHospitalId) : null,
        acceptedAt: request.acceptedAt,
        createdAt: request.createdAt,
        updatedAt: request.updatedAt,
      };
    }),
  );
}

export async function getHospitalDashboard(hospitalId) {
  const hospital = await Account.findById(toId(hospitalId)).lean();
  const inventory = await getHospitalInventory(hospitalId);
  const recentActivity = await getRecentDonorActivity(hospitalId);
  const emergencyFeed = await getHospitalEmergencyFeed(hospitalId);

  return {
    hospital: sanitizeAccount(hospital),
    summary: {
      totalUnits: inventory.reduce((sum, item) => sum + item.units, 0),
      lowStockAlerts: inventory.filter((item) => item.status !== "safe").length,
      donorCount: await Donor.countDocuments({ hospitalId: toId(hospitalId) }),
      activeEmergencyRequests: emergencyFeed.filter((item) => item.status === "active").length,
      acceptedEmergencyRequests: emergencyFeed.filter((item) => item.status === "accepted").length,
    },
    inventory,
    lowStock: inventory.filter((item) => item.status !== "safe"),
    recentActivity,
    emergencyFeed,
    emergencyResourcesActive: emergencyFeed
      .filter((item) => item.status === "active")
      .slice(0, 4)
      .map((item) => ({
        id: item.id,
        title: `${item.bloodGroup} needed in ${item.location}`,
        unitsNeeded: item.unitsNeeded,
        notes: item.notes,
      })),
    charts: {
      availability: inventory.map((item) => ({ bloodGroup: item.bloodGroup, units: item.units, threshold: item.threshold })),
      donationTrends: await getDonationTrends(hospitalId),
      emergencyDemand: await getEmergencyDemandTrends(hospitalId),
    },
  };
}

export async function getRequesterDashboard(userId) {
  const hospitals = await getPublicHospitals();
  const activeRequests = await getRequesterEmergencyFeed(userId);

  return {
    summary: {
      hospitalsOnline: hospitals.length,
      criticalHospitals: hospitals.filter((hospital) => hospital.status === "critical").length,
      activeRequests: activeRequests.filter((item) => item.status === "active").length,
    },
    hospitals: hospitals.slice(0, 10),
    activeRequests,
    charts: {
      bloodAvailability: bloodGroups.map((bloodGroup) => ({
        bloodGroup,
        units: hospitals.reduce(
          (sum, hospital) => sum + (hospital.inventory.find((item) => item.bloodGroup === bloodGroup)?.units ?? 0),
          0,
        ),
      })),
      emergencyDemand: await getEmergencyDemandTrends(null),
    },
  };
}
