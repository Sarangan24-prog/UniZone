const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const Service = require('../models/Service');

// Get all services (admin/staff)
router.get('/', authenticate, authorize('admin', 'staff'), async (req, res) => {
  try {
    const services = await Service.find().populate('userId', 'name email');
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get my services (student)
router.get('/mine', authenticate, authorize('student'), async (req, res) => {
  try {
    const services = await Service.find({ userId: req.user._id });
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create service request
router.post('/', authenticate, authorize('student'), async (req, res) => {
  try {
    const service = await Service.create({
      ...req.body,
      userId: req.user._id
    });
    res.status(201).json(service);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update service request status
router.put('/:id', authenticate, authorize('admin', 'staff'), async (req, res) => {
  try {
    const service = await Service.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!service) return res.status(404).json({ message: 'Service request not found' });
    res.json(service);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
