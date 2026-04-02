const mongoose = require('mongoose');

const equipmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Equipment name is required'],
    trim: true,
    unique: true
  },
  sportCategory: {
    type: String,
    required: [true, 'Sport category is required'],
    trim: true
  },
  totalQuantity: {
    type: Number,
    required: [true, 'Total quantity is required'],
    min: [0, 'Quantity cannot be negative']
  },
  availableQuantity: {
    type: Number,
    required: [true, 'Available quantity is required'],
    min: [0, 'Available quantity cannot be negative']
  },
  description: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Equipment', equipmentSchema);
