const mongoose = require('mongoose');

const batchSchema = new mongoose.Schema({
  year: { type: Number, required: true },
  studentIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }]
});

const collegeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  contactEmail: { 
    type: String, 
    required: true,
    lowercase: true,
    trim: true
  },
  batches: [batchSchema]
}, {
  timestamps: true
});

// Indexes
collegeSchema.index({ name: 1 });
collegeSchema.index({ 'batches.year': 1 });

module.exports = mongoose.model('College', collegeSchema);
