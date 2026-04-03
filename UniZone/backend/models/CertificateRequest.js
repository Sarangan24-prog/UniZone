const mongoose = require('mongoose');

const certificateRequestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    required: [true, 'Certificate type is required'],
    enum: ['Transcript', 'Bonafide', 'Conduct', 'Other']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [200, 'Description cannot exceed 200 characters']
  },
  status: {
    type: String,
    enum: ['open', 'in_progress', 'completed', 'rejected'],
    default: 'open'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('CertificateRequest', certificateRequestSchema);
