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
  teamSizeCategory: {
    type: String,
    enum: ['', 'Individual', 'Duo', 'Small Team', 'Medium Team', 'Large Team'],
    default: ''
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active'
  },
  description: {
    type: String,
    trim: true
  },
  players: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  playerRegistrations: [{
    player: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      enum: ['Player', 'Captain', 'Substitute'],
      default: 'Player'
    },
    jerseyNumber: {
      type: Number,
      min: 1,
      max: 999
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 500
    }
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Sport', sportSchema);
