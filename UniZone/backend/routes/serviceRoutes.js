const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const Service = require('../models/Service');
const serviceController = require('../controllers/serviceController');

// --- Generic Service Requests (existing) ---
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

// --- Hostel Requests ---
router.post('/hostel', authenticate, authorize('student'), serviceController.createHostelRequest);
router.get('/hostel/mine', authenticate, authorize('student'), serviceController.getMyHostelRequests);
router.get('/hostel', authenticate, authorize('admin', 'staff'), serviceController.getAllHostelRequests);
router.put('/hostel/:id', authenticate, authorize('admin', 'staff'), serviceController.updateHostelRequestStatus);

// --- ID Card Requests ---
router.post('/idcard', authenticate, authorize('student'), serviceController.createIdCardRequest);
router.get('/idcard/mine', authenticate, authorize('student'), serviceController.getMyIdCardRequests);
router.get('/idcard', authenticate, authorize('admin', 'staff'), serviceController.getAllIdCardRequests);
router.put('/idcard/:id', authenticate, authorize('admin', 'staff'), serviceController.updateIdCardRequestStatus);

// --- Certificate Requests ---
router.post('/certificate', authenticate, authorize('student'), serviceController.createCertificateRequest);
router.get('/certificate/mine', authenticate, authorize('student'), serviceController.getMyCertificateRequests);
router.get('/certificate', authenticate, authorize('admin', 'staff'), serviceController.getAllCertificateRequests);
router.put('/certificate/:id', authenticate, authorize('admin', 'staff'), serviceController.updateCertificateRequestStatus);

// --- Complaints ---
router.post('/complaint', authenticate, authorize('student'), serviceController.createComplaint);
router.get('/complaint/mine', authenticate, authorize('student'), serviceController.getMyComplaints);
router.get('/complaint', authenticate, authorize('admin', 'staff'), serviceController.getAllComplaints);
router.put('/complaint/:id', authenticate, authorize('admin', 'staff'), serviceController.updateComplaintStatus);

// --- Lost & Found ---
router.post('/lostfound', authenticate, serviceController.createLostFoundItem);
router.get('/lostfound', authenticate, serviceController.getAllLostFoundItems);
router.put('/lostfound/:id', authenticate, serviceController.updateLostFoundItemStatus);

module.exports = router;
