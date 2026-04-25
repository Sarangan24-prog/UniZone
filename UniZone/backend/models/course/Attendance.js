const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Course is required']
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  date: {
    type: Date,
    required: [true, 'Date is required']
  },
  status: {
    type: String,
    enum: ['Present', 'Absent', 'Late'],
    default: 'Present'
  },
  markedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  regNo: {
    type: String,
    required: [true, 'Registration number is required']
  },
  studentName: {
    type: String,
    required: [true, 'Student name is required']
  },
  sessionId: {
    type: String
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate attendance entries using regNo instead of student id
attendanceSchema.index({ course: 1, regNo: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
