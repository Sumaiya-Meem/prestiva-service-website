const mongoose = require('mongoose');

/**
 * Connect to MongoDB Atlas (or any MongoDB) using MONGODB_URI.
 *
 * Designed to be OPTIONAL: if no URI is configured the app keeps running and
 * simply skips persistence (emails still send). This means local dev and the
 * current email-only flow continue to work with zero setup.
 *
 * @returns {Promise<boolean>} true if connected, false if skipped/failed
 */
let isConnected = false;

const connectDB = async () => {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.warn('[db] MONGODB_URI not set — running without database (emails only).');
    return false;
  }

  try {
    mongoose.set('strictQuery', true);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
    });
    isConnected = true;
    console.log('[db] MongoDB connected.');
    return true;
  } catch (err) {
    console.error('[db] MongoDB connection failed:', err.message);
    return false;
  }
};

const dbReady = () => isConnected && mongoose.connection.readyState === 1;

module.exports = { connectDB, dbReady };
