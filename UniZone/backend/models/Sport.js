const mongoose = require('mongoose');

const sportSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Sport name is required'],
    unique: true,
    trim: true
  },
  maxPlayers: {
    type: Number,
    required: [true, 'Max players is required'],
    min: 1,
    default: 30
  },
  description: {
    type: String,
    trim: true
  },
  players: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Sport', sportSchema);
