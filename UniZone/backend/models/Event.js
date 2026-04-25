/*const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true
  },
  dateTime: {
    type: Date,
    required: [true, 'Date and time is required']
  },
  capacity: {
    type: Number,
    required: [true, 'Capacity is required'],
    min: 1,
    default: 100
  },
  description: {
    type: String,
    trim: true
  },
  registeredUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Event', eventSchema);
*/
 const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { type: String, required: [true, 'Event title is required'], trim: true },
  location: { type: String, required: [true, 'Location is required'], trim: true },
  dateTime: { type: Date, required: [true, 'Date and time is required'] },
  capacity: { type: Number, required: [true, 'Capacity is required'], min: 1, default: 100 },
  description: { type: String, trim: true },
  registeredUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

module.exports = mongoose.model('Event', eventSchema);