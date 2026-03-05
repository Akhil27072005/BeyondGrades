const express = require('express');
const { auth } = require('../middleware/auth');
const { getGridFS } = require('../config/gridfs');
const Notification = require('../models/Notification');
const Student = require('../models/Student');
const Job = require('../models/Job');
const College = require('../models/College');

const router = express.Router();

// Get notifications
router.get('/notifications/me', auth, async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ notifications });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark notification as read
router.put('/notifications/:id/read', auth, async (req, res) => {
  try {
    const { id } = req.params;

    const notification = await Notification.findOne({ 
      _id: id, 
      userId: req.user._id 
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    notification.read = true;
    await notification.save();

    res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Download file (GridFS)
router.get('/files/:fileId/download', async (req, res) => {
  try {
    const { fileId } = req.params;
    const gfs = getGridFS();

    const file = await gfs.files.findOne({ _id: fileId });
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    // Set appropriate headers
    res.setHeader('Content-Type', file.contentType || 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${file.filename}"`);

    // Stream the file
    const readStream = gfs.createReadStream({ _id: fileId });
    readStream.pipe(res);

    readStream.on('error', (error) => {
      console.error('File stream error:', error);
      res.status(500).json({ message: 'Error streaming file' });
    });
  } catch (error) {
    console.error('Download file error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get alumni directory
router.get('/alumni', async (req, res) => {
  try {
    const { collegeId, filter, search } = req.query;

    let matchQuery = { 'visibility.public': true };
    
    if (collegeId) {
      matchQuery.collegeId = collegeId;
    }

    if (search) {
      matchQuery.$or = [
        { name: { $regex: search, $options: 'i' } },
        { 'skills.name': { $regex: search, $options: 'i' } }
      ];
    }

    if (filter) {
      const filters = filter.split(',');
      matchQuery['skills.name'] = { $in: filters };
    }

    const alumni = await Student.find(matchQuery)
      .populate('collegeId', 'name')
      .select('name yearOfGraduation skills collegeId visibility')
      .sort({ yearOfGraduation: -1 })
      .limit(100);

    res.json({ alumni });
  } catch (error) {
    console.error('Get alumni error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get public jobs feed
router.get('/jobs', async (req, res) => {
  try {
    const { domain, locationType, search } = req.query;

    let matchQuery = {};
    
    if (domain) {
      matchQuery.domain = domain;
    }

    if (locationType) {
      matchQuery.locationType = locationType;
    }

    if (search) {
      matchQuery.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const jobs = await Job.find(matchQuery)
      .populate('recruiterId', 'companyName')
      .select('title description domain locationType batchTarget createdAt')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({ jobs });
  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get job details
router.get('/jobs/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const job = await Job.findById(id)
      .populate('recruiterId', 'companyName companyWebsite');

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    res.json({ job });
  } catch (error) {
    console.error('Get job details error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get colleges list
router.get('/colleges', async (req, res) => {
  try {
    const colleges = await College.find({})
      .select('name address contactEmail')
      .sort({ name: 1 });

    res.json({ colleges });
  } catch (error) {
    console.error('Get colleges error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get college skill distribution
router.get('/colleges/:id/skill-distribution', async (req, res) => {
  try {
    const { id } = req.params;
    const { year } = req.query;

    let matchQuery = { collegeId: id };
    if (year) {
      matchQuery.yearOfGraduation = parseInt(year);
    }

    const skillDistribution = await Student.aggregate([
      { $match: matchQuery },
      { $unwind: '$skills' },
      {
        $group: {
          _id: {
            skill: '$skills.name',
            level: '$skills.level'
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$_id.skill',
          levels: {
            $push: {
              level: '$_id.level',
              count: '$count'
            }
          },
          total: { $sum: '$count' }
        }
      },
      { $sort: { total: -1 } }
    ]);

    res.json({ skillDistribution });
  } catch (error) {
    console.error('Get college skill distribution error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
