const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../../middleware/auth');
const Timetable = require('../models/Timetable');

// GET all timetable entries
router.get('/', authenticate, async (req, res) => {
  try {
    const entries = await Timetable.find().populate('course', 'title code department');
    res.json(entries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// CREATE timetable entry (admin/staff only)
router.post('/', authenticate, authorize('admin', 'staff'), async (req, res) => {
  try {
    const entry = await Timetable.create(req.body);
    const populated = await entry.populate('course', 'title code department');
    res.status(201).json(populated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// UPDATE timetable entry (admin/staff only)
router.put('/:id', authenticate, authorize('admin', 'staff'), async (req, res) => {
  try {
    const entry = await Timetable.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('course', 'title code department');
    if (!entry) return res.status(404).json({ message: 'Entry not found' });
    res.json(entry);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE timetable entry (admin/staff only)
router.delete('/:id', authenticate, authorize('admin', 'staff'), async (req, res) => {
  try {
    const entry = await Timetable.findByIdAndDelete(req.params.id);
    if (!entry) return res.status(404).json({ message: 'Entry not found' });
    res.json({ message: 'Timetable entry deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
