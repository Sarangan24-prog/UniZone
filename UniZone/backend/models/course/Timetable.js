const mongoose = require('mongoose');

const timetableSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Course is required']
  },
  day: {
    type: String,
    required: [true, 'Day is required'],
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  },
  startTime: {
    type: String,
    required: [true, 'Start time is required'],
    trim: true
  },
  endTime: {
    type: String,
    required: [true, 'End time is required'],
    trim: true
  },
  room: {
    type: String,
    required: [true, 'Room is required'],
    trim: true
  },
  instructor: {
    type: String,
    required: [true, 'Instructor name is required'],
    trim: true
  },
  type: {
    type: String,
    enum: ['Lecture', 'Lab', 'Tutorial', 'Seminar'],
    default: 'Lecture'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Timetable', timetableSchema);
