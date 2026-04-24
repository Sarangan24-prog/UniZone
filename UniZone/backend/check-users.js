require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const checkUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    const users = await User.find({}, 'name email role');
    console.log('\n--- Registered Users ---');
    if (users.length === 0) {
      console.log('No users found in database.');
    } else {
      users.forEach(u => {
        console.log(`- ${u.name} (${u.email}) [${u.role}]`);
      });
    }
    console.log('------------------------\n');
    
    await mongoose.connection.close();
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
};

checkUsers();
