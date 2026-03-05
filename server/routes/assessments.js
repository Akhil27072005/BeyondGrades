const express = require('express');
const { auth, requireRole } = require('../middleware/auth');
const Assessment = require('../models/Assessment');
const Job = require('../models/Job');
const Student = require('../models/Student');

const router = express.Router();

// Create assessment (recruiter)
router.post('/', auth, requireRole(['recruiter']), async (req, res) => {
  try {
    const { jobId, title, questions, startAt, endAt } = req.body;

    // Verify job belongs to recruiter
    if (jobId) {
      const job = await Job.findOne({ _id: jobId, recruiterId: req.user._id });
      if (!job) {
        return res.status(404).json({ message: 'Job not found' });
      }
    }

    const assessment = new Assessment({
      jobId,
      title,
      questions,
      startAt: new Date(startAt),
      endAt: new Date(endAt)
    });

    await assessment.save();

    res.status(201).json({
      message: 'Assessment created successfully',
      assessment
    });
  } catch (error) {
    console.error('Create assessment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Submit assessment (student)
router.post('/:id/submit', auth, requireRole(['student']), async (req, res) => {
  try {
    const { id } = req.params;
    const { answers } = req.body;

    const assessment = await Assessment.findById(id);
    if (!assessment) {
      return res.status(404).json({ message: 'Assessment not found' });
    }

    // Check if assessment is still active
    const now = new Date();
    if (now < assessment.startAt || now > assessment.endAt) {
      return res.status(400).json({ message: 'Assessment is not currently active' });
    }

    // Calculate score (basic implementation)
    let score = 0;
    let totalQuestions = assessment.questions.length;

    assessment.questions.forEach((question, index) => {
      if (question.type === 'mcq' && answers[index] === question.answer) {
        score += 1;
      }
      // Add more scoring logic for other question types
    });

    const finalScore = (score / totalQuestions) * 100;

    // Add result
    const result = {
      studentId: req.user._id,
      score: finalScore,
      submittedAt: new Date()
    };

    assessment.results.push(result);
    await assessment.save();

    res.json({
      message: 'Assessment submitted successfully',
      score: finalScore
    });
  } catch (error) {
    console.error('Submit assessment error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get assessment results (recruiter)
router.get('/:id/results', auth, requireRole(['recruiter']), async (req, res) => {
  try {
    const { id } = req.params;

    const assessment = await Assessment.findById(id)
      .populate('results.studentId', 'name email collegeId')
      .populate('jobId', 'title');

    if (!assessment) {
      return res.status(404).json({ message: 'Assessment not found' });
    }

    // Verify recruiter owns the job (if assessment is linked to a job)
    if (assessment.jobId && assessment.jobId.recruiterId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json({
      assessment: {
        id: assessment._id,
        title: assessment.title,
        jobTitle: assessment.jobId?.title,
        results: assessment.results.map(result => ({
          studentId: result.studentId._id,
          studentName: result.studentId.name,
          studentEmail: result.studentId.email,
          score: result.score,
          submittedAt: result.submittedAt
        }))
      }
    });
  } catch (error) {
    console.error('Get assessment results error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get available assessments for student
router.get('/available', auth, requireRole(['student']), async (req, res) => {
  try {
    const now = new Date();
    
    const assessments = await Assessment.find({
      startAt: { $lte: now },
      endAt: { $gte: now }
    }).populate('jobId', 'title recruiterId')
      .select('title jobId startAt endAt');

    // Filter out assessments already taken by student
    const availableAssessments = assessments.filter(assessment => {
      const alreadyTaken = assessment.results.some(result => 
        result.studentId.toString() === req.user._id.toString()
      );
      return !alreadyTaken;
    });

    res.json({ assessments: availableAssessments });
  } catch (error) {
    console.error('Get available assessments error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
