const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Course title is required'],
    trim: true
  },
  code: {
    type: String,
    required: [true, 'Course code is required'],
    trim: true
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
    enum: ['CSE', 'EEE', 'MECH', 'CIVIL'],
    trim: true
  },
  schedule: {
    type: String,
    trim: true
  },
  capacity: {
    type: Number,
    required: [true, 'Capacity is required'],
    min: 1,
    default: 50
  },
  description: {
    type: String,
    trim: true
  },
  enrolledStudents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Course', courseSchema);
