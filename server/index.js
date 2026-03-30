import "./load-env.js";
import cors from "cors";
import express from "express";
import path from "path";
import { existsSync } from "fs";
import { fileURLToPath } from "url";
import { startFallbackServer } from "./fallback-server.js";
import { connectDatabase } from "./db.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { Account, Donor, EmergencyRequest, Inventory } from "./models.js";
import {
  bloodGroups,
  ensureHospitalInventory,
  getEmergencyMatches,
  getHospitalDashboard,
  getHospitalEmergencyFeed,
  getHospitalInventory,
  getNearbyHospitals,
  getPublicHospitals,
  getRequesterDashboard,
  getRequesterEmergencyFeed,
  sanitizeAccount,
  searchHospitalDonors,
} from "./services.js";

const app = express();
const port = Number(process.env.PORT || 4000);
const jwtSecret = process.env.JWT_SECRET || "replace-this-secret";
const tokenTtl = process.env.TOKEN_TTL_HOURS || "12h";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.resolve(__dirname, "..", "dist");
const hasBuiltFrontend = existsSync(distPath);

app.use(cors());
app.use(express.json());

function configureStaticHosting() {
  if (!hasBuiltFrontend) {
    return;
  }

  app.use(express.static(distPath));

  app.get("/", (_request, response) => response.sendFile(path.join(distPath, "index.html")));

  app.get("/{*splat}", (request, response, next) => {
    if (request.path.startsWith("/api")) {
      return next();
    }

    return response.sendFile(path.join(distPath, "index.html"));
  });
}

function createToken(account) {
  return jwt.sign({ sub: String(account._id), role: account.role, email: account.email }, jwtSecret, { expiresIn: tokenTtl });
}

async function authenticate(request, response, next) {
  const token = request.headers.authorization?.replace("Bearer ", "");
  if (!token) return response.status(401).json({ message: "Unauthorized" });
  try {
    const payload = jwt.verify(token, jwtSecret);
    const account = await Account.findById(payload.sub).lean();
    if (!account) return response.status(401).json({ message: "Session no longer valid" });
    request.account = sanitizeAccount(account);
    next();
  } catch {
    response.status(401).json({ message: "Unauthorized" });
  }
}

function requireHospital(request, response, next) {
  if (request.account?.role !== "hospital") return response.status(403).json({ message: "Hospital access required" });
  next();
}

