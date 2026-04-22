const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../../middleware/auth');
const Attendance = require('../../models/course/Attendance');
const User = require('../../models/User');
const AttendanceSession = require('../../models/course/AttendanceSession');

// --- SESSIONS ---

// GET active sessions
router.get('/sessions/active', authenticate, async (req, res) => {
  try {
    const sessions = await AttendanceSession.find({ active: true })
      .populate('course', 'title code department')
      .populate('createdBy', 'name');
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// CREATE session (admin/staff only)
router.post('/sessions', authenticate, authorize('admin', 'staff'), async (req, res) => {
  try {
    const { courseId, date, sessionId } = req.body;
    const session = await AttendanceSession.create({
      course: courseId,
      date,
      sessionId,
      createdBy: req.user._id
    });
    res.status(201).json(session);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// END session
router.patch('/sessions/:id/end', authenticate, authorize('admin', 'staff'), async (req, res) => {
  try {
    const session = await AttendanceSession.findByIdAndUpdate(
      req.params.id,
      { active: false },
      { new: true }
    );
    if (!session) return res.status(404).json({ message: 'Session not found' });
    res.json(session);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// --- ATTENDANCE ---
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

// STUDENT scans QR to mark attendance
router.post('/scan', authenticate, async (req, res) => {
  try {
    if (req.user.role !== 'student') {
      return res.status(403).json({ message: 'Only students can mark attendance via scan' });
    }

    const { courseId, date, sessionId, regNo, studentName } = req.body;
    
    // Create attendance record
    const item = await Attendance.create({
      course: courseId,
      student: req.user._id,
      date,
      status: 'Present',
      markedBy: req.user._id,
      regNo,
      studentName
    });

    const populated = await item.populate([
      { path: 'course', select: 'title code department' },
      { path: 'student', select: 'name email' }
    ]);
    res.status(201).json(populated);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'You have already marked your attendance for this session' });
    }
    res.status(400).json({ message: error.message });
  }
});

// GET local IP for QR codes
router.get('/config/ip', authenticate, (req, res) => {
  const os = require('os');
  const networkInterfaces = os.networkInterfaces();
  let ip = 'localhost';
  
  for (const interfaceName in networkInterfaces) {
    const interfaces = networkInterfaces[interfaceName];
    for (const iface of interfaces) {
      if (iface.family === 'IPv4' && !iface.internal) {
        ip = iface.address;
        break;
      }
    }
    if (ip !== 'localhost') break;
  }
  
  res.json({ ip });
});

module.exports = router;
