import "./load-env.js";
import mongoose from "mongoose";

const mongoUri = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/lifeflow";

export async function connectDatabase() {
  await mongoose.connect(mongoUri, {
    serverSelectionTimeoutMS: 5000,
  });
}
