import mongoose from "mongoose";

let isConnected = false;

export async function connectMongoose() {
  if (isConnected && mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    console.warn(
      "[Mongoose Warning] MONGODB_URI is not defined in environment variables."
    );
    return null;
  }

  try {
    const opts = {
      serverSelectionTimeoutMS: 5000,
    };

    await mongoose.connect(mongoUri, opts);
    isConnected = true;
    console.log("[Mongoose] Successfully connected to MongoDB.");
    return mongoose.connection;
  } catch (error) {
    console.error(
      "[Mongoose Error] Could not connect to MongoDB:",
      error.message
    );
    return null;
  }
}

export function isDbConnected() {
  return mongoose.connection.readyState === 1;
}
