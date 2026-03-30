import { randomUUID } from "crypto";
import { signToken, verifyPassword, verifyToken, hashPassword } from "./security.js";
import { bloodGroups, ensureStore, readStore, updateStore } from "./store.js";

const stockThresholds = { "A+": 18, "A-": 8, "B+": 18, "B-": 8, "AB+": 10, "AB-": 4, "O+": 24, "O-": 10 };

function sanitizeAccount(account) {
  if (!account) return null;
  return {
    id: account.id,
    role: account.role,
    name: account.name,
    email: account.email,
    city: account.city,
    state: account.state ?? "",
    address: account.address,
    hospitalType: account.hospitalType ?? account.type ?? "",
    contactPhone: account.contactPhone ?? "",
    contactEmail: account.contactEmail ?? "",
    coordinates: account.coordinates ?? null,
    createdAt: account.createdAt,
  };
}

function getBloodStatus(units, threshold) {
  if (units <= Math.max(3, Math.floor(threshold * 0.45))) return "critical";
  if (units <= threshold) return "low";
  return "safe";
}

function getHospitalStatus(inventory) {
  const criticalCount = inventory.filter((item) => item.status === "critical").length;
  const lowCount = inventory.filter((item) => item.status === "low").length;
  if (criticalCount >= 2) return "critical";
  if (criticalCount >= 1 || lowCount >= 3) return "low";
  return "safe";
}

function haversineDistance(a, b) {
  if (!a?.lat || !a?.lng || !b?.lat || !b?.lng) return null;
  const toRadians = (value) => (value * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const deltaLat = toRadians(b.lat - a.lat);
  const deltaLng = toRadians(b.lng - a.lng);
  const arc = Math.sin(deltaLat / 2) ** 2 + Math.cos(toRadians(a.lat)) * Math.cos(toRadians(b.lat)) * Math.sin(deltaLng / 2) ** 2;
  return Number((earthRadiusKm * 2 * Math.atan2(Math.sqrt(arc), Math.sqrt(1 - arc))).toFixed(1));
}

function getHospitalInventoryView(store, hospitalId) {
  return bloodGroups.map((bloodGroup) => {
    const record = store.inventories.find((item) => item.hospitalId === hospitalId && item.bloodGroup === bloodGroup);
    const units = record?.units ?? 0;
    const threshold = stockThresholds[bloodGroup];
    return { id: record?.id ?? randomUUID(), hospitalId, bloodGroup, units, threshold, status: getBloodStatus(units, threshold), updatedAt: record?.updatedAt ?? null };
  });
}

function getPublicHospitals(store) {
  return store.hospitals
    .map((hospital) => {
      const inventory = getHospitalInventoryView(store, hospital.id);
      return {
        ...sanitizeAccount(hospital),
        latitude: hospital.coordinates?.lat ?? null,
        longitude: hospital.coordinates?.lng ?? null,
        totalUnits: inventory.reduce((sum, item) => sum + item.units, 0),
        bloodAvailabilitySummary: Object.fromEntries(inventory.map((item) => [item.bloodGroup, item.units])),
        inventory,
        status: getHospitalStatus(inventory),
      };
    })
    .sort((a, b) => {
      const weight = { critical: 0, low: 1, safe: 2 };
      return weight[a.status] - weight[b.status] || a.name.localeCompare(b.name);
    });
}

function getNearbyHospitals(store, latitude, longitude, limit = 8) {
  const origin = { lat: Number(latitude), lng: Number(longitude) };
  return getPublicHospitals(store)
    .map((hospital) => ({
      ...hospital,
      distanceKm: haversineDistance(origin, hospital.coordinates),
    }))
    .filter((hospital) => hospital.distanceKm !== null)
    .sort((a, b) => (a.distanceKm ?? 9999) - (b.distanceKm ?? 9999) || b.totalUnits - a.totalUnits)
    .slice(0, Number(limit) || 8);
}

function getEmergencyMatches(store, bloodGroup, location, unitsNeeded = 1, requesterCoordinates = null) {
  const hospitals = getPublicHospitals(store);
  const locationAnchor = requesterCoordinates || null;
  return hospitals
    .map((hospital) => {
      const stock = hospital.inventory.find((item) => item.bloodGroup === bloodGroup);
      return {
        id: hospital.id,
        name: hospital.name,
        city: hospital.city ?? "",
        state: hospital.state ?? "",
        address: hospital.address ?? "",
        contactPhone: hospital.contactPhone ?? "",
        status: hospital.status,
        availableUnits: stock?.units ?? 0,
        canFulfill: (stock?.units ?? 0) >= unitsNeeded,
        distance: haversineDistance(locationAnchor, hospital.coordinates),
      };
    })
    .filter((hospital) => hospital.availableUnits > 0)
    .sort((a, b) => Number(b.canFulfill) - Number(a.canFulfill) || (a.distance ?? 999) - (b.distance ?? 999) || b.availableUnits - a.availableUnits);
}

function getDonationTrends(store, hospitalId) {
  const donors = store.donors.filter((donor) => donor.hospitalId === hospitalId);
  const now = new Date();
  return Array.from({ length: 6 }).map((_, idx) => {
    const offset = 5 - idx;
    const pointDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - offset * 5);
    return { label: pointDate.toLocaleDateString("en-US", { month: "short", day: "numeric" }), donations: donors.filter((donor) => new Date(donor.lastDonationDate) <= pointDate).length };
  });
}

