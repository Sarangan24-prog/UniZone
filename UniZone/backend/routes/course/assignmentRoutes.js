const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../../middleware/auth');
const Assignment = require('../../models/course/Assignment');

// GET all assignments
router.get('/', authenticate, async (req, res) => {
  try {
    const items = await Assignment.find().populate('course', 'title code department');
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// CREATE assignment (admin/staff only)
router.post('/', authenticate, authorize('admin', 'staff'), async (req, res) => {
  try {
    const item = await Assignment.create(req.body);
    const populated = await item.populate('course', 'title code department');
    res.status(201).json(populated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// UPDATE assignment (admin/staff only)
router.put('/:id', authenticate, authorize('admin', 'staff'), async (req, res) => {
  try {
    const item = await Assignment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    }).populate('course', 'title code department');
    if (!item) return res.status(404).json({ message: 'Assignment not found' });
    res.json(item);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE assignment (admin/staff only)
router.delete('/:id', authenticate, authorize('admin', 'staff'), async (req, res) => {
  try {
    const item = await Assignment.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: 'Assignment not found' });
    res.json({ message: 'Assignment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
