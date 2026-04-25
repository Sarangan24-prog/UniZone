const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const Service = require('../models/Service');
const serviceController = require('../controllers/serviceController');
const {
  notifyAdminsOfServiceSubmission,
  notifyStudentOfServiceStatusUpdate,
} = require('../utils/serviceNotificationEmail');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/id-cards');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `id-card-${req.user._id}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const ext = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mime = allowedTypes.test(file.mimetype);
    if (ext && mime) return cb(null, true);
    cb(new Error('Only .jpeg, .jpg, .png and .pdf formats allowed!'));
  }
});

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
    try {
      await notifyAdminsOfServiceSubmission({
        serviceType: 'General Service',
        requestDoc: service.toObject ? service.toObject() : service,
        student: req.user,
      });
    } catch (emailErr) {
      console.error('General service notification email failed:', emailErr.message);
    }
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
    ).populate('userId', 'name email');
    if (!service) return res.status(404).json({ message: 'Service request not found' });
    try {
      await notifyStudentOfServiceStatusUpdate({
        serviceType: 'General Service',
        requestDoc: service.toObject ? service.toObject() : service,
        updatedBy: req.user,
      });
    } catch (emailErr) {
      console.error('General service status email failed:', emailErr.message);
    }
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
router.post('/idcard', authenticate, authorize('student'), upload.single('attachment'), serviceController.createIdCardRequest);
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
