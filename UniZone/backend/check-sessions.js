require('dotenv').config();
const mongoose = require('mongoose');
const AttendanceSession = require('./models/course/AttendanceSession');

async function checkSessions() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');
    
    const sessions = await AttendanceSession.find({ active: true });
    console.log('Active sessions:', JSON.stringify(sessions, null, 2));
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

checkSessions();
