require('dotenv').config();
const mongoose = require('mongoose');
const AttendanceSession = require('./models/course/AttendanceSession');

async function endAllSessions() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');
    
    const result = await AttendanceSession.updateMany(
      { active: true },
      { active: false }
    );
    
    console.log(`Ended ${result.modifiedCount} stale sessions`);
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

endAllSessions();
