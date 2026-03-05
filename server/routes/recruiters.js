const express = require('express');
const csvWriter = require('csv-writer');
const mongoose = require('mongoose');
const { auth, requireRole } = require('../middleware/auth');
const { validateJob } = require('../middleware/validation');
const Recruiter = require('../models/Recruiter');
const Job = require('../models/Job');
const Student = require('../models/Student');
const Hire = require('../models/Hire');
const Application = require('../models/Application');
const Notification = require('../models/Notification');
const College = require('../models/College');
const matcherClient = require('../services/matcherClient');
const { sendInterviewInvite, sendHiredNotification } = require('../services/emailService');

const router = express.Router();

// Get current recruiter profile
router.get('/me', auth, requireRole(['recruiter']), async (req, res) => {
  try {
    const recruiter = await Recruiter.findById(req.user._id);
    res.json(recruiter);
  } catch (error) {
    console.error('Get recruiter profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update recruiter profile
router.put('/me', auth, requireRole(['recruiter']), async (req, res) => {
  try {
    const { name, companyWebsite } = req.body;
    
    const recruiter = await Recruiter.findById(req.user._id);
    if (!recruiter) {
      return res.status(404).json({ message: 'Recruiter not found' });
    }

    if (name) recruiter.name = name;
    if (companyWebsite) recruiter.companyWebsite = companyWebsite;

    await recruiter.save();
    res.json({ message: 'Profile updated successfully', recruiter });
  } catch (error) {
    console.error('Update recruiter profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Register company
router.post('/register-company', auth, requireRole(['recruiter']), async (req, res) => {
  try {
    const { companyName, companyWebsite, companyDescription } = req.body;
    
    const recruiter = await Recruiter.findById(req.user._id);
    if (!recruiter) {
      return res.status(404).json({ message: 'Recruiter not found' });
    }

    recruiter.companyName = companyName;
    recruiter.companyWebsite = companyWebsite;
    // Company description could be added to the schema if needed

    await recruiter.save();

    // Create notification for admin
    const adminNotification = new Notification({
      userId: 'admin', // This would be the admin user ID
      type: 'verification',
      payload: {
        recruiterId: recruiter._id,
        companyName: companyName,
        message: 'New company registration pending verification'
      }
    });
    await adminNotification.save();

    res.json({ 
      message: 'Company registration submitted. Pending admin verification.',
      recruiter 
    });
  } catch (error) {
    console.error('Company registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all jobs (for recruiters)
router.get('/jobs', auth, requireRole(['recruiter']), async (req, res) => {
  try {
    const jobs = await Job.find({ recruiterId: req.user._id }).sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get recruiter's jobs
router.get('/me/jobs', auth, requireRole(['recruiter']), async (req, res) => {
  try {
    const jobs = await Job.find({ recruiterId: req.user._id }).sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    console.error('Get recruiter jobs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get recruiter's jobs by ID (for backward compatibility)
router.get('/:id/jobs', auth, requireRole(['recruiter']), async (req, res) => {
  try {
    const { id } = req.params;
    
    // Verify recruiter owns these jobs
    if (id !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const jobs = await Job.find({ recruiterId: id }).sort({ createdAt: -1 });
    res.json(jobs);
  } catch (error) {
    console.error('Get recruiter jobs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single job
router.get('/me/jobs/:jobId', auth, requireRole(['recruiter']), async (req, res) => {
  try {
    const { jobId } = req.params;
    
    const job = await Job.findOne({ _id: jobId, recruiterId: req.user._id });
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }
    
    res.json(job);
  } catch (error) {
    console.error('Get job error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create job
router.post('/me/jobs', auth, requireRole(['recruiter']), validateJob, async (req, res) => {
  try {
    const {
      title,
      description,
      domain,
      requiredSkills,
      optionalSkills,
      minExperienceYears,
      locationType,
      batchTarget,
      shortlistSettings
    } = req.body;

    const job = new Job({
      recruiterId: req.user._id,
      title,
      description,
      domain,
      requiredSkills,
      optionalSkills: optionalSkills || [],
      minExperienceYears: minExperienceYears || 0,
      locationType: locationType || 'onsite',
      batchTarget: batchTarget || [],
      shortlistSettings: shortlistSettings || {
        topN: 10,
        weights: { domain: 0.30, skill: 0.45, expertise: 0.25 }
      }
    });

    await job.save();

    // Add job to recruiter's posted jobs
    const recruiter = await Recruiter.findById(req.user._id);
    recruiter.postedJobs.push(job._id);
    await recruiter.save();

    res.status(201).json({
      message: 'Job created successfully',
      job
    });
  } catch (error) {
    console.error('Create job error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get job shortlist
router.get('/me/jobs/:jobId/shortlist', auth, requireRole(['recruiter']), async (req, res) => {
  try {
    const { jobId } = req.params;
    const { topN = 10, allowHired = false } = req.query;

    // Verify job belongs to recruiter
    const job = await Job.findOne({ _id: jobId, recruiterId: req.user._id });
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Get matches from Python matcher service
    const matches = await matcherClient.getJobMatches(jobId, parseInt(topN), allowHired === 'true');

    res.json({
      job: {
        id: job._id,
        title: job.title,
        domain: job.domain
      },
      matches: matches.results,
      totalCandidates: matches.totalCandidates || 0
    });
  } catch (error) {
    console.error('Get shortlist error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark student as hired
router.post('/me/jobs/:jobId/mark-hired', auth, requireRole(['recruiter']), async (req, res) => {
  try {
    const { jobId } = req.params;
    const { studentId } = req.body;

    // Verify job belongs to recruiter
    const job = await Job.findOne({ _id: jobId, recruiterId: req.user._id });
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check if student exists
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Create hire record
    const hire = new Hire({
      studentId,
      jobId,
      recruiterId: req.user._id,
      company: req.user.companyName,
      active: true
    });

    await hire.save();

    // Create notification for student
    const notification = new Notification({
      userId: studentId,
      type: 'hired',
      payload: {
        jobTitle: job.title,
        company: req.user.companyName,
        message: 'Congratulations! You have been hired.'
      }
    });
    await notification.save();

    // Send email notification
    try {
      await sendHiredNotification(student.email, student.name, job.title, req.user.companyName);
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Don't fail the operation if email fails
    }

    res.json({ 
      message: 'Student marked as hired successfully',
      hire
    });
  } catch (error) {
    console.error('Mark hired error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Invite student to interview
router.post('/me/jobs/:jobId/invite', auth, requireRole(['recruiter']), async (req, res) => {
  try {
    const { jobId } = req.params;
    const { studentIds, interviewDetails } = req.body;

    // Verify job belongs to recruiter
    const job = await Job.findOne({ _id: jobId, recruiterId: req.user._id });
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    const results = [];

    for (const studentId of studentIds) {
      // Check if student exists
      const student = await Student.findById(studentId);
      if (!student) {
        results.push({ studentId, success: false, message: 'Student not found' });
        continue;
      }

      // Create application record
      const application = new Application({
        jobId,
        studentId,
        status: 'shortlisted'
      });
      await application.save();

      // Create notification
      const notification = new Notification({
        userId: studentId,
        type: 'invite',
        payload: {
          jobTitle: job.title,
          company: req.user.companyName,
          interviewDetails,
          message: 'You have been invited for an interview'
        }
      });
      await notification.save();

      // Send email invitation
      try {
        await sendInterviewInvite(
          student.email,
          student.name,
          job.title,
          req.user.companyName,
          interviewDetails
        );
        results.push({ studentId, success: true, message: 'Invitation sent' });
      } catch (emailError) {
        console.error('Email sending failed:', emailError);
        results.push({ studentId, success: false, message: 'Email failed to send' });
      }
    }

    res.json({ 
      message: 'Invitations processed',
      results
    });
  } catch (error) {
    console.error('Send invite error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get skill distribution
router.get('/me/skill-distribution', auth, requireRole(['recruiter']), async (req, res) => {
  try {
    const { collegeId, batch } = req.query;

    let matchQuery = {};
    if (collegeId) {
      // Convert string to ObjectId for proper matching
      matchQuery.collegeId = new mongoose.Types.ObjectId(collegeId);
    }
    if (batch) {
      matchQuery.yearOfGraduation = parseInt(batch);
    }

    console.log('Skill distribution query:', matchQuery);

    // Aggregate skill distribution
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

    console.log('Skill distribution result:', skillDistribution.length, 'skills found');

    res.json({ skillDistribution });
  } catch (error) {
    console.error('Get skill distribution error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Export shortlist to CSV
router.get('/me/export-shortlist/:jobId', auth, requireRole(['recruiter']), async (req, res) => {
  try {
    const { jobId } = req.params;

    // Verify job belongs to recruiter
    const job = await Job.findOne({ _id: jobId, recruiterId: req.user._id });
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Get shortlist from matcher service
    const matches = await matcherClient.getJobMatches(jobId, 50, false);
    
    // Get student details for matched students
    const studentIds = matches.results.map(match => match.studentId);
    const students = await Student.find({ _id: { $in: studentIds } })
      .populate('collegeId', 'name')
      .select('name email yearOfGraduation skills collegeId');

    // Create CSV data
    const csvData = matches.results.map(match => {
      const student = students.find(s => s._id.toString() === match.studentId);
      return {
        name: student?.name || 'N/A',
        email: student?.email || 'N/A',
        college: student?.collegeId?.name || 'N/A',
        yearOfGraduation: student?.yearOfGraduation || 'N/A',
        matchScore: match.score,
        skillScore: match.skillScore,
        domainScore: match.domainScore,
        expertiseScore: match.expertiseScore,
        matchedSkills: match.matchedSkills?.map(s => s.name).join(', ') || 'N/A'
      };
    });

    // Set CSV headers
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="shortlist_${jobId}.csv"`);

    // Write CSV
    const writer = csvWriter.createObjectCsvWriter({
      path: 'shortlist.csv',
      header: [
        { id: 'name', title: 'Name' },
        { id: 'email', title: 'Email' },
        { id: 'college', title: 'College' },
        { id: 'yearOfGraduation', title: 'Graduation Year' },
        { id: 'matchScore', title: 'Match Score' },
        { id: 'skillScore', title: 'Skill Score' },
        { id: 'domainScore', title: 'Domain Score' },
        { id: 'expertiseScore', title: 'Expertise Score' },
        { id: 'matchedSkills', title: 'Matched Skills' }
      ]
    });

    // Convert to CSV string manually
    const csvHeader = 'Name,Email,College,Graduation Year,Match Score,Skill Score,Domain Score,Expertise Score,Matched Skills\n';
    const csvRows = csvData.map(row => 
      `"${row.name}","${row.email}","${row.college}","${row.yearOfGraduation}","${row.matchScore}","${row.skillScore}","${row.domainScore}","${row.expertiseScore}","${row.matchedSkills}"`
    ).join('\n');
    
    res.send(csvHeader + csvRows);
  } catch (error) {
    console.error('Export shortlist error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
