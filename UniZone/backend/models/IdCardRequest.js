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
    enum: ['New', 'Lost']
  },
  fullName: { type: String, required: true },
  studentId: { type: String }, // Optional for 'New', required for 'Lost' (validated on frontend)
  department: { type: String },
  batch: { type: String },
  phone: { type: String },
  nicNumber: { type: String },
  lossDate: { type: Date },
  lossLocation: { type: String },
  attachment: { type: String }, // Path to Pic or PDF
  status: {
    type: String,
    enum: ['open', 'in_progress', 'completed', 'rejected'],
    default: 'open'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('IdCardRequest', idCardRequestSchema);
