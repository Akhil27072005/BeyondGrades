const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  companyType: { type: String, required: true }, // e.g. "Corp", "LLC"
  state: { type: String, required: true },
  name: { type: String, required: true },
  type: { type: String }, // duplicate of companyType for form compatibility
  size: { type: String },
  address: { type: String },
  country: { type: String },
  city: { type: String },
  website: { type: String },
  description: { type: String },
  verified: { type: Boolean, default: false }
}, {
  timestamps: true
});

companySchema.index({ verified: 1 });

module.exports = mongoose.model('Company', companySchema);
