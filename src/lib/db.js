import mongoose from "mongoose";

/**
 * Cached Mongoose connection.
 *
 * Next.js hot-reloads server modules and serverless functions can be reused, so
 * the connection promise is stored on `globalThis` to avoid opening a new pool
 * on every request.
 */
const MONGODB_URI = process.env.MONGODB_URI;

const globalCache = globalThis;

if (!globalCache._mongoose) {
  globalCache._mongoose = { conn: null, promise: null };
}

export async function connectDb() {
  if (!MONGODB_URI) {
    throw new Error(
      "MONGODB_URI is not configured. Copy .env.example to .env.local and set it before using database features.",
    );
  }

  if (globalCache._mongoose.conn) return globalCache._mongoose.conn;

  if (!globalCache._mongoose.promise) {
    mongoose.set("strictQuery", true);
    globalCache._mongoose.promise = mongoose
      .connect(MONGODB_URI, {
        bufferCommands: false,
        // Keep the pool small: serverless-friendly and enough for this app.
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 10000,
      })
      .catch((error) => {
        // Reset so the next request can retry instead of caching the failure.
        globalCache._mongoose.promise = null;
        throw error;
      });
  }

  globalCache._mongoose.conn = await globalCache._mongoose.promise;
  return globalCache._mongoose.conn;
}

export function isDbConfigured() {
  return Boolean(MONGODB_URI);
}
