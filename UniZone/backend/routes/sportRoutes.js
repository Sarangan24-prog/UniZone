const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const Sport = require('../models/Sport');
const Notification = require('../models/Notification');
const User = require('../models/User');

// Get all sports
router.get('/', authenticate, async (req, res) => {
  try {
    const sports = await Sport.find().populate('players', 'name email');
    res.json(sports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create sport
router.post('/', authenticate, authorize('admin', 'staff'), async (req, res) => {
  try {
    const sport = await Sport.create(req.body);
    res.status(201).json(sport);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update sport
router.put('/:id', authenticate, authorize('admin', 'staff'), async (req, res) => {
  try {
    const sport = await Sport.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!sport) return res.status(404).json({ message: 'Sport not found' });
    res.json(sport);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete sport
router.delete('/:id', authenticate, authorize('admin', 'staff'), async (req, res) => {
  try {
    const sport = await Sport.findByIdAndDelete(req.params.id);
    if (!sport) return res.status(404).json({ message: 'Sport not found' });
    res.json({ message: 'Sport deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Join sport
router.post('/:id/join', authenticate, authorize('student', 'admin', 'staff'), async (req, res) => {
  try {
    const sport = await Sport.findById(req.params.id);
    if (!sport) return res.status(404).json({ message: 'Sport not found' });

    if (sport.players.some(id => id.toString() === req.user._id.toString())) {
      return res.status(400).json({ message: 'Already joined this sport' });
    }

    if (sport.players.length >= sport.maxPlayers) {
      return res.status(400).json({ message: 'Sport team is full' });
    }
    sport.players.push(req.user._id);
    await sport.save();

    // Create notifications for all admin/staff
    try {
      const admins = await User.find({ role: { $in: ['admin', 'staff'] } });
      const notificationPromises = admins.map(admin => {
        return Notification.create({
          recipient: admin._id,
          sender: req.user._id,
          type: 'JoinSport',
          message: `${req.user.name} has joined the sport: ${sport.name}`,
          relatedId: sport._id
        });
      });
      await Promise.all(notificationPromises);
    } catch (notifyError) {
      console.error('Failed to create join notifications:', notifyError);
      // Don't fail the join action if notifications fail
    }

    const updated = await Sport.findById(req.params.id).populate('players', 'name email');
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Leave sport
router.post('/:id/leave', authenticate, authorize('student', 'admin', 'staff'), async (req, res) => {
  try {
    const sport = await Sport.findById(req.params.id);
    if (!sport) return res.status(404).json({ message: 'Sport not found' });

    sport.players = sport.players.filter(id => id.toString() !== req.user._id.toString());
    await sport.save();
    const updated = await Sport.findById(req.params.id).populate('players', 'name email');
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Register player by admin/staff
router.post('/:id/register', authenticate, authorize('admin', 'staff'), async (req, res) => {
  try {
    const { studentId, role, jerseyNumber, notes } = req.body;
    if (!studentId) return res.status(400).json({ message: 'Student is required' });
    if (!role) return res.status(400).json({ message: 'Player role is required' });

    const sport = await Sport.findById(req.params.id);
    if (!sport) return res.status(404).json({ message: 'Sport not found' });

    const currentPlayers = sport.players.length;
    if (currentPlayers >= sport.maxPlayers) {
      return res.status(400).json({ message: 'Sport team is full' });
    }

    if (sport.players.some(id => id.toString() === studentId.toString())) {
      return res.status(400).json({ message: 'Student is already registered for this sport' });
    }

    const User = require('../models/User');
    const student = await User.findById(studentId);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    if (student.role !== 'student') {
      return res.status(400).json({ message: 'Only students can be registered for sport teams' });
    }

    sport.players.push(student._id);
    sport.playerRegistrations = sport.playerRegistrations || [];
    sport.playerRegistrations.push({
      player: student._id,
      role,
      jerseyNumber: jerseyNumber ? Number(jerseyNumber) : undefined,
      notes: notes ? notes.trim() : undefined
    });

    await sport.save();

    const updatedSport = await Sport.findById(req.params.id).populate('players', 'name email');
    res.json(updatedSport);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
