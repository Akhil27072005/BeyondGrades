const express = require('express');
const multer = require('multer');
const { auth, requireRole } = require('../middleware/auth');
const { validateProject } = require('../middleware/validation');
const Student = require('../models/Student');
const Project = require('../models/Project');
const Job = require('../models/Job');
const CalendarEvent = require('../models/CalendarEvent');
const { tagProject } = require('../services/autoTagger');
const matcherClient = require('../services/matcherClient');

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  }
});

// Get current student profile
router.get('/me', auth, requireRole(['student']), async (req, res) => {
  try {
    const student = await Student.findById(req.user._id)
      .populate('projects')
      .populate('collegeId', 'name address');
    
    res.json(student);
  } catch (error) {
    console.error('Get student profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update student profile
router.put('/me', auth, requireRole(['student']), async (req, res) => {
  try {
    const { name, phone, githubUrl, portfolioUrl, visibility } = req.body;
    
    const student = await Student.findById(req.user._id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Update allowed fields
    if (name) student.name = name;
    if (phone) student.phone = phone;
    if (githubUrl) student.githubUrl = githubUrl;
    if (portfolioUrl) student.portfolioUrl = portfolioUrl;
    if (visibility) student.visibility = { ...student.visibility, ...visibility };

    await student.save();
    res.json({ message: 'Profile updated successfully', student });
  } catch (error) {
    console.error('Update student profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add/Update skills
router.post('/me/skills', auth, requireRole(['student']), async (req, res) => {
  try {
    const { skills } = req.body;
    
    const student = await Student.findById(req.user._id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Validate skills format
    if (!Array.isArray(skills)) {
      return res.status(400).json({ message: 'Skills must be an array' });
    }

    // Validate each skill
    for (const skill of skills) {
      if (!skill.name || !skill.level) {
        return res.status(400).json({ message: 'Each skill must have name and level' });
      }
      if (!['beginner', 'intermediate', 'advanced', 'expert'].includes(skill.level)) {
        return res.status(400).json({ message: 'Invalid skill level' });
      }
    }

    student.skills = skills;
    await student.save();

    res.json({ message: 'Skills updated successfully', skills: student.skills });
  } catch (error) {
    console.error('Update skills error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create project
router.post('/me/projects', auth, requireRole(['student']), validateProject, async (req, res) => {
  try {
    const { title, description, repoUrl, demoUrl, role, contributions, skillTags: bodySkillTags, domainTags: bodyDomainTags } = req.body;
    
    const autoTagged = tagProject(title, description);
    const skillTags = Array.isArray(bodySkillTags) && bodySkillTags.length > 0 ? bodySkillTags.map(t => (typeof t === 'string' ? t.trim() : t)).filter(Boolean) : autoTagged.skillTags;
    const domainTags = Array.isArray(bodyDomainTags) && bodyDomainTags.length > 0 ? bodyDomainTags.map(t => (typeof t === 'string' ? t.trim() : t)).filter(Boolean) : autoTagged.domainTags;
    const evidenceScore = autoTagged.evidenceScore;

    const project = new Project({
      studentId: req.user._id,
      title,
      description,
      repoUrl,
      demoUrl,
      role,
      contributions: contributions || [],
      skillTags,
      domainTags,
      evidenceScore
    });

    await project.save();

    // Add project to student
    const student = await Student.findById(req.user._id);
    student.projects.push(project._id);
    await student.save();

    res.status(201).json({
      message: 'Project created successfully',
      project: {
        ...project.toObject(),
        autoTaggedSkills: skillTags,
        autoTaggedDomains: domainTags
      }
    });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update project
router.put('/me/projects/:projectId', auth, requireRole(['student']), validateProject, async (req, res) => {
  try {
    const { projectId } = req.params;
    const { title, description, repoUrl, demoUrl, role, contributions, skillTags: bodySkillTags, domainTags: bodyDomainTags } = req.body;
    
    const project = await Project.findOne({ _id: projectId, studentId: req.user._id });
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const autoTagged = tagProject(title, description);
    const skillTags = Array.isArray(bodySkillTags) && bodySkillTags.length > 0 ? bodySkillTags.map(t => (typeof t === 'string' ? t.trim() : t)).filter(Boolean) : autoTagged.skillTags;
    const domainTags = Array.isArray(bodyDomainTags) && bodyDomainTags.length > 0 ? bodyDomainTags.map(t => (typeof t === 'string' ? t.trim() : t)).filter(Boolean) : autoTagged.domainTags;
    const evidenceScore = autoTagged.evidenceScore;

    project.title = title;
    project.description = description;
    project.repoUrl = repoUrl;
    project.demoUrl = demoUrl;
    project.role = role;
    project.contributions = contributions || [];
    project.skillTags = skillTags;
    project.domainTags = domainTags;
    project.evidenceScore = evidenceScore;

    await project.save();

    res.json({
      message: 'Project updated successfully',
      project: {
        ...project.toObject(),
        autoTaggedSkills: skillTags,
        autoTaggedDomains: domainTags
      }
    });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete project
router.delete('/me/projects/:projectId', auth, requireRole(['student']), async (req, res) => {
  try {
    const { projectId } = req.params;
    
    const project = await Project.findOne({ _id: projectId, studentId: req.user._id });
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Remove project from student's projects array
    const student = await Student.findById(req.user._id);
    student.projects = student.projects.filter(p => p.toString() !== projectId);
    await student.save();

    // Delete the project
    await Project.findByIdAndDelete(projectId);

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get public student profile
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const student = await Student.findById(id)
      .populate('projects')
      .populate('collegeId', 'name')
      .select('-passwordHash -email -phone');
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Check visibility settings
    if (!student.visibility.public) {
      return res.status(403).json({ message: 'Profile is private' });
    }

    // Remove sensitive information
    const publicProfile = {
      ...student.toObject(),
      contactAllowed: student.visibility.contactAllowed
    };

    res.json(publicProfile);
  } catch (error) {
    console.error('Get public profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get recommended jobs
router.get('/me/recommended-jobs', auth, requireRole(['student']), async (req, res) => {
  try {
    // First, check whether the student's profile has the essentials
    const student = await Student.findById(req.user._id).select('skills projects');
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const hasSkills = Array.isArray(student.skills) && student.skills.length > 0;
    const hasProjects = Array.isArray(student.projects) && student.projects.length > 0;

    const profileStatus = {
      hasSkills,
      hasProjects,
      profileCompleteForMatching: hasSkills && hasProjects
    };

    // If essentials are missing, short‑circuit with explicit status instead of silently returning empty matches
    if (!profileStatus.profileCompleteForMatching) {
      return res.json({
        recommendations: [],
        profileStatus
      });
    }

    // Get all jobs and use matcher service to get recommendations
    const jobs = await Job.find({}).populate('recruiterId', 'companyName');
    
    const recommendations = [];
    
    for (const job of jobs) {
      try {
        const matches = await matcherClient.getJobMatches(job._id, 5);
        const studentMatch = matches.results.find(result => 
          result.studentId === req.user._id.toString()
        );
        
        if (studentMatch) {
          recommendations.push({
            job: {
              id: job._id,
              title: job.title,
              description: job.description,
              company: job.recruiterId.companyName,
              domain: job.domain,
              locationType: job.locationType
            },
            matchScore: studentMatch.score,
            reasons: studentMatch.reasons
          });
        }
      } catch (error) {
        console.error(`Error getting matches for job ${job._id}:`, error);
        // Continue with other jobs
      }
    }

    // Sort by match score
    recommendations.sort((a, b) => b.matchScore - a.matchScore);

    res.json({
      recommendations,
      profileStatus: {
        ...profileStatus,
        // profileCompleteForMatching will already be true here, but be explicit
        profileCompleteForMatching: true
      }
    });
  } catch (error) {
    console.error('Get recommended jobs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get detailed job info for students
router.get('/jobs/:id', auth, requireRole(['student']), async (req, res) => {
  try {
    const { id } = req.params;

    const job = await Job.findById(id).populate('recruiterId', 'companyName');
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    res.json({
      id: job._id,
      title: job.title,
      description: job.description,
      company: job.recruiterId ? job.recruiterId.companyName : undefined,
      domain: job.domain,
      locationType: job.locationType,
      minExperienceYears: job.minExperienceYears,
      batchTarget: job.batchTarget,
      requiredSkills: job.requiredSkills,
      optionalSkills: job.optionalSkills,
      createdAt: job.createdAt,
      updatedAt: job.updatedAt
    });
  } catch (error) {
    console.error('Get job detail (student) error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get calendar events
router.get('/me/calendar', auth, requireRole(['student']), async (req, res) => {
  try {
    const { start, end } = req.query;
    const studentId = req.user._id;

    const filter = { studentId };
    if (start && end) {
      const startDate = new Date(start);
      const endDate = new Date(end);
      filter.$and = [
        { start: { $lt: endDate } },
        { $or: [{ end: { $gt: startDate } }, { end: null }] }
      ];
    }

    const docs = await CalendarEvent.find(filter).sort({ start: 1 }).lean();

    const now = Date.now();
    const twoDaysMs = 2 * 24 * 60 * 60 * 1000;

    const events = docs.map((doc) => {
      const event = {
        id: doc._id.toString(),
        title: doc.title,
        type: doc.type,
        start: doc.start,
        end: doc.end,
        jobId: doc.jobId ? doc.jobId.toString() : null,
        company: doc.company,
        location: doc.location,
        joinLink: doc.joinLink,
        notes: doc.notes,
        offerStage: doc.offerStage,
        offerDeadline: doc.offerDeadline,
        compensationSummary: doc.compensationSummary,
        recruiterContact: doc.recruiterContact,
        roundType: doc.roundType,
        roundIndex: doc.roundIndex,
        durationMinutes: doc.durationMinutes,
        isBlocked: doc.isBlocked
      };

      if (doc.type === 'offer' && doc.offerDeadline) {
        const deadlineMs = new Date(doc.offerDeadline).getTime();
        event.deadlineApproaching = doc.offerStage === 'pending' && deadlineMs > now && (deadlineMs - now) <= twoDaysMs;
        event.deadlineExpired = doc.offerStage === 'pending' && deadlineMs <= now;
      }

      return event;
    });

    res.json({ events });
  } catch (error) {
    console.error('Get calendar error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get calendar preferences (availability, blocked periods)
router.get('/me/calendar/preferences', auth, requireRole(['student']), async (req, res) => {
  try {
    const student = await Student.findById(req.user._id).select('calendarPreferences').lean();
    const prefs = student?.calendarPreferences || {};
    res.json({
      preferredDays: prefs.preferredDays || [],
      preferredTimeRanges: prefs.preferredTimeRanges || [],
      blockedPeriods: prefs.blockedPeriods || []
    });
  } catch (error) {
    console.error('Get calendar preferences error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update calendar preferences
router.put('/me/calendar/preferences', auth, requireRole(['student']), async (req, res) => {
  try {
    const { preferredDays, preferredTimeRanges, blockedPeriods } = req.body;
    const student = await Student.findById(req.user._id);
    if (!student) return res.status(404).json({ message: 'Student not found' });

    if (!student.calendarPreferences) student.calendarPreferences = {};
    if (Array.isArray(preferredDays)) student.calendarPreferences.preferredDays = preferredDays;
    if (Array.isArray(preferredTimeRanges)) student.calendarPreferences.preferredTimeRanges = preferredTimeRanges;
    if (Array.isArray(blockedPeriods)) student.calendarPreferences.blockedPeriods = blockedPeriods;

    await student.save();
    res.json({
      message: 'Preferences updated',
      preferredDays: student.calendarPreferences.preferredDays,
      preferredTimeRanges: student.calendarPreferences.preferredTimeRanges,
      blockedPeriods: student.calendarPreferences.blockedPeriods
    });
  } catch (error) {
    console.error('Update calendar preferences error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update offer stage (accept/decline) or RSVP for event
router.post('/me/calendar/rsvp', auth, requireRole(['student']), async (req, res) => {
  try {
    const { eventId, response } = req.body; // response: 'accepted' | 'declined'
    const studentId = req.user._id;

    const event = await CalendarEvent.findOne({ _id: eventId, studentId });
    if (!event) return res.status(404).json({ message: 'Event not found' });

    if (event.type === 'offer') {
      if (!['accepted', 'declined'].includes(response)) {
        return res.status(400).json({ message: 'Invalid response for offer' });
      }
      event.offerStage = response;
      await event.save();
    }

    res.json({ message: 'Response recorded', eventId, response });
  } catch (error) {
    console.error('RSVP error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
