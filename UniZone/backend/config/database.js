const mongoose = require("mongoose");

const connectDB = async () => {
  if (!process.env.MONGO_URI) {
    console.error("❌ MONGO_URI is missing in .env");
    process.exit(1);
  }

  try {
    let mongoUri = process.env.MONGO_URI;
    let conn;

    const connectToUri = async (uri) => {
      return mongoose.connect(uri, {
        serverSelectionTimeoutMS: 10000,
      });
    };

    try {
      conn = await connectToUri(mongoUri);
    } catch (firstErr) {
      console.warn(`⚠️ Primary MongoDB connection failed: ${firstErr.message}`);

      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongoServer = await MongoMemoryServer.create();
      mongoUri = mongoServer.getUri();
      console.log(`🧠 Falling back to in-memory MongoDB (${mongoUri})`);

      conn = await connectToUri(mongoUri);
    }

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

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`❌ Error connecting to MongoDB: ${error.message}`);
    throw error; // Let server.js handle the fatal error
  }
};

module.exports = connectDB;