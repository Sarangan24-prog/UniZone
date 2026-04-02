const mongoose = require('mongoose');

const idCardRequestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reason: {
    type: String,
    required: [true, 'Reason for application is required'],
    enum: ['New', 'Lost', 'Damaged']
  },
  bloodGroup: {
    type: String,
    required: [true, 'Blood group is required'],
    enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
  },
  status: {
    type: String,
    enum: ['open', 'in_progress', 'completed', 'rejected'],
    default: 'open'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('IdCardRequest', idCardRequestSchema);
