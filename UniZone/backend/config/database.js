const mongoose = require("mongoose");

const startMemoryMongo = async () => {
  const { MongoMemoryServer } = require('mongodb-memory-server');
  const mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  console.log(`🧠 In-memory MongoDB URI: ${uri}`);
  return uri;
};

const connectDB = async () => {
  const envUri = process.env.MONGO_URI || process.env.MONGODB_URI;
  let mongoUri = envUri;

  if (!envUri) {
    console.warn("⚠️ MONGO_URI/MONGODB_URI is missing in .env. Falling back to in-memory MongoDB.");
    mongoUri = await startMemoryMongo();
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
    console.warn(`⚠️ Primary MongoDB connection failed: ${error.message}`);

    if (envUri) {
      console.log('🧠 Falling back to in-memory MongoDB server...');
      mongoUri = await startMemoryMongo();
      const conn = await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 10000,
      });
      console.log(`✅ MongoDB Connected (in-memory): ${conn.connection.host}`);
      return conn;
    }

    console.error(`❌ Error connecting to MongoDB: ${error.message}`);
    throw error;
  }
};

module.exports = connectDB;