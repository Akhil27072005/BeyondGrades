const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true 
  },
  type: { 
    type: String, 
    enum: ['invite', 'verification', 'hired', 'message'],
    required: true 
  },
  payload: { type: mongoose.Schema.Types.Mixed },
  read: { type: Boolean, default: false }
}, {
  timestamps: true
});

// Indexes
notificationSchema.index({ userId: 1, read: 1 });
notificationSchema.index({ type: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
