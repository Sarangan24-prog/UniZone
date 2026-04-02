const mongoose = require('mongoose');

const hostelRequestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  roomType: {
    type: String,
    required: [true, 'Room type is required'],
    enum: ['Single', 'Double', 'Shared']
  },
  duration: {
    type: Number,
    required: [true, 'Duration (in semesters) is required'],
    min: [1, 'Duration must be at least 1 semester'],
    max: [8, 'Duration cannot exceed 8 semesters']
  },
  status: {
    type: String,
    enum: ['open', 'approved', 'rejected'],
    default: 'open'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('HostelRequest', hostelRequestSchema);
