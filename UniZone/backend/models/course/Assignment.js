const mongoose = require('mongoose');

const assignmentSchema = new mongoose.Schema({
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Course is required']
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  dueDate: {
    type: Date,
    required: [true, 'Due date is required']
  },
  totalMarks: {
    type: Number,
    required: [true, 'Total marks is required'],
    min: 1
  },
  attachments: [{
    name: String,
    size: Number,
    type: { type: String },
    data: String,
  }],
  status: {
    type: String,
    enum: ['Active', 'Closed'],
    default: 'Active'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Assignment', assignmentSchema);