function getEmergencyDemandTrends(store) {
  const now = new Date();
  return Array.from({ length: 7 }).map((_, idx) => {
    const offset = 6 - idx;
    const pointDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - offset);
    const dayKey = pointDate.toISOString().slice(0, 10);
    return { day: dayKey.slice(5), requests: store.emergencyRequests.filter((request) => request.createdAt.slice(0, 10) === dayKey).length };
  });
}

function searchHospitalDonors(store, hospitalId, query = "") {
  const normalized = query.trim().toLowerCase();
  return store.donors
    .filter((donor) => donor.hospitalId === hospitalId)
    .filter(
      (donor) =>
        !normalized ||
        String(donor.name ?? "").toLowerCase().includes(normalized) ||
        String(donor.bloodGroup ?? "").toLowerCase().includes(normalized) ||
        String(donor.location ?? "").toLowerCase().includes(normalized),
    )
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
}

function getHospitalEmergencyFeed(store, hospitalId) {
  return store.emergencyRequests
    .map((request) => ({ ...request, matches: getEmergencyMatches(store, request.bloodGroup, request.location, request.unitsNeeded, request.requesterCoordinates) }))
    .map((request) => ({ ...request, hospitalMatch: request.matches.find((item) => item.id === hospitalId) }))
    .filter((request) => request.status !== "active" || request.hospitalMatch || request.acceptedByHospitalId === hospitalId)
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
}

function getRequesterEmergencyFeed(store, userId) {
  return store.emergencyRequests
    .filter((request) => request.requesterUserId === userId)
    .map((request) => ({ ...request, matches: getEmergencyMatches(store, request.bloodGroup, request.location, request.unitsNeeded, request.requesterCoordinates), acceptedHospital: store.hospitals.find((hospital) => hospital.id === request.acceptedByHospitalId)?.name ?? null }))
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
}

