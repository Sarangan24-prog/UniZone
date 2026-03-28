const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../../middleware/auth');
const Attendance = require('../models/Attendance');
const User = require('../../models/User');

// GET attendance records — admin sees all, student sees own
router.get('/', authenticate, async (req, res) => {
  try {
    const filter = req.user.role === 'student' ? { student: req.user._id } : {};
    const items = await Attendance.find(filter)
      .populate('course', 'title code department')
      .populate('student', 'name email')
      .populate('markedBy', 'name')
      .sort({ date: -1 });
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET attendance stats per course
router.get('/stats/:courseId', authenticate, async (req, res) => {
  try {
    const filter = { course: req.params.courseId };
    if (req.user.role === 'student') filter.student = req.user._id;

    const records = await Attendance.find(filter)
      .populate('student', 'name email');

    const total = records.length;
    const present = records.filter(r => r.status === 'Present').length;
    const absent = records.filter(r => r.status === 'Absent').length;
    const late = records.filter(r => r.status === 'Late').length;
    const percentage = total > 0 ? Math.round(((present + late) / total) * 100) : 0;

    res.json({ total, present, absent, late, percentage, records });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET students list (for attendance marking dropdown)
router.get('/students', authenticate, authorize('admin', 'staff'), async (req, res) => {
  try {
    const students = await User.find({ role: 'student' }).select('name email');
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// MARK attendance (admin/staff only)
router.post('/', authenticate, authorize('admin', 'staff'), async (req, res) => {
  try {
    const data = { ...req.body, markedBy: req.user._id };
    const item = await Attendance.create(data);
    const populated = await item.populate([
      { path: 'course', select: 'title code department' },
      { path: 'student', select: 'name email' },
      { path: 'markedBy', select: 'name' }
    ]);
    res.status(201).json(populated);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Attendance already marked for this student on this date' });
    }
    res.status(400).json({ message: error.message });
  }
});

// DELETE attendance record (admin/staff only)
router.delete('/:id', authenticate, authorize('admin', 'staff'), async (req, res) => {
  try {
    const item = await Attendance.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: 'Record not found' });
    res.json({ message: 'Attendance record deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
