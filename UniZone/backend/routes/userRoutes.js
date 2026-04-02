const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { authenticate, authorize } = require('../middleware/auth');
const User = require('../models/User');
const { updateProfilePic } = require('../controllers/userController');

// Multer config for avatars
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/avatars');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `avatar-${req.user._id}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (mimetype && extname) return cb(null, true);
    cb(new Error("Only images are allowed"));
  }
});

// Get all users (admin/staff only)
router.get('/', authenticate, authorize('admin', 'staff'), async (req, res) => {
  try {
    const users = await User.find().select('name email role profilePic').lean();
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update profile pic
router.post('/profile-pic', authenticate, upload.single('avatar'), updateProfilePic);

module.exports = router;
