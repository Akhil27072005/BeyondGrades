const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true
  },
  passwordHash: { type: String, required: true },
  name: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['admin', 'super_admin'],
    default: 'admin'
  }
}, {
  timestamps: true
});

// Indexes
// Note: email index is automatically created by unique: true
adminSchema.index({ role: 1 });

module.exports = mongoose.model('Admin', adminSchema);
