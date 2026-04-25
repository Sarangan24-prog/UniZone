const HostelRequest = require('../models/HostelRequest');
const IdCardRequest = require('../models/IdCardRequest');
const CertificateRequest = require('../models/CertificateRequest');
const Complaint = require('../models/Complaint');
const LostFoundItem = require('../models/LostFoundItem');
const {
  notifyAdminsOfServiceSubmission,
  notifyStudentOfServiceStatusUpdate,
} = require('../utils/serviceNotificationEmail');

// Helper wrapper for try-catch
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// --- Hostel Requests ---
exports.createHostelRequest = asyncHandler(async (req, res) => {
  const request = await HostelRequest.create({ ...req.body, userId: req.user._id });
  try {
    await notifyAdminsOfServiceSubmission({
      serviceType: 'Hostel',
      requestDoc: request.toObject ? request.toObject() : request,
      student: req.user,
    });
  } catch (emailErr) {
    console.error('Hostel notification email failed:', emailErr.message);
  }
  res.status(201).json(request);
});
exports.getMyHostelRequests = asyncHandler(async (req, res) => {
  const requests = await HostelRequest.find({ userId: req.user._id }).sort('-createdAt');
  res.json(requests);
});
exports.getAllHostelRequests = asyncHandler(async (req, res) => {
  const requests = await HostelRequest.find().populate('userId', 'name email').sort('-createdAt');
  res.json(requests);
});
exports.updateHostelRequestStatus = asyncHandler(async (req, res) => {
  const request = await HostelRequest.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    .populate('userId', 'name email');
  if (!request) return res.status(404).json({ message: 'Request not found' });
  try {
    await notifyStudentOfServiceStatusUpdate({
      serviceType: 'Hostel',
      requestDoc: request.toObject ? request.toObject() : request,
      updatedBy: req.user,
    });
  } catch (emailErr) {
    console.error('Hostel status email failed:', emailErr.message);
  }
  res.json(request);
});

// --- ID Card Requests ---
exports.createIdCardRequest = asyncHandler(async (req, res) => {
  const request = await IdCardRequest.create({ 
    ...req.body, 
    userId: req.user._id,
    attachment: req.file ? `/uploads/id-cards/${req.file.filename}` : undefined
  });
  try {
    await notifyAdminsOfServiceSubmission({
      serviceType: 'ID Card',
      requestDoc: request.toObject ? request.toObject() : request,
      student: req.user,
    });
  } catch (emailErr) {
    console.error('ID Card notification email failed:', emailErr.message);
  }
  res.status(201).json(request);
});
exports.getMyIdCardRequests = asyncHandler(async (req, res) => {
  const requests = await IdCardRequest.find({ userId: req.user._id }).sort('-createdAt');
  res.json(requests);
});
exports.getAllIdCardRequests = asyncHandler(async (req, res) => {
  const requests = await IdCardRequest.find().populate('userId', 'name email').sort('-createdAt');
  res.json(requests);
});
exports.updateIdCardRequestStatus = asyncHandler(async (req, res) => {
  const request = await IdCardRequest.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    .populate('userId', 'name email');
  if (!request) return res.status(404).json({ message: 'Request not found' });
  try {
    await notifyStudentOfServiceStatusUpdate({
      serviceType: 'ID Card',
      requestDoc: request.toObject ? request.toObject() : request,
      updatedBy: req.user,
    });
  } catch (emailErr) {
    console.error('ID Card status email failed:', emailErr.message);
  }
  res.json(request);
});

