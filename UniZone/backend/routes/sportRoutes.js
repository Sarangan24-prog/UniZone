const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const Sport = require('../models/Sport');

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
    res.json(sport);
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
    res.json(sport);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
