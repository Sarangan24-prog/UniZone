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
      .populate('createdBy', 'name')
      .lean();
    
    // Add count for each session
    const sessionsWithCount = await Promise.all(sessions.map(async (session) => {
      const count = await Attendance.countDocuments({ sessionId: session.sessionId });
      return { ...session, attendeeCount: count };
    }));
    
    res.json(sessionsWithCount);
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
    let filter = {};
    if (req.user.role === 'student') {
      filter = { 
        $or: [
          { student: req.user._id },
          ...(req.user.regNo ? [{ regNo: new RegExp('^' + req.user.regNo + '$', 'i') }] : [])
        ]
      };
    }
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

// PUBLIC: Student scans QR to mark attendance (no login required)
router.post('/scan/public', async (req, res) => {
  try {
    const { courseId, date, sessionId, regNo, studentName } = req.body;

    if (!sessionId || !courseId || !regNo || !studentName) {
      return res.status(400).json({ message: 'Missing required fields.' });
    }

    // Verify session is still active
    const session = await AttendanceSession.findOne({ sessionId, active: true });
    if (!session) {
      return res.status(400).json({ message: 'This attendance session has expired or is no longer active.' });
    }

    // Check if attendance already marked for this session + regNo
    const existing = await Attendance.findOne({ sessionId, regNo });
    if (existing) {
      return res.status(400).json({ message: 'Attendance already marked for this session.' });
    }

    // Try to link to a registered student account if the regNo matches
    const studentUser = await User.findOne({ regNo: new RegExp('^' + regNo + '$', 'i') });

    const item = await Attendance.create({
      course: courseId,
      date,
      status: 'Present',
      markedBy: session.createdBy,
      regNo,
      studentName,
      sessionId,
      ...(studentUser && { student: studentUser._id })
    });

    const populated = await item.populate('course', 'title code department');
    res.status(201).json({ message: 'Attendance marked successfully!', record: populated });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// STUDENT scans QR to mark attendance (authenticated)
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
  
  // Create a priority order for interfaces: Wi-Fi first, then Ethernet. Avoid VMs.
  const interfaceNames = Object.keys(networkInterfaces);
  
  // Sort interfaces to prioritize 'Wi-Fi' or 'wlan' over others
  interfaceNames.sort((a, b) => {
    const isAWifi = a.toLowerCase().includes('wi-fi') || a.toLowerCase().includes('wlan') || a.toLowerCase().includes('wireless');
    const isBWifi = b.toLowerCase().includes('wi-fi') || b.toLowerCase().includes('wlan') || b.toLowerCase().includes('wireless');
    if (isAWifi && !isBWifi) return -1;
    if (!isAWifi && isBWifi) return 1;
    return 0;
  });

  for (const interfaceName of interfaceNames) {
    const interfaces = networkInterfaces[interfaceName];
    // Skip virtual/host-only adapters mapping to VMs or WSL
    if (interfaceName.toLowerCase().includes('virtual') || 
        interfaceName.toLowerCase().includes('veth') ||
        interfaceName.toLowerCase().includes('wsl') ||
        interfaceName.toLowerCase().includes('hyper-v') ||
        interfaceName.toLowerCase().includes('vmware') ||
        interfaceName.toLowerCase().includes('docker')) {
      continue;
    }
    for (const iface of interfaces) {
      if (iface.family === 'IPv4' && !iface.internal) {
        ip = iface.address;
        break;
      }
    }
    // If we confidently found an IP (especially from prioritized Wi-Fi), break
    if (ip !== 'localhost') break;
  }
  
  res.json({ ip });
});

module.exports = router;