// --- Certificate Requests ---
exports.createCertificateRequest = asyncHandler(async (req, res) => {
  const request = await CertificateRequest.create({ ...req.body, userId: req.user._id });
  try {
    await notifyAdminsOfServiceSubmission({
      serviceType: 'Certificate',
      requestDoc: request.toObject ? request.toObject() : request,
      student: req.user,
    });
  } catch (emailErr) {
    console.error('Certificate notification email failed:', emailErr.message);
  }
  res.status(201).json(request);
});
exports.getMyCertificateRequests = asyncHandler(async (req, res) => {
  const requests = await CertificateRequest.find({ userId: req.user._id }).sort('-createdAt');
  res.json(requests);
});
exports.getAllCertificateRequests = asyncHandler(async (req, res) => {
  const requests = await CertificateRequest.find().populate('userId', 'name email').sort('-createdAt');
  res.json(requests);
});
exports.updateCertificateRequestStatus = asyncHandler(async (req, res) => {
  const request = await CertificateRequest.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    .populate('userId', 'name email');
  if (!request) return res.status(404).json({ message: 'Request not found' });
  try {
    await notifyStudentOfServiceStatusUpdate({
      serviceType: 'Certificate',
      requestDoc: request.toObject ? request.toObject() : request,
      updatedBy: req.user,
    });
  } catch (emailErr) {
    console.error('Certificate status email failed:', emailErr.message);
  }
  res.json(request);
});

// --- Complaints ---
exports.createComplaint = asyncHandler(async (req, res) => {
  const request = await Complaint.create({ ...req.body, userId: req.user._id });
  try {
    await notifyAdminsOfServiceSubmission({
      serviceType: 'Complaint',
      requestDoc: request.toObject ? request.toObject() : request,
      student: req.user,
    });
  } catch (emailErr) {
    console.error('Complaint notification email failed:', emailErr.message);
  }
  res.status(201).json(request);
});
exports.getMyComplaints = asyncHandler(async (req, res) => {
  const requests = await Complaint.find({ userId: req.user._id }).sort('-createdAt');
  res.json(requests);
});
exports.getAllComplaints = asyncHandler(async (req, res) => {
  const requests = await Complaint.find().populate('userId', 'name email').sort('-createdAt');
  res.json(requests);
});
exports.updateComplaintStatus = asyncHandler(async (req, res) => {
  const request = await Complaint.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    .populate('userId', 'name email');
  if (!request) return res.status(404).json({ message: 'Complaint not found' });
  try {
    await notifyStudentOfServiceStatusUpdate({
      serviceType: 'Complaint',
      requestDoc: request.toObject ? request.toObject() : request,
      updatedBy: req.user,
    });
  } catch (emailErr) {
    console.error('Complaint status email failed:', emailErr.message);
  }
  res.json(request);
});

// --- Lost & Found ---
exports.createLostFoundItem = asyncHandler(async (req, res) => {
  const item = await LostFoundItem.create({ ...req.body, userId: req.user._id });
  try {
    await notifyAdminsOfServiceSubmission({
      serviceType: 'Lost & Found',
      requestDoc: item.toObject ? item.toObject() : item,
      student: req.user,
    });
  } catch (emailErr) {
    console.error('Lost & Found notification email failed:', emailErr.message);
  }
  res.status(201).json(item);
});
exports.getAllLostFoundItems = asyncHandler(async (req, res) => {
  // Everyone (students) can see these
  const items = await LostFoundItem.find().populate('userId', 'name email').sort('-createdAt');
  res.json(items);
});
exports.updateLostFoundItemStatus = asyncHandler(async (req, res) => {
  const item = await LostFoundItem.findOneAndUpdate(
    { _id: req.params.id, $or: [{ userId: req.user._id }, { userId: { $exists: true } }] }, // Authorize logic should ideally be in route or controller 
    req.body, 
    { new: true, runValidators: true }
  ).populate('userId', 'name email');
  if (!item) return res.status(404).json({ message: 'Item not found' });
  if (['admin', 'staff'].includes(req.user?.role)) {
    try {
      await notifyStudentOfServiceStatusUpdate({
        serviceType: 'Lost & Found',
        requestDoc: item.toObject ? item.toObject() : item,
        updatedBy: req.user,
      });
    } catch (emailErr) {
      console.error('Lost & Found status email failed:', emailErr.message);
    }
  }
  res.json(item);
});
