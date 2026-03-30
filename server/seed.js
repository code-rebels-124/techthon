import "./load-env.js";
import { readFile } from "fs/promises";
import path from "path";
import { randomInt } from "crypto";
import bcrypt from "bcryptjs";
import { connectDatabase } from "./db.js";
import { Account, ActivityLog, Donor, EmergencyRequest, Inventory } from "./models.js";

const bloodGroups = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];
const donorCountPerHospital = 8;
const firstNames = ["Aarav", "Aditi", "Rahul", "Sneha", "Ishaan", "Meera", "Arjun", "Priya", "Karthik", "Nisha", "Vikram", "Anika", "Rohan", "Sana", "Farhan", "Divya", "Neha", "Aditya", "Kiran", "Pooja"];
const lastNames = ["Reddy", "Sharma", "Verma", "Patel", "Rao", "Menon", "Singh", "Khan", "Nair", "Jain", "Kulkarni", "Gupta", "Iyer", "Das", "Bose"];
const availabilityStates = ["Ready", "Ready", "Ready", "Review", "Unavailable"];

function sample(array) {
  return array[randomInt(0, array.length)];
}

function randomDateWithin(days) {
  return new Date(Date.now() - randomInt(1, days) * 24 * 60 * 60 * 1000);
}

function inventoryUnitsForGroup(bloodGroup) {
  if (bloodGroup === "O+" || bloodGroup === "B+") {
    return randomInt(50, 121);
  }

  if (bloodGroup === "A+" || bloodGroup === "AB+") {
    return randomInt(20, 81);
  }

  if (bloodGroup === "O-" || bloodGroup === "AB-") {
    return randomInt(5, 31);
  }

  return randomInt(15, 61);
}

function makeHospitalEmail(name, index) {
  if (index === 0) {
    return "hospital@test.com";
  }

  return `${name.toLowerCase().replace(/[^a-z0-9]+/g, ".").replace(/^\.+|\.+$/g, "")}@lifeflow.in`;
}

function createInventoryDocuments(hospitals) {
  return hospitals.flatMap((hospital) =>
    bloodGroups.map((bloodGroup) => ({
      hospitalId: hospital._id,
      bloodGroup,
      units: inventoryUnitsForGroup(bloodGroup),
      lastUpdatedAt: randomDateWithin(10),
    })),
  );
}

function createDonorDocuments(hospitals) {
  return hospitals.flatMap((hospital) =>
    Array.from({ length: donorCountPerHospital }).map(() => ({
      hospitalId: hospital._id,
      name: `${sample(firstNames)} ${sample(lastNames)}`,
      bloodGroup: sample(bloodGroups),
      location: `${hospital.city} ${sample(["Central", "North", "South", "East", "West"])}`,
      phone: `9${randomInt(100000000, 999999999)}`,
      lastDonationDate: randomDateWithin(180),
      availability: sample(availabilityStates),
    })),
  );
}

async function loadHospitalDataset() {
  const filePath = path.resolve(process.cwd(), "server", "data", "hospitals.json");
  const raw = await readFile(filePath, "utf8");
  const hospitals = JSON.parse(raw);

  if (!Array.isArray(hospitals) || hospitals.length < 30) {
    throw new Error("Hospital dataset must contain at least 30 hospitals.");
  }

  const uniqueNames = new Set(hospitals.map((hospital) => hospital.name.toLowerCase().trim()));

  if (uniqueNames.size !== hospitals.length) {
    throw new Error("Duplicate hospital names found in local hospital dataset.");
  }

  return hospitals;
}

async function validateSeededData(hospitalDocs, inventoryDocs, donorDocs) {
  if (hospitalDocs.length < 30) {
    throw new Error("Seeding validation failed: fewer than 30 hospitals inserted.");
  }

  const inventoryCount = await Inventory.countDocuments({ hospitalId: { $in: hospitalDocs.map((hospital) => hospital._id) } });
  const donorCount = await Donor.countDocuments({ hospitalId: { $in: hospitalDocs.map((hospital) => hospital._id) } });

  if (inventoryCount !== inventoryDocs.length) {
    throw new Error("Seeding validation failed: inventory count mismatch.");
  }

  if (donorCount !== donorDocs.length) {
    throw new Error("Seeding validation failed: donor count mismatch.");
  }

  const hospitalsWithoutInventory = await Inventory.aggregate([
    { $group: { _id: "$hospitalId", records: { $sum: 1 } } },
    { $match: { records: { $lt: bloodGroups.length } } },
  ]);

  if (hospitalsWithoutInventory.length) {
    throw new Error("Seeding validation failed: some hospitals do not have a full inventory set.");
  }
}

async function seed() {
  const startedAt = Date.now();
  const localHospitals = await loadHospitalDataset();
  await connectDatabase();

  await Promise.all([
    Account.deleteMany({}),
    Inventory.deleteMany({}),
    Donor.deleteMany({}),
    EmergencyRequest.deleteMany({}),
    ActivityLog.deleteMany({}),
  ]);

  const passwordHash = await bcrypt.hash("123456", 10);

  const hospitalAccounts = localHospitals.map((hospital, index) => ({
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
    coordinates: {
      lat: hospital.lat,
      lng: hospital.lng,
    },
  }));

  const hospitals = await Account.insertMany(hospitalAccounts, { ordered: true });

  await Account.create({
    role: "requester",
    name: "LifeFlow Request Desk",
    email: "user@test.com",
    passwordHash,
    city: "Hyderabad",
    state: "Telangana",
    address: "Banjara Hills, Hyderabad",
    hospitalType: "",
    contactPhone: "9000000999",
    contactEmail: "user@test.com",
    coordinates: { lat: 17.4239, lng: 78.4348 },
  });

  const inventoryDocs = createInventoryDocuments(hospitals);
  const donorDocs = createDonorDocuments(hospitals);

  await Promise.all([
    Inventory.insertMany(inventoryDocs, { ordered: true }),
    Donor.insertMany(donorDocs, { ordered: true }),
    ActivityLog.insertMany(
      hospitals.map((hospital) => ({
        hospitalId: hospital._id,
        kind: "seeded",
        title: `${hospital.name} seeded`,
        description: "Hospital inventory and donor roster loaded from local seed data.",
      })),
      { ordered: true },
    ),
  ]);

  await validateSeededData(hospitals, inventoryDocs, donorDocs);

  const durationMs = Date.now() - startedAt;
  console.log(
    JSON.stringify(
      {
        hospitals: hospitals.length,
        inventoryRecords: inventoryDocs.length,
        donors: donorDocs.length,
        durationMs,
      },
      null,
      2,
    ),
  );
  process.exit(0);
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
