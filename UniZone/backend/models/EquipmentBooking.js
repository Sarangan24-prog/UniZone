const mongoose = require('mongoose');

const equipmentBookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  equipment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Equipment',
    required: true
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Must book at least 1 item']
  },
  bookingDate: {
    type: Date,
    required: [true, 'Booking date is required']
  },
  pickupTime: {
    type: String, // e.g., '10:00 AM'
    required: [true, 'Pickup time is required']
  },
  returnDate: {
    type: Date,
    required: [true, 'Return date is required']
  },
  returnTime: {
    type: String, // e.g., '14:00 PM'
    required: [true, 'Return time is required']
  },
  notes: {
    type: String,
    trim: true,
    maxlength: 500
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected', 'Returned'],
    default: 'Pending'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('EquipmentBooking', equipmentBookingSchema);
