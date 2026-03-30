import mongoose from "mongoose";

const { Schema, model, models } = mongoose;

const coordinatesSchema = new Schema(
  {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  { _id: false },
);

const accountSchema = new Schema(
  {
    role: { type: String, enum: ["hospital", "requester"], required: true, index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, trim: true, default: "" },
    address: { type: String, trim: true, default: "" },
    hospitalType: { type: String, trim: true, default: "" },
    contactPhone: { type: String, trim: true, default: "" },
    contactEmail: { type: String, trim: true, default: "" },
    coordinates: { type: coordinatesSchema, required: true },
  },
  { timestamps: true },
);

accountSchema.index({ role: 1, city: 1, state: 1 });

const inventorySchema = new Schema(
  {
    hospitalId: { type: Schema.Types.ObjectId, ref: "Account", required: true, index: true },
    bloodGroup: { type: String, required: true, index: true },
    units: { type: Number, required: true, min: 0 },
    lastUpdatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

inventorySchema.index({ hospitalId: 1, bloodGroup: 1 }, { unique: true });

const donorSchema = new Schema(
  {
    hospitalId: { type: Schema.Types.ObjectId, ref: "Account", required: true, index: true },
    name: { type: String, required: true, trim: true },
    bloodGroup: { type: String, required: true, index: true },
    location: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    lastDonationDate: { type: Date, required: true },
    availability: { type: String, default: "Ready" },
  },
  { timestamps: true },
);

donorSchema.index({ hospitalId: 1, name: 1 });
donorSchema.index({ hospitalId: 1, location: 1 });

const emergencyRequestSchema = new Schema(
  {
    requesterUserId: { type: Schema.Types.ObjectId, ref: "Account", default: null, index: true },
    requesterName: { type: String, required: true, trim: true },
    bloodGroup: { type: String, required: true, index: true },
    unitsNeeded: { type: Number, required: true, min: 1 },
    location: { type: String, required: true, trim: true },
    requesterCoordinates: { type: coordinatesSchema, default: null },
    contactNumber: { type: String, required: true, trim: true },
    notes: { type: String, default: "" },
    status: { type: String, enum: ["active", "accepted", "completed"], default: "active", index: true },
    acceptedByHospitalId: { type: Schema.Types.ObjectId, ref: "Account", default: null, index: true },
    acceptedAt: { type: Date, default: null },
  },
  { timestamps: true },
);

const activityLogSchema = new Schema(
  {
    hospitalId: { type: Schema.Types.ObjectId, ref: "Account", required: true, index: true },
    kind: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
  },
  { timestamps: true },
);

export const Account = models.Account || model("Account", accountSchema);
export const Inventory = models.Inventory || model("Inventory", inventorySchema);
export const Donor = models.Donor || model("Donor", donorSchema);
export const EmergencyRequest = models.EmergencyRequest || model("EmergencyRequest", emergencyRequestSchema);
export const ActivityLog = models.ActivityLog || model("ActivityLog", activityLogSchema);
