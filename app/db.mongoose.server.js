import mongoose from "mongoose";
import dns from "dns";

// Fix Node.js Windows DNS SRV lookup failures for mongodb+srv:// URIs
try {
  dns.setServers(["8.8.8.8", "1.1.1.1", "8.8.4.4"]);
} catch (e) {
  // Ignore fallback warning if DNS servers cannot be overridden in restricted env
}

// Disable buffering so queries fail fast or return early if DB is offline instead of timing out after 10,000ms
mongoose.set("bufferCommands", false);

let connectionPromise = null;

export async function connectMongoose() {
  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  if (connectionPromise && mongoose.connection.readyState === 2) {
    await connectionPromise;
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

    connectionPromise = mongoose.connect(mongoUri, opts);
    await connectionPromise;
    console.log("[Mongoose] Successfully connected to MongoDB.");
    return mongoose.connection;
  } catch (error) {
    console.error(
      "[Mongoose Error] Could not connect to MongoDB:",
      error.message
    );
    connectionPromise = null;
    return null;
  }
}

export function isDbConnected() {
  return mongoose.connection.readyState === 1;
}