function getHospitalDashboard(store, hospitalId) {
  const inventory = getHospitalInventoryView(store, hospitalId);
  const emergencyFeed = getHospitalEmergencyFeed(store, hospitalId);
  const recentActivity = store.activities.filter((item) => item.hospitalId === hospitalId).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 6);
  return {
    hospital: sanitizeAccount(store.hospitals.find((item) => item.id === hospitalId)),
    summary: { totalUnits: inventory.reduce((sum, item) => sum + item.units, 0), lowStockAlerts: inventory.filter((item) => item.status !== "safe").length, donorCount: store.donors.filter((donor) => donor.hospitalId === hospitalId).length, activeEmergencyRequests: emergencyFeed.filter((item) => item.status === "active").length, acceptedEmergencyRequests: emergencyFeed.filter((item) => item.status === "accepted").length },
    inventory,
    lowStock: inventory.filter((item) => item.status !== "safe"),
    recentActivity,
    emergencyFeed,
    emergencyResourcesActive: emergencyFeed.filter((item) => item.status === "active").slice(0, 4).map((item) => ({ id: item.id, title: `${item.bloodGroup} needed in ${item.location}`, unitsNeeded: item.unitsNeeded, notes: item.notes })),
    charts: { availability: inventory.map((item) => ({ bloodGroup: item.bloodGroup, units: item.units, threshold: item.threshold })), donationTrends: getDonationTrends(store, hospitalId), emergencyDemand: getEmergencyDemandTrends(store) },
  };
}

function getRequesterDashboard(store, userId) {
  const hospitals = getPublicHospitals(store);
  const activeRequests = getRequesterEmergencyFeed(store, userId);
  return {
    summary: { hospitalsOnline: hospitals.length, criticalHospitals: hospitals.filter((hospital) => hospital.status === "critical").length, activeRequests: activeRequests.filter((item) => item.status === "active").length },
    hospitals: hospitals.slice(0, 10),
    activeRequests,
    charts: { bloodAvailability: bloodGroups.map((bloodGroup) => ({ bloodGroup, units: hospitals.reduce((sum, hospital) => sum + (hospital.inventory.find((item) => item.bloodGroup === bloodGroup)?.units ?? 0), 0) })), emergencyDemand: getEmergencyDemandTrends(store) },
  };
}

