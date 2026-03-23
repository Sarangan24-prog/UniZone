const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const Event = require('../models/Event');

// Get all events
router.get('/', authenticate, async (req, res) => {
  try {
    const events = await Event.find().populate('registeredUsers', 'name email');
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create event
router.post('/', authenticate, authorize('admin', 'staff'), async (req, res) => {
  try {
    // Ensure dateTime is a valid date object if passed as string
    if (req.body.dateTime && typeof req.body.dateTime === 'string') {
      req.body.dateTime = new Date(req.body.dateTime);
    }
    const event = await Event.create(req.body);
    res.status(201).json(event);
  } catch (error) {
    console.error('Event create error:', error);
    res.status(400).json({ message: error.message });
  }
});

// Update event
router.put('/:id', authenticate, authorize('admin', 'staff'), async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json(event);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete event
router.delete('/:id', authenticate, authorize('admin', 'staff'), async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Register for event
router.post('/:id/register', authenticate, authorize('student'), async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    if (event.registeredUsers.some(id => id.toString() === req.user._id.toString())) {
      return res.status(400).json({ message: 'Already registered for this event' });
    }

    if (event.registeredUsers.length >= event.capacity) {
      return res.status(400).json({ message: 'Event is full' });
    }
    event.registeredUsers.push(req.user._id);
    await event.save();
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Unregister from event
router.post('/:id/unregister', authenticate, authorize('student'), async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    event.registeredUsers = event.registeredUsers.filter(id => id.toString() !== req.user._id.toString());
    await event.save();
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
