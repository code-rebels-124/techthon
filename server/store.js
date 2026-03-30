import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { hashPassword } from "./security.js";

export const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const dbDirectory = path.resolve(process.cwd(), "server", "data");
const dbPath = path.join(dbDirectory, "store.json");
const hospitalsJsonPath = path.join(dbDirectory, "hospitals.json");

let writeQueue = Promise.resolve();

function randomInt(min, maxInclusive) {
  return Math.floor(Math.random() * (maxInclusive - min + 1)) + min;
}

function randomDateWithin(days) {
  return new Date(Date.now() - randomInt(1, days) * 24 * 60 * 60 * 1000).toISOString();
}

async function loadHospitalDataset() {
  const raw = await readFile(hospitalsJsonPath, "utf8");
  return JSON.parse(raw);
}

function normalizeHospitalName(name) {
  return String(name || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function makeHospitalEmail(name, index = 0) {
  if (index === 0) {
    return "hospital@test.com";
  }

  return `${String(name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ".")
    .replace(/^\.+|\.+$/g, "")}@lifeflow.in`;
}

function isSeededHospitalEmail(email) {
  const normalized = String(email || "").toLowerCase();
  return normalized === "hospital@test.com" || normalized === "nova@test.com" || normalized.endsWith("@lifeflow.in");
}

function inventoryUnitsForGroup(bloodGroup) {
  if (bloodGroup === "O+" || bloodGroup === "B+") return randomInt(50, 120);
  if (bloodGroup === "A+" || bloodGroup === "AB+") return randomInt(20, 80);
  if (bloodGroup === "O-" || bloodGroup === "AB-") return randomInt(5, 30);
  return randomInt(15, 60);
}

const firstNames = ["Aarav", "Aditi", "Rahul", "Sneha", "Ishaan", "Meera", "Arjun", "Priya", "Karthik", "Nisha", "Vikram", "Anika", "Rohan", "Sana", "Farhan", "Divya", "Neha", "Aditya", "Kiran", "Pooja"];
const lastNames = ["Reddy", "Sharma", "Verma", "Patel", "Rao", "Menon", "Singh", "Khan", "Nair", "Jain", "Kulkarni", "Gupta", "Iyer", "Das", "Bose"];
const availabilityStates = ["Ready", "Ready", "Ready", "Review", "Unavailable"];

function sample(array) {
  return array[randomInt(0, array.length - 1)];
}

async function createSeedData() {
  const hospitalSeedData = await loadHospitalDataset();
  const passwordHash = hashPassword("123456");

  const hospitals = hospitalSeedData.map((hospital, index) => ({
    id: randomUUID(),
    role: "hospital",
    name: hospital.name,
    email: makeHospitalEmail(hospital.name, index),
    passwordHash,
    city: hospital.city,
    state: hospital.state,
    address: hospital.address,
    hospitalType: "Blood Bank Network Hospital",
    contactPhone: hospital.contact,
    contactEmail: makeHospitalEmail(hospital.name, index),
    coordinates: { lat: hospital.lat, lng: hospital.lng },
    createdAt: randomDateWithin(30),
  }));

  const users = [
    {
      id: randomUUID(),
      role: "requester",
      name: "LifeFlow Request Desk",
      email: "user@test.com",
      passwordHash,
      city: "Hyderabad",
      state: "Telangana",
      address: "Banjara Hills, Hyderabad",
      contactPhone: "9000000999",
      contactEmail: "user@test.com",
      coordinates: { lat: 17.4239, lng: 78.4348 },
      createdAt: randomDateWithin(30),
    },
  ];

  const inventories = hospitals.flatMap((hospital) =>
    bloodGroups.map((bloodGroup) => ({
      id: randomUUID(),
      hospitalId: hospital.id,
      bloodGroup,
      units: inventoryUnitsForGroup(bloodGroup),
      updatedAt: randomDateWithin(10),
    })),
  );

  const donors = hospitals.flatMap((hospital) =>
    Array.from({ length: 8 }).map(() => ({
      id: randomUUID(),
      hospitalId: hospital.id,
      name: `${sample(firstNames)} ${sample(lastNames)}`,
      bloodGroup: sample(bloodGroups),
      location: `${hospital.city} ${sample(["Central", "North", "South", "East", "West"])}`,
      phone: `9${randomInt(100000000, 999999999)}`,
      lastDonationDate: randomDateWithin(180),
      availability: sample(availabilityStates),
      createdAt: randomDateWithin(30),
      updatedAt: randomDateWithin(10),
    })),
  );

  const emergencyRequests = hospitals.slice(0, 12).map((hospital, index) => ({
    id: randomUUID(),
    requesterUserId: users[0].id,
    requesterName: users[0].name,
    bloodGroup: bloodGroups[index % bloodGroups.length],
    unitsNeeded: randomInt(1, 4),
    location: hospital.city,
    requesterCoordinates: users[0].coordinates,
    contactNumber: users[0].contactPhone,
    notes: `Urgent ${bloodGroups[index % bloodGroups.length]} support needed near ${hospital.city}.`,
    status: "active",
    acceptedByHospitalId: null,
    acceptedAt: null,
    createdAt: randomDateWithin(14),
    updatedAt: randomDateWithin(4),
  }));

  const activities = hospitals.flatMap((hospital) => [
    {
      id: randomUUID(),
      hospitalId: hospital.id,
      kind: "inventory_update",
      title: `${hospital.name} inventory calibrated`,
      description: `Real-time stock feed synced for ${hospital.city}.`,
      createdAt: randomDateWithin(7),
    },
    {
      id: randomUUID(),
      hospitalId: hospital.id,
      kind: "donor_added",
      title: `Donor roster expanded for ${hospital.name}`,
      description: `High-priority donor outreach updated for ${hospital.city}.`,
      createdAt: randomDateWithin(7),
    },
  ]);

  return { hospitals, users, inventories, donors, emergencyRequests, activities };
}

async function shouldUpgradeStore(store) {
  const dataset = await loadHospitalDataset();
  const datasetNames = new Set(dataset.map((hospital) => normalizeHospitalName(hospital.name)));
  const presentCount = store.hospitals.filter((hospital) => datasetNames.has(normalizeHospitalName(hospital.name))).length;
  return presentCount < dataset.length;
}

async function upgradeStoreWithHospitalDataset(store) {
  const seed = await createSeedData();
  const preservedHospitals = store.hospitals.filter((hospital) => !isSeededHospitalEmail(hospital.email));
  const preservedHospitalIds = new Set(preservedHospitals.map((hospital) => hospital.id));
  const preservedUsers = store.users.filter((user) => user.email !== "user@test.com");
  const preservedEmergencyRequests = store.emergencyRequests.filter(
    (request) => !request.acceptedByHospitalId || preservedHospitalIds.has(request.acceptedByHospitalId),
  );

  return {
    hospitals: [...seed.hospitals, ...preservedHospitals],
    users: [...seed.users, ...preservedUsers],
    inventories: [
      ...seed.inventories,
      ...store.inventories.filter((item) => preservedHospitalIds.has(item.hospitalId)),
    ],
    donors: [...seed.donors, ...store.donors.filter((item) => preservedHospitalIds.has(item.hospitalId))],
    emergencyRequests: preservedEmergencyRequests.length ? preservedEmergencyRequests : seed.emergencyRequests,
    activities: [...seed.activities, ...store.activities.filter((item) => preservedHospitalIds.has(item.hospitalId))],
  };
}

export async function ensureStore() {
  await mkdir(dbDirectory, { recursive: true });

  try {
    const raw = await readFile(dbPath, "utf8");
    const existing = JSON.parse(raw);

    if (await shouldUpgradeStore(existing)) {
      const upgraded = await upgradeStoreWithHospitalDataset(existing);
      await writeFile(dbPath, JSON.stringify(upgraded, null, 2));
    }
  } catch {
    const seed = await createSeedData();
    await writeFile(dbPath, JSON.stringify(seed, null, 2));
  }
}

export async function readStore() {
  await ensureStore();
  const raw = await readFile(dbPath, "utf8");
  return JSON.parse(raw);
}

export async function writeStore(data) {
  await ensureStore();
  writeQueue = writeQueue.then(() => writeFile(dbPath, JSON.stringify(data, null, 2)));
  await writeQueue;
  return data;
}

export async function updateStore(updater) {
  const current = await readStore();
  const next = await updater(structuredClone(current));
  return writeStore(next);
}
