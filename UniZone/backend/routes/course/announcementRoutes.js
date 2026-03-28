const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../../middleware/auth');
const Announcement = require('../models/Announcement');

// GET all announcements
router.get('/', authenticate, async (req, res) => {
  try {
    const items = await Announcement.find()
      .populate('postedBy', 'name')
      .sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// CREATE announcement (admin/staff only)
router.post('/', authenticate, authorize('admin', 'staff'), async (req, res) => {
  try {
    const data = { ...req.body, postedBy: req.user._id };
    const item = await Announcement.create(data);
    const populated = await item.populate('postedBy', 'name');
    res.status(201).json(populated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// UPDATE announcement (admin/staff only)
router.put('/:id', authenticate, authorize('admin', 'staff'), async (req, res) => {
  try {
    const item = await Announcement.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('postedBy', 'name');
    if (!item) return res.status(404).json({ message: 'Announcement not found' });
    res.json(item);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE announcement (admin/staff only)
router.delete('/:id', authenticate, authorize('admin', 'staff'), async (req, res) => {
  try {
    const item = await Announcement.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: 'Announcement not found' });
    res.json({ message: 'Announcement deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
