const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../../middleware/auth');
const StudyMaterial = require('../models/StudyMaterial');

// GET all study materials
router.get('/', authenticate, async (req, res) => {
  try {
    const items = await StudyMaterial.find()
      .populate('course', 'title code department')
      .populate('uploadedBy', 'name');
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// CREATE study material (admin/staff only)
router.post('/', authenticate, authorize('admin', 'staff'), async (req, res) => {
  try {
    const data = { ...req.body, uploadedBy: req.user._id };
    const item = await StudyMaterial.create(data);
    const populated = await item.populate([
      { path: 'course', select: 'title code department' },
      { path: 'uploadedBy', select: 'name' }
    ]);
    res.status(201).json(populated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// UPDATE study material (admin/staff only)
router.put('/:id', authenticate, authorize('admin', 'staff'), async (req, res) => {
  try {
    const item = await StudyMaterial.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate([
      { path: 'course', select: 'title code department' },
      { path: 'uploadedBy', select: 'name' }
    ]);
    if (!item) return res.status(404).json({ message: 'Material not found' });
    res.json(item);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE study material (admin/staff only)
router.delete('/:id', authenticate, authorize('admin', 'staff'), async (req, res) => {
  try {
    const item = await StudyMaterial.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: 'Material not found' });
    res.json({ message: 'Study material deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
