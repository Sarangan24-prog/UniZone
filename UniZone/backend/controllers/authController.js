const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// Register
exports.register = async (req, res) => {
  try {
    const { name, email, password, role = 'student', roleCreateKey } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Role validation - for admin/staff, require roleCreateKey
    if ((role === 'admin' || role === 'staff') && !roleCreateKey) {
      return res.status(400).json({ message: 'Role create key required for admin/staff registration' });
    }

    // In production, validate roleCreateKey against environment variable

    if ((role === 'admin' || role === 'staff') && roleCreateKey !== process.env.ROLE_CREATE_KEY) {
      return res.status(400).json({ message: 'Invalid role create key' });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role
    });

    const token = generateToken(user._id);

    res.status(201).json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePic: user.profilePic
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Find user and include password for comparison
    const user = await User.findOne({ email: normalizedEmail }).select('+password');
    if (!user) {
      console.log(`🔍 Login failed: User not found for ${normalizedEmail}`);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log(`🔍 Login failed: Password mismatch for ${normalizedEmail}`);
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user._id);

    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profilePic: user.profilePic
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
