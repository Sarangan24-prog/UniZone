const express = require('express');
const router = express.Router();
const {
  addEquipment,
  getAllEquipment,
  updateEquipment,
  deleteEquipment,
  createBooking,
  getAllBookings,
  getMyBookings,
  updateBookingStatus
} = require('../controllers/equipmentController');
const { authenticate, authorize } = require('../middleware/auth');

// Public or basic logged-in routes for viewing equipment
router.get('/', authenticate, getAllEquipment);

// Admin equipment management
router.post('/', authenticate, authorize('admin', 'staff'), addEquipment);
router.put('/:id', authenticate, authorize('admin', 'staff'), updateEquipment);
router.delete('/:id', authenticate, authorize('admin', 'staff'), deleteEquipment);

// Booking routes
router.post('/book', authenticate, createBooking);
router.get('/bookings/my', authenticate, getMyBookings); // students
router.get('/bookings', authenticate, authorize('admin', 'staff'), getAllBookings); // admins
router.put('/bookings/:id/status', authenticate, authorize('admin', 'staff'), updateBookingStatus);

module.exports = router;
