require('dotenv').config();
const mongoose = require('mongoose');

async function fixIndex() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');
    
    // Drop the old index that causes E11000 with student: null
    const collection = mongoose.connection.collection('attendances');
    await collection.dropIndex('course_1_student_1_date_1');
    console.log('Successfully dropped old faulty index');
  } catch (err) {
    if (err.codeName === 'IndexNotFound') {
      console.log('Index was already dropped or not found');
    } else {
      console.error('Error dropping index:', err);
    }
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

fixIndex();
