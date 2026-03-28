const mongoose = require('mongoose');

const lostFoundItemSchema = new mongoose.Schema({
  userId: { // The person who reported the item
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    required: [true, 'Item type is required'],
    enum: ['Lost', 'Found']
  },
  itemName: {
    type: String,
    required: [true, 'Item name is required'],
    trim: true,
    maxlength: [50, 'Item name cannot exceed 50 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true
  },
  date: {
    type: Date,
    required: [true, 'Date is required']
  },
  contactInfo: {
    type: String,
    required: [true, 'Contact information is required'],
    trim: true
  },
  status: {
    type: String,
    enum: ['active', 'resolved'],
    default: 'active'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('LostFoundItem', lostFoundItemSchema);
