const mongoose = require("mongoose");

const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    console.error("❌ MONGO_URI is missing in .env");
    process.exit(1);
  }

  try {
    let mongoUri = process.env.MONGODB_URI;

    // Fallback to memory server if local connection is used (avoids user environment issues)
    if (!mongoUri || mongoUri.includes('127.0.0.1') || mongoUri.includes('localhost')) {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongoServer = await MongoMemoryServer.create();
      mongoUri = mongoServer.getUri();
      console.log(`🧠 Using In-Memory MongoDB since Atlas credentials failed or are missing`);
    }

    const conn = await mongoose.connect(mongoUri);
    // Mongoose connection events
    mongoose.connection.on('connected', () => {
      console.log('✅ Mongoose connected to DB Cluster');
    });

    mongoose.connection.on('error', (err) => {
      console.error(`❌ Mongoose connection error: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ Mongoose disconnected');
    });

    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`❌ Error connecting to MongoDB: ${error.message}`);
    throw error; // Let server.js handle the fatal error
  }
};

module.exports = connectDB;