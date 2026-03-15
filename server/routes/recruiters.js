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
const CalendarEvent = require('../models/CalendarEvent');
const matcherClient = require('../services/matcherClient');
const { sendInterviewInvite, sendHiredNotification } = require('../services/emailService');

const router = express.Router();

const startOfMonth = (d = new Date()) => new Date(d.getFullYear(), d.getMonth(), 1);

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

// Dashboard summary (overview + acquisitions + calendar + recent jobs + activity)
router.get('/me/dashboard-summary', auth, requireRole(['recruiter']), async (req, res) => {
  try {
    const recruiterId = req.user._id;
    const periodStart = startOfMonth(new Date());
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const recruiter = await Recruiter.findById(recruiterId).select('name companyName companyWebsite verified companyId').lean();
    if (!recruiter) {
      return res.status(404).json({ message: 'Recruiter not found' });
    }

    const jobDocs = await Job.find({ recruiterId })
      .select('_id title location locationType createdAt')
      .sort({ createdAt: -1 })
      .lean();
    const jobIds = jobDocs.map(j => j._id);

    const [applicationsAgg, hiresThisMonthCount] = await Promise.all([
      Application.aggregate([
        { $match: { jobId: { $in: jobIds }, appliedAt: { $gte: periodStart } } },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]),
      Hire.countDocuments({ recruiterId, markedAt: { $gte: periodStart } })
    ]);

    const appsByStatus = Object.fromEntries((applicationsAgg || []).map(r => [r._id, r.count]));
    const applicationsThisMonth =
      Object.values(appsByStatus).reduce((sum, v) => sum + (Number(v) || 0), 0);

    const shortlistedThisMonth =
      (appsByStatus.shortlisted || 0) +
      (appsByStatus.interviewed || 0) +
      (appsByStatus.offered || 0);

    const rejectedThisMonth = appsByStatus.rejected || 0;

    // Acquisitions: funnel-style distribution that sums to ~100
    const appliedThisMonth = appsByStatus.applied || 0;
    const shortlistedOnlyThisMonth = appsByStatus.shortlisted || 0;
    const onHoldThisMonth = (appsByStatus.reviewed || 0) + (appsByStatus.interviewed || 0) + (appsByStatus.offered || 0);

    const pct = (n, d) => (d > 0 ? Math.round((n / d) * 100) : 0);
    const acquisitionsDenom =
      appliedThisMonth + shortlistedOnlyThisMonth + rejectedThisMonth + onHoldThisMonth + hiresThisMonthCount;

    const acquisitions = {
      applicationsPct: pct(appliedThisMonth, acquisitionsDenom),
      shortlistedPct: pct(shortlistedOnlyThisMonth, acquisitionsDenom),
      rejectedPct: pct(rejectedThisMonth, acquisitionsDenom),
      onHoldPct: pct(onHoldThisMonth, acquisitionsDenom),
      onboardedPct: pct(hiresThisMonthCount, acquisitionsDenom)
    };

    // Recent jobs with applicant counts (top 3)
    const recentJobsSeed = jobDocs.slice(0, 3);
    const recentJobsJobIds = recentJobsSeed.map(j => j._id);
    const applicantCountsAgg = await Application.aggregate([
      { $match: { jobId: { $in: recentJobsJobIds } } },
      { $group: { _id: '$jobId', count: { $sum: 1 } } }
    ]);
    const applicantCountByJobId = Object.fromEntries(applicantCountsAgg.map(r => [r._id.toString(), r.count]));
    const recentJobs = recentJobsSeed.map(j => ({
      id: j._id,
      title: j.title,
      location: j.location || (j.locationType ? j.locationType.toUpperCase() : '—'),
      status: 'Active',
      applicantCount: applicantCountByJobId[j._id.toString()] || 0,
      createdAt: j.createdAt
    }));

    // Calendar (derived from student CalendarEvents that reference recruiter jobs)
    const calendarDocs = await CalendarEvent.find({
      jobId: { $in: jobIds },
      start: { $gte: today },
      type: { $in: ['interview', 'offer', 'deadline'] }
    })
      .populate('jobId', 'title')
      .sort({ start: 1 })
      .limit(8)
      .lean();

    const calendarEvents = (calendarDocs || []).map((e) => {
      const start = e.start ? new Date(e.start) : null;
      const dateLabel = start
        ? start.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
        : '';
      const isToday = start ? start.toDateString() === today.toDateString() : false;
      const label =
        e.type === 'interview' ? (e.roundType || 'Interview') :
          e.type === 'offer' ? 'Onboarding' :
            e.type === 'deadline' ? 'Deadline' : e.type;

      return {
        id: e._id,
        isToday,
        dateLabel,
        jobTitle: e.jobId?.title,
        title: e.title,
        label
      };
    });

    const calendar = {
      today: calendarEvents.filter(e => e.isToday).slice(0, 3),
      upcoming: calendarEvents.filter(e => !e.isToday).slice(0, 3)
    };

    // Activity: synthesize from recent applications, hires, and job creations
    const [recentApplications, recentHires] = await Promise.all([
      Application.find({ jobId: { $in: jobIds } })
        .populate('jobId', 'title')
        .sort({ appliedAt: -1 })
        .limit(6)
        .lean(),
      Hire.find({ recruiterId })
        .populate('jobId', 'title')
        .populate('studentId', 'name')
        .sort({ markedAt: -1 })
        .limit(4)
        .lean()
    ]);

    const activity = [];

    recentJobsSeed.slice(0, 3).forEach((j) => {
      activity.push({
        id: `job-${j._id}`,
        type: 'jobCreated',
        message: `You created a job post for ${j.title}`,
        createdAt: j.createdAt
      });
    });

    (recentApplications || []).forEach((a) => {
      activity.push({
        id: `app-${a._id}`,
        type: 'applicationReceived',
        message: `New application for ${a.jobId?.title || 'a job post'}`,
        createdAt: a.appliedAt
      });
    });

    (recentHires || []).forEach((h) => {
      activity.push({
        id: `hire-${h._id}`,
        type: 'candidateHired',
        message: `You marked ${h.studentId?.name || 'a candidate'} as hired for ${h.jobId?.title || 'a job post'}`,
        createdAt: h.markedAt
      });
    });

    activity.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    res.json({
      profile: recruiter,
      overview: {
        applications: applicationsThisMonth,
        shortlisted: shortlistedThisMonth,
        onboarded: hiresThisMonthCount,
        rejected: rejectedThisMonth
      },
      acquisitions,
      calendar,
      recentJobs,
      activity: activity.slice(0, 8)
    });
  } catch (error) {
    console.error('Get recruiter dashboard summary error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update recruiter profile (personal details only; company on /me/company)
router.put('/me', auth, requireRole(['recruiter']), async (req, res) => {
  try {
    const { name, jobTitle, contactPhone, linkedInUrl } = req.body;

    const recruiter = await Recruiter.findById(req.user._id);
    if (!recruiter) {
      return res.status(404).json({ message: 'Recruiter not found' });
    }

    if (name !== undefined) recruiter.name = name;
    if (jobTitle !== undefined) recruiter.jobTitle = jobTitle;
    if (contactPhone !== undefined) recruiter.contactPhone = contactPhone;
    if (linkedInUrl !== undefined) recruiter.linkedInUrl = linkedInUrl;

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
    if (companyDescription !== undefined) recruiter.companyDescription = companyDescription;

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

// Update company details (recruiter's company-related fields)
router.put('/me/company', auth, requireRole(['recruiter']), async (req, res) => {
  try {
    const { companyName, companyWebsite, companyDescription, companySize, linkedInUrl } = req.body;
    const recruiter = await Recruiter.findById(req.user._id);
    if (!recruiter) {
      return res.status(404).json({ message: 'Recruiter not found' });
    }
    if (companyName !== undefined) recruiter.companyName = companyName;
    if (companyWebsite !== undefined) recruiter.companyWebsite = companyWebsite;
    if (companyDescription !== undefined) recruiter.companyDescription = companyDescription;
    if (companySize !== undefined) recruiter.companySize = companySize;
    if (linkedInUrl !== undefined) recruiter.linkedInUrl = linkedInUrl;
    await recruiter.save();
    res.json({ message: 'Company details updated successfully', recruiter });
  } catch (error) {
    console.error('Update company details error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get public recruiter profile (for students viewing)
router.get('/public/:id', auth, requireRole(['student']), async (req, res) => {
  try {
    const recruiter = await Recruiter.findById(req.params.id)
      .select('name companyName companyWebsite jobTitle linkedInUrl companyId')
      .lean();
    if (!recruiter) {
      return res.status(404).json({ message: 'Recruiter not found' });
    }
    res.json(recruiter);
  } catch (error) {
    console.error('Get public recruiter error:', error);
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

// Get recruiter's jobs (same list as Jobs Posted page; includes applicantCount for dashboard)
router.get('/me/jobs', auth, requireRole(['recruiter']), async (req, res) => {
  try {
    const jobs = await Job.find({ recruiterId: req.user._id })
      .sort({ createdAt: -1 })
      .lean();
    const jobIds = jobs.map(j => j._id);
    const counts = await Application.aggregate([
      { $match: { jobId: { $in: jobIds } } },
      { $group: { _id: '$jobId', count: { $sum: 1 } } }
    ]);
    const countByJobId = Object.fromEntries((counts || []).map(c => [c._id.toString(), c.count]));
    const jobsWithCount = jobs.map(j => ({
      ...j,
      applicantCount: countByJobId[j._id.toString()] || 0
    }));
    res.json(jobsWithCount);
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
      shortlistSettings,
      industry,
      contactPerson,
      contactEmail,
      contactPhone,
      jobType,
      jobDuration,
      location
    } = req.body;

    const recruiter = await Recruiter.findById(req.user._id);
    if (!recruiter) {
      return res.status(404).json({ message: 'Recruiter not found' });
    }

    const job = new Job({
      recruiterId: recruiter._id,
      companyId: recruiter.companyId || undefined,
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
      },
      industry: industry || undefined,
      contactPerson: contactPerson || undefined,
      contactEmail: contactEmail || undefined,
      contactPhone: contactPhone || undefined,
      jobType: jobType || undefined,
      jobDuration: jobDuration || undefined,
      location: location || undefined
    });

    await job.save();

    // Add job to recruiter's posted jobs
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

// Get job shortlist (enriched with student name and application date)
router.get('/me/jobs/:jobId/shortlist', auth, requireRole(['recruiter']), async (req, res) => {
  try {
    const { jobId } = req.params;
    const { topN = 50, allowHired = false } = req.query;

    // Verify job belongs to recruiter
    const job = await Job.findOne({ _id: jobId, recruiterId: req.user._id });
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Get matches from Python matcher service
    const matches = await matcherClient.getJobMatches(jobId, parseInt(topN), allowHired === 'true');
    const results = matches.results || [];

    const studentIds = results.map(m => m.studentId);
    const [students, applications] = await Promise.all([
      Student.find({ _id: { $in: studentIds } }).select('name email').lean(),
      Application.find({ jobId, studentId: { $in: studentIds } }).select('studentId appliedAt').lean()
    ]);

    const studentMap = Object.fromEntries(students.map(s => [s._id.toString(), s]));
    const applicationMap = Object.fromEntries(
      applications.map(a => [a.studentId.toString(), a.appliedAt])
    );

    const enrichedMatches = results.map(m => ({
      ...m,
      studentName: studentMap[m.studentId]?.name || 'Unknown',
      applicationDate: applicationMap[m.studentId] || null
    }));

    res.json({
      job: {
        id: job._id,
        title: job.title,
        domain: job.domain
      },
      matches: enrichedMatches,
      totalCandidates: matches.totalCandidates || 0
    });
  } catch (error) {
    console.error('Get shortlist error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get pipeline for a job (applications grouped by stage, with scores and top-match flag)
router.get('/me/jobs/:jobId/pipeline', auth, requireRole(['recruiter']), async (req, res) => {
  try {
    const { jobId } = req.params;
    const { sort = 'timeInStage' } = req.query;

    const job = await Job.findOne({ _id: jobId, recruiterId: req.user._id });
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    const applications = await Application.find({ jobId, status: { $ne: 'rejected' } })
      .select('studentId status appliedAt pipelineStage subStatus stageMovedAt stageDeadline')
      .lean();

    const studentIds = [...new Set(applications.map(a => a.studentId.toString()))];
    const students = await Student.find({ _id: { $in: studentIds } }).select('name').lean();
    const studentMap = Object.fromEntries(students.map(s => [s._id.toString(), s]));

    let matches = [];
    try {
      const matcherRes = await matcherClient.getJobMatches(jobId, 200, true);
      matches = matcherRes.results || [];
    } catch (e) {
      // matcher may be down; continue without scores
    }
    const scoreByStudent = Object.fromEntries(matches.map(m => [String(m.studentId), m.score]));
    const scores = matches.map(m => m.score).filter(Boolean).sort((a, b) => b - a);
    const topScoreThreshold = scores.length > 0 ? scores[Math.min(Math.floor(scores.length * 0.2), scores.length - 1)] : 1;

    const stageOrder = ['application', 'screening', 'assignment', 'technical_interview', 'hire'];
    const candidates = applications.map(app => {
      const sid = app.studentId.toString();
      const score = scoreByStudent[sid];
      const stage = app.pipelineStage || 'application';
      const stageMovedAt = app.stageMovedAt || app.appliedAt;
      return {
        applicationId: app._id,
        studentId: sid,
        studentName: studentMap[sid]?.name || 'Unknown',
        score: score != null ? Math.round(score * 100) : null,
        isTopMatch: score != null && score >= topScoreThreshold,
        subStatus: app.subStatus || null,
        stageMovedAt: stageMovedAt || null,
        stageDeadline: app.stageDeadline || null,
        appliedAt: app.appliedAt,
        pipelineStage: stage
      };
    });

    if (sort === 'timeInStage') {
      candidates.sort((a, b) => {
        const aStage = stageOrder.indexOf(a.pipelineStage);
        const bStage = stageOrder.indexOf(b.pipelineStage);
        if (aStage !== bStage) return aStage - bStage;
        const aTime = a.stageMovedAt ? new Date(a.stageMovedAt).getTime() : 0;
        const bTime = b.stageMovedAt ? new Date(b.stageMovedAt).getTime() : 0;
        return aTime - bTime; // oldest in stage first
      });
    }

    const stages = {};
    stageOrder.forEach(s => { stages[s] = []; });
    candidates.forEach(c => {
      const stage = c.pipelineStage || 'application';
      if (stages[stage]) stages[stage].push(c);
    });

    res.json({ stages, stageOrder });
  } catch (error) {
    console.error('Get pipeline error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update application pipeline stage (or reject)
router.patch('/me/jobs/:jobId/applications/:applicationId', auth, requireRole(['recruiter']), async (req, res) => {
  try {
    const { jobId, applicationId } = req.params;
    const { pipelineStage, subStatus, stageDeadline, status } = req.body;

    const job = await Job.findOne({ _id: jobId, recruiterId: req.user._id });
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    const application = await Application.findOne({ _id: applicationId, jobId });
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    if (status === 'rejected') {
      application.status = 'rejected';
      await application.save();
      return res.json({ message: 'Application rejected', application });
    }

    const stageChanged = pipelineStage && application.pipelineStage !== pipelineStage;
    if (pipelineStage) application.pipelineStage = pipelineStage;
    if (subStatus !== undefined) application.subStatus = subStatus;
    if (stageDeadline !== undefined) application.stageDeadline = stageDeadline;
    if (stageChanged) application.stageMovedAt = new Date();

    if (pipelineStage === 'hire') {
      application.status = 'offered';
    }
    await application.save();

    res.json({ message: 'Application updated', application });
  } catch (error) {
    console.error('Update application stage error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add candidate to pipeline (creates application in "application" stage)
router.post('/me/jobs/:jobId/pipeline', auth, requireRole(['recruiter']), async (req, res) => {
  try {
    const { jobId } = req.params;
    const { studentId } = req.body;

    const job = await Job.findOne({ _id: jobId, recruiterId: req.user._id });
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    let application = await Application.findOne({ jobId, studentId });
    if (application) {
      return res.json({ message: 'Already in pipeline', application });
    }

    const now = new Date();
    application = new Application({
      jobId,
      studentId,
      status: 'applied',
      pipelineStage: 'application',
      subStatus: 'Invitation pending',
      stageMovedAt: now,
      appliedAt: now
    });
    await application.save();

    res.status(201).json({ message: 'Added to pipeline', application });
  } catch (error) {
    console.error('Add to pipeline error:', error);
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

    const app = await Application.findOne({ jobId, studentId });
    if (app) {
      app.pipelineStage = 'hire';
      app.subStatus = 'Contract sent';
      app.stageMovedAt = new Date();
      app.status = 'offered';
      await app.save();
    }

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

      const now = new Date();
      let application = await Application.findOne({ jobId, studentId });
      if (application) {
        application.status = 'shortlisted';
        application.pipelineStage = 'screening';
        application.subStatus = 'Invitation sent';
        application.stageMovedAt = now;
        await application.save();
      } else {
        application = new Application({
          jobId,
          studentId,
          status: 'shortlisted',
          pipelineStage: 'screening',
          subStatus: 'Invitation sent',
          stageMovedAt: now,
          appliedAt: now
        });
        await application.save();
      }

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
