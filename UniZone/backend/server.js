const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/database");

// Environment variable validation
const requiredEnvVars = ["MONGODB_URI", "JWT_SECRET", "ROLE_CREATE_KEY"];
requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    console.warn(`⚠️ Warning: Missing environment variable ${envVar}. Some features may fail.`);
  }
});

// Import routes
const authRoutes = require("./routes/authRoutes");
const courseRoutes = require("./routes/courseRoutes");
const eventRoutes = require("./routes/eventRoutes");
const sportRoutes = require("./routes/sportRoutes");
const serviceRoutes = require("./routes/serviceRoutes");
const timetableRoutes = require("./routes/course/timetableRoutes");
const assignmentRoutes = require("./routes/course/assignmentRoutes");
const studyMaterialRoutes = require("./routes/course/studyMaterialRoutes");
const announcementRoutes = require("./routes/course/announcementRoutes");
const attendanceRoutes = require("./routes/course/attendanceRoutes");
const userRoutes = require('./routes/userRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const equipmentRoutes = require('./routes/equipmentRoutes');

const path = require("path");
const fs = require("fs");

const app = express();
const PORT = process.env.PORT || 3000;

// Ensure upload directories exist
const uploadDirs = ['uploads', 'uploads/id-cards', 'uploads/avatars'];
uploadDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/sports", sportRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/timetable", timetableRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/materials", studyMaterialRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use('/api/users', userRoutes);
app.use('/api/equipment', equipmentRoutes);
app.use('/api/categories', categoryRoutes);

// Test route to verify server registration
app.get('/api/test-users', (req, res) => res.json({ message: "User routes are accessible" }));
// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "UniZone API is running",
    timestamp: new Date().toISOString(),
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ 
    message: err.message || "Something went wrong!",
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n👋 Shutting down UniZone Backend...');
  const mongoose = require('mongoose');
  try {
    await mongoose.connection.close();
    console.log('✅ MongoDB connection closed.');
  } catch (err) {
    console.error('❌ Error during database closure:', err.message);
  }
  process.exit(0);
});

const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`\n🚀 UniZone Backend Server`);
      console.log(`📡 Running on http://localhost:${PORT}`);
      console.log(`🔗 API available at http://localhost:${PORT}/api`);
      console.log(`✅ Ready to accept connections!\n`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();