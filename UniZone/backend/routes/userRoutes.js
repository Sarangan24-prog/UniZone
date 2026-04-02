const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const User = require('../models/User');

// Get all users (admin/staff only)
router.get('/', authenticate, authorize('admin', 'staff'), async (req, res) => {
  try {
    const users = await User.find().select('name email role').lean();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
