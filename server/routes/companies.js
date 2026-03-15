const express = require('express');
const { auth, requireRole } = require('../middleware/auth');
const Company = require('../models/Company');

const router = express.Router();

// Get public company profile (for students viewing)
router.get('/:id', auth, requireRole(['student']), async (req, res) => {
  try {
    const company = await Company.findById(req.params.id).lean();
    if (!company) {
      return res.status(404).json({ message: 'Company not found' });
    }
    res.json(company);
  } catch (error) {
    console.error('Get company error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
