const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
require('dotenv').config();

async function test() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB");

  // Find a student
  const student = await User.findOne({ role: 'student' });
  if (!student) {
    console.log("No student found");
    process.exit(1);
  }

  console.log("Found student:", student.email);

  // Generate token
  const token = jwt.sign({ id: student._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

  // Use fetch to get active sessions
  const res = await fetch("http://localhost:3000/api/attendance/sessions/active", {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });

  const body = await res.text();
  console.log("Status:", res.status);
  console.log("Response:", body);

  process.exit(0);
}

test().catch(console.error);