export async function startFallbackServer(app, { port, jwtSecret }) {
  await ensureStore();

  async function authenticate(request, response, next) {
    const token = request.headers.authorization?.replace("Bearer ", "");
    const payload = verifyToken(token, jwtSecret);
    if (!payload) return response.status(401).json({ message: "Unauthorized" });
    const store = await readStore();
    const account = [...store.hospitals, ...store.users].find((item) => item.id === payload.sub);
    if (!account) return response.status(401).json({ message: "Session no longer valid" });
    request.account = sanitizeAccount(account);
    next();
  }

  function requireHospital(request, response, next) {
    if (request.account?.role !== "hospital") return response.status(403).json({ message: "Hospital access required" });
    next();
  }

  app.get("/api/health", async (_request, response) => response.json({ status: "ok", mode: "local" }));

  app.post("/api/auth/login", async (request, response) => {
    const { email, password } = request.body ?? {};
    const store = await readStore();
    const account = [...store.hospitals, ...store.users].find((item) => item.email.toLowerCase() === String(email).toLowerCase().trim());
    if (!account || !verifyPassword(password, account.passwordHash)) return response.status(401).json({ message: "Invalid email or password" });
    response.json({ token: signToken({ sub: account.id, role: account.role, email: account.email }, jwtSecret, 60 * 60 * 12), profile: sanitizeAccount(account) });
  });

  app.post("/api/auth/register", async (request, response) => {
    const { role, name, email, password, city, state, hospitalType, address, latitude, longitude, contactPhone } = request.body ?? {};
    try {
      let createdAccount = null;
      await updateStore((store) => {
        const normalizedEmail = String(email).toLowerCase().trim();
        if ([...store.hospitals, ...store.users].some((item) => item.email.toLowerCase() === normalizedEmail)) throw new Error("An account with that email already exists");
        const base = { id: randomUUID(), role: role === "hospital" ? "hospital" : "requester", name, email: normalizedEmail, passwordHash: hashPassword(password), city, state: state || "", address: address || city, contactPhone: contactPhone || "", contactEmail: normalizedEmail, coordinates: { lat: Number(latitude) || 17.4239, lng: Number(longitude) || 78.4348 }, createdAt: new Date().toISOString() };
        if (base.role === "hospital") {
          createdAccount = { ...base, hospitalType: hospitalType || "Hospital" };
          store.hospitals.push(createdAccount);
          bloodGroups.forEach((bloodGroup) => store.inventories.push({ id: randomUUID(), hospitalId: createdAccount.id, bloodGroup, units: 0, updatedAt: new Date().toISOString() }));
        } else {
          createdAccount = base;
          store.users.push(createdAccount);
        }
        return store;
      });
      response.status(201).json({ token: signToken({ sub: createdAccount.id, role: createdAccount.role, email: createdAccount.email }, jwtSecret, 60 * 60 * 12), profile: sanitizeAccount(createdAccount) });
    } catch (error) {
      response.status(409).json({ message: error.message });
    }
  });

  app.get("/api/auth/me", authenticate, async (request, response) => response.json({ profile: request.account }));

  app.get("/api/command-center", authenticate, async (request, response) => {
    const store = await readStore();
    if (request.account.role === "hospital") return response.json({ mode: "local", role: "hospital", dashboard: getHospitalDashboard(store, request.account.id), hospitals: getPublicHospitals(store), emergencyFeed: getHospitalEmergencyFeed(store, request.account.id) });
    response.json({ mode: "local", role: "requester", dashboard: getRequesterDashboard(store, request.account.id), hospitals: getPublicHospitals(store), emergencyFeed: getRequesterEmergencyFeed(store, request.account.id) });
  });

  app.get("/api/hospitals", authenticate, async (_request, response) => {
    const store = await readStore();
    response.json({ items: getPublicHospitals(store) });
  });

  app.get("/api/hospitals/nearby", authenticate, async (request, response) => {
    const latitude = Number(request.query.lat);
    const longitude = Number(request.query.lng);
    const limit = Number(request.query.limit || 8);
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return response.status(400).json({ message: "Valid lat and lng query parameters are required" });
    }
    const store = await readStore();
    response.json({ items: getNearbyHospitals(store, latitude, longitude, limit) });
  });

  app.get("/api/inventory", authenticate, requireHospital, async (request, response) => {
    const store = await readStore();
    response.json({ items: getHospitalInventoryView(store, request.account.id) });
  });

  app.patch("/api/inventory/:id", authenticate, requireHospital, async (request, response) => {
    const units = Number(request.body?.units);
    let item = null;
    await updateStore((store) => {
      const match = store.inventories.find((entry) => entry.id === request.params.id && entry.hospitalId === request.account.id);
      if (!match) return store;
      match.units = units;
      match.updatedAt = new Date().toISOString();
      item = match;
      return store;
    });
    if (!item) return response.status(404).json({ message: "Inventory record not found" });
    response.json({ item });
  });

  app.delete("/api/inventory/:id", authenticate, requireHospital, async (request, response) => {
    let item = null;
    await updateStore((store) => {
      const match = store.inventories.find((entry) => entry.id === request.params.id && entry.hospitalId === request.account.id);
      if (!match) return store;
      match.units = 0;
      match.updatedAt = new Date().toISOString();
      item = match;
      return store;
    });
    if (!item) return response.status(404).json({ message: "Inventory record not found" });
    response.json({ item });
  });

  app.get("/api/donors", authenticate, requireHospital, async (request, response) => {
    const store = await readStore();
    response.json({ items: searchHospitalDonors(store, request.account.id, String(request.query.q || "")) });
  });

  app.post("/api/donors", authenticate, requireHospital, async (request, response) => {
    const { name, bloodGroup, location, phone, lastDonationDate, availability } = request.body ?? {};
    let donor = null;
    await updateStore((store) => {
      donor = { id: randomUUID(), hospitalId: request.account.id, name, bloodGroup, location, phone, lastDonationDate: lastDonationDate || new Date().toISOString(), availability: availability || "Ready", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      store.donors.unshift(donor);
      return store;
    });
    response.status(201).json({ item: donor });
  });

  app.patch("/api/donors/:id", authenticate, requireHospital, async (request, response) => {
    let donor = null;
    await updateStore((store) => {
      const match = store.donors.find((entry) => entry.id === request.params.id && entry.hospitalId === request.account.id);
      if (!match) return store;
      Object.assign(match, request.body, { updatedAt: new Date().toISOString() });
      donor = match;
      return store;
    });
    if (!donor) return response.status(404).json({ message: "Donor not found" });
    response.json({ item: donor });
  });

  app.delete("/api/donors/:id", authenticate, requireHospital, async (request, response) => {
    let found = false;
    await updateStore((store) => {
      const index = store.donors.findIndex((entry) => entry.id === request.params.id && entry.hospitalId === request.account.id);
      if (index === -1) return store;
      store.donors.splice(index, 1);
      found = true;
      return store;
    });
    if (!found) return response.status(404).json({ message: "Donor not found" });
    response.json({ item: { id: request.params.id } });
  });

  app.get("/api/emergency-requests", authenticate, async (request, response) => {
    const store = await readStore();
    response.json({ items: request.account.role === "hospital" ? getHospitalEmergencyFeed(store, request.account.id) : getRequesterEmergencyFeed(store, request.account.id) });
  });

  app.post("/api/emergency-requests", authenticate, async (request, response) => {
    const { bloodGroup, unitsNeeded, location, contactNumber, notes } = request.body ?? {};
    let item = null;
    await updateStore((store) => {
      item = { id: randomUUID(), requesterUserId: request.account.id, requesterName: request.account.name, bloodGroup, unitsNeeded: Number(unitsNeeded), location, requesterCoordinates: request.account.coordinates, contactNumber, notes: notes || "", status: "active", acceptedByHospitalId: null, acceptedAt: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
      store.emergencyRequests.unshift(item);
      return store;
    });
    const store = await readStore();
    response.status(201).json({ item, matches: getEmergencyMatches(store, bloodGroup, location, Number(unitsNeeded), request.account.coordinates) });
  });

  app.post("/api/emergency-requests/:id/respond", authenticate, requireHospital, async (request, response) => {
    const { action } = request.body ?? {};
    let item = null;
    let errorMessage = null;
    await updateStore((store) => {
      const emergencyRequest = store.emergencyRequests.find((entry) => entry.id === request.params.id);
      if (!emergencyRequest) return store;
      if (action === "accept") {
        const inventory = store.inventories.find((entry) => entry.hospitalId === request.account.id && entry.bloodGroup === emergencyRequest.bloodGroup);
        if (!inventory || inventory.units < emergencyRequest.unitsNeeded) {
          errorMessage = "Insufficient stock to accept this request";
          return store;
        }
        inventory.units -= emergencyRequest.unitsNeeded;
        inventory.updatedAt = new Date().toISOString();
        emergencyRequest.status = "accepted";
        emergencyRequest.acceptedByHospitalId = request.account.id;
        emergencyRequest.acceptedAt = new Date().toISOString();
        emergencyRequest.updatedAt = new Date().toISOString();
        item = emergencyRequest;
      }
      if (action === "complete" && emergencyRequest.acceptedByHospitalId === request.account.id) {
        emergencyRequest.status = "completed";
        emergencyRequest.updatedAt = new Date().toISOString();
        item = emergencyRequest;
      }
      return store;
    });
    if (errorMessage) return response.status(400).json({ message: errorMessage });
    if (!item) return response.status(404).json({ message: "Emergency request not found" });
    response.json({ item });
  });

  app.listen(port, () => {
    console.log(`LifeFlow API running on http://localhost:${port} (local fallback mode)`);
  });
}
