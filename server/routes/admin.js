const express = require('express');
const { auth, requireRole } = require('../middleware/auth');
const Recruiter = require('../models/Recruiter');
const College = require('../models/College');
const Student = require('../models/Student');
const Job = require('../models/Job');
const Hire = require('../models/Hire');
const Notification = require('../models/Notification');

const router = express.Router();

// Verify recruiter
router.post('/verify-recruiter', auth, requireRole(['admin']), async (req, res) => {
  try {
    const { recruiterId } = req.body;

    const recruiter = await Recruiter.findById(recruiterId);
    if (!recruiter) {
      return res.status(404).json({ message: 'Recruiter not found' });
    }

    recruiter.verified = true;
    await recruiter.save();

    // Create notification for recruiter
    const notification = new Notification({
      userId: recruiterId,
      type: 'verification',
      payload: {
        message: 'Your account has been verified. You can now post jobs.',
        companyName: recruiter.companyName
      }
    });
    await notification.save();

    res.json({ 
      message: 'Recruiter verified successfully',
      recruiter: {
        id: recruiter._id,
        name: recruiter.name,
        companyName: recruiter.companyName,
        verified: recruiter.verified
      }
    });
  } catch (error) {
    console.error('Verify recruiter error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get pending recruiters
router.get('/pending-recruiters', auth, requireRole(['admin']), async (req, res) => {
  try {
    const pendingRecruiters = await Recruiter.find({ verified: false })
      .select('name email companyName companyWebsite createdAt')
      .sort({ createdAt: -1 });

    res.json({ pendingRecruiters });
  } catch (error) {
    console.error('Get pending recruiters error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get system logs/stats
router.get('/logs', auth, requireRole(['admin']), async (req, res) => {
  try {
    const stats = {
      totalStudents: await Student.countDocuments(),
      totalRecruiters: await Recruiter.countDocuments(),
      totalJobs: await Job.countDocuments(),
      totalHires: await Hire.countDocuments({ active: true }),
      verifiedRecruiters: await Recruiter.countDocuments({ verified: true }),
      pendingRecruiters: await Recruiter.countDocuments({ verified: false }),
      totalColleges: await College.countDocuments()
    };

    res.json({ stats });
  } catch (error) {
    console.error('Get logs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all colleges
router.get('/colleges', auth, requireRole(['admin']), async (req, res) => {
  try {
    const colleges = await College.find({})
      .select('name address contactEmail batches')
      .sort({ name: 1 });

    res.json({ colleges });
  } catch (error) {
    console.error('Get colleges error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create college
router.post('/colleges', auth, requireRole(['admin']), async (req, res) => {
  try {
    const { name, address, contactEmail } = req.body;

    const college = new College({
      name,
      address,
      contactEmail
    });

    await college.save();

    res.status(201).json({
      message: 'College created successfully',
      college
    });
  } catch (error) {
    console.error('Create college error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