function registerMongoRoutes() {
  app.get("/api/health", async (_request, response) => response.json({ status: "ok", mode: "mongo" }));

  app.post("/api/auth/login", async (request, response) => {
    const { email, password } = request.body ?? {};
    const account = await Account.findOne({ email: email.toLowerCase().trim() });
    if (!account || !(await bcrypt.compare(password, account.passwordHash))) return response.status(401).json({ message: "Invalid email or password" });
    response.json({ token: createToken(account), profile: sanitizeAccount(account) });
  });

  app.post("/api/auth/register", async (request, response) => {
    const { role, name, email, password, city, state, hospitalType, address, latitude, longitude, contactPhone } = request.body ?? {};
    const existing = await Account.findOne({ email: email.toLowerCase().trim() }).lean();
    if (existing) return response.status(409).json({ message: "An account with that email already exists" });
    const account = await Account.create({
      role: role === "hospital" ? "hospital" : "requester",
      name,
      email: email.toLowerCase().trim(),
      passwordHash: await bcrypt.hash(password, 10),
      city,
      state: state || "",
      address: address || city,
      hospitalType: role === "hospital" ? hospitalType || "Hospital" : "",
      contactPhone: contactPhone || "",
      contactEmail: email.toLowerCase().trim(),
      coordinates: { lat: Number(latitude) || 17.4239, lng: Number(longitude) || 78.4348 },
    });
    if (account.role === "hospital") await ensureHospitalInventory(account._id);
    response.status(201).json({ token: createToken(account), profile: sanitizeAccount(account) });
  });

  app.get("/api/auth/me", authenticate, async (request, response) => response.json({ profile: request.account }));

  app.get("/api/command-center", authenticate, async (request, response) => {
    if (request.account.role === "hospital") return response.json({ mode: "mongo", role: "hospital", dashboard: await getHospitalDashboard(request.account.id), hospitals: await getPublicHospitals(), emergencyFeed: await getHospitalEmergencyFeed(request.account.id) });
    response.json({ mode: "mongo", role: "requester", dashboard: await getRequesterDashboard(request.account.id), hospitals: await getPublicHospitals(), emergencyFeed: await getRequesterEmergencyFeed(request.account.id) });
  });

  app.get("/api/hospitals", authenticate, async (_request, response) => response.json({ items: await getPublicHospitals() }));
  app.get("/api/hospitals/nearby", authenticate, async (request, response) => {
    const latitude = Number(request.query.lat);
    const longitude = Number(request.query.lng);
    const limit = Number(request.query.limit || 8);
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return response.status(400).json({ message: "Valid lat and lng query parameters are required" });
    }
    return response.json({ items: await getNearbyHospitals(latitude, longitude, limit) });
  });
  app.get("/api/inventory", authenticate, requireHospital, async (request, response) => response.json({ items: await getHospitalInventory(request.account.id) }));

  app.patch("/api/inventory/:id", authenticate, requireHospital, async (request, response) => {
    const item = await Inventory.findOneAndUpdate({ _id: request.params.id, hospitalId: request.account.id }, { units: Number(request.body?.units), lastUpdatedAt: new Date() }, { new: true }).lean();
    if (!item) return response.status(404).json({ message: "Inventory record not found" });
    response.json({ item: { id: String(item._id), bloodGroup: item.bloodGroup, units: item.units, updatedAt: item.lastUpdatedAt } });
  });

  app.delete("/api/inventory/:id", authenticate, requireHospital, async (request, response) => {
    const item = await Inventory.findOneAndUpdate({ _id: request.params.id, hospitalId: request.account.id }, { units: 0, lastUpdatedAt: new Date() }, { new: true }).lean();
    if (!item) return response.status(404).json({ message: "Inventory record not found" });
    response.json({ item: { id: String(item._id), bloodGroup: item.bloodGroup, units: item.units, updatedAt: item.lastUpdatedAt } });
  });

  app.get("/api/donors", authenticate, requireHospital, async (request, response) => response.json({ items: await searchHospitalDonors(request.account.id, String(request.query.q || "")) }));

  app.post("/api/donors", authenticate, requireHospital, async (request, response) => {
    const { name, bloodGroup, location, phone, lastDonationDate, availability } = request.body ?? {};
    const donor = await Donor.create({ hospitalId: request.account.id, name, bloodGroup, location, phone, lastDonationDate: lastDonationDate || new Date(), availability: availability || "Ready" });
    response.status(201).json({ item: { id: String(donor._id), name: donor.name, bloodGroup: donor.bloodGroup, location: donor.location, phone: donor.phone, lastDonationDate: donor.lastDonationDate, availability: donor.availability } });
  });

  app.patch("/api/donors/:id", authenticate, requireHospital, async (request, response) => {
    const donor = await Donor.findOneAndUpdate({ _id: request.params.id, hospitalId: request.account.id }, request.body, { new: true }).lean();
    if (!donor) return response.status(404).json({ message: "Donor not found" });
    response.json({ item: { id: String(donor._id), name: donor.name, bloodGroup: donor.bloodGroup, location: donor.location, phone: donor.phone, lastDonationDate: donor.lastDonationDate, availability: donor.availability } });
  });

  app.delete("/api/donors/:id", authenticate, requireHospital, async (request, response) => {
    const donor = await Donor.findOneAndDelete({ _id: request.params.id, hospitalId: request.account.id }).lean();
    if (!donor) return response.status(404).json({ message: "Donor not found" });
    response.json({ item: { id: String(donor._id) } });
  });

  app.get("/api/emergency-requests", authenticate, async (request, response) => response.json({ items: request.account.role === "hospital" ? await getHospitalEmergencyFeed(request.account.id) : await getRequesterEmergencyFeed(request.account.id) }));

  app.post("/api/emergency-requests", authenticate, async (request, response) => {
    const { bloodGroup, unitsNeeded, location, contactNumber, notes } = request.body ?? {};
    const emergencyRequest = await EmergencyRequest.create({ requesterUserId: request.account.id, requesterName: request.account.name, bloodGroup, unitsNeeded: Number(unitsNeeded), location, requesterCoordinates: request.account.coordinates, contactNumber, notes: notes || "", status: "active" });
    response.status(201).json({ item: { id: String(emergencyRequest._id), bloodGroup: emergencyRequest.bloodGroup, unitsNeeded: emergencyRequest.unitsNeeded, location: emergencyRequest.location, status: emergencyRequest.status }, matches: await getEmergencyMatches(bloodGroup, location, Number(unitsNeeded), request.account.coordinates) });
  });

  app.post("/api/emergency-requests/:id/respond", authenticate, requireHospital, async (request, response) => {
    const emergencyRequest = await EmergencyRequest.findById(request.params.id);
    if (!emergencyRequest) return response.status(404).json({ message: "Emergency request not found" });
    if (request.body?.action === "accept") {
      const inventory = await Inventory.findOne({ hospitalId: request.account.id, bloodGroup: emergencyRequest.bloodGroup });
      if (!inventory || inventory.units < emergencyRequest.unitsNeeded) return response.status(400).json({ message: "Insufficient stock to accept this request" });
      inventory.units -= emergencyRequest.unitsNeeded;
      inventory.lastUpdatedAt = new Date();
      await inventory.save();
      emergencyRequest.status = "accepted";
      emergencyRequest.acceptedByHospitalId = request.account.id;
      emergencyRequest.acceptedAt = new Date();
      await emergencyRequest.save();
    }
    if (request.body?.action === "complete" && String(emergencyRequest.acceptedByHospitalId) === request.account.id) {
      emergencyRequest.status = "completed";
      await emergencyRequest.save();
    }
    response.json({ item: { id: String(emergencyRequest._id), status: emergencyRequest.status } });
  });

  configureStaticHosting();
  app.listen(port, () => console.log(`LifeFlow API running on http://localhost:${port} (mongo mode)`));
}

connectDatabase()
  .then(() => {
    registerMongoRoutes();
  })
  .catch(async (error) => {
    console.warn(`MongoDB unavailable (${error.message}). Falling back to local datastore.`);
    configureStaticHosting();
    await startFallbackServer(app, { port, jwtSecret });
  });
