const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { auth, requireRole } = require('../middleware/auth');
const { validateStudentSignup, validateRecruiterSignup, validateLogin } = require('../middleware/validation');
const Student = require('../models/Student');
const Recruiter = require('../models/Recruiter');
const College = require('../models/College');
const { sendVerificationEmail } = require('../services/emailService');

const router = express.Router();

// Student signup
router.post('/signup', validateStudentSignup, async (req, res) => {
  try {
    const { name, email, password, collegeId, yearOfGraduation, phone, degree, branch, dateOfBirth, cgpa, linkedInUrl } = req.body;

    // Check if user already exists
    const existingStudent = await Student.findOne({ email });
    if (existingStudent) {
      return res.status(400).json({ message: 'Student already exists with this email' });
    }

    // Verify college exists
    const college = await College.findById(collegeId);
    if (!college) {
      return res.status(400).json({ message: 'Invalid college ID' });
    }

    // Check if email domain matches college (basic validation)
    // For development, we'll be more flexible with email validation
    const emailDomain = email.split('@')[1];
    const collegeEmail = college.contactEmail.split('@')[1];
    
    // Only enforce domain matching in production
    if (process.env.NODE_ENV === 'production' && emailDomain !== collegeEmail) {
      return res.status(400).json({ message: 'Email domain must match college domain' });
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create student
    const student = new Student({
      name,
      email,
      passwordHash,
      collegeId,
      yearOfGraduation,
      phone,
      degree: degree || undefined,
      branch: branch || undefined,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
      cgpa: cgpa !== undefined && cgpa !== '' ? Number(cgpa) : undefined,
      linkedInUrl: linkedInUrl || undefined,
      collegeEmailVerified: false
    });

    await student.save();

    // Add student to college batch
    const batch = college.batches.find(b => b.year === yearOfGraduation);
    if (batch) {
      batch.studentIds.push(student._id);
    } else {
      college.batches.push({
        year: yearOfGraduation,
        studentIds: [student._id]
      });
    }
    await college.save();

    // Generate JWT
    const token = jwt.sign(
      { id: student._id, role: 'student' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    // Send verification email
    try {
      await sendVerificationEmail(email, name, token);
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Don't fail the signup if email fails
    }

    res.status(201).json({
      message: 'Student created successfully. Please verify your email.',
      token,
      user: {
        id: student._id,
        name: student.name,
        email: student.email,
        role: 'student'
      }
    });
  } catch (error) {
    console.error('Student signup error:', error);
    res.status(500).json({ message: 'Server error during signup' });
  }
});

// Recruiter signup
router.post('/recruiter-signup', validateRecruiterSignup, async (req, res) => {
  try {
    const { name, email, password, companyName, companyWebsite, companySize, industry, companyDescription, contactPhone, jobTitle, linkedInUrl } = req.body;

    // Check if recruiter already exists
    const existingRecruiter = await Recruiter.findOne({ email });
    if (existingRecruiter) {
      return res.status(400).json({ message: 'Recruiter already exists with this email' });
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create recruiter (unverified by default)
    const recruiter = new Recruiter({
      name,
      email,
      passwordHash,
      companyName,
      companyWebsite,
      companySize: companySize || undefined,
      industry: industry || undefined,
      companyDescription: companyDescription || undefined,
      contactPhone: contactPhone || undefined,
      jobTitle: jobTitle || undefined,
      linkedInUrl: linkedInUrl || undefined,
      verified: false
    });

    await recruiter.save();

    // Generate JWT
    const token = jwt.sign(
      { id: recruiter._id, role: 'recruiter' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.status(201).json({
      message: 'Recruiter created successfully. Pending admin verification.',
      token,
      user: {
        id: recruiter._id,
        name: recruiter.name,
        email: recruiter.email,
        role: 'recruiter',
        verified: recruiter.verified
      }
    });
  } catch (error) {
    console.error('Recruiter signup error:', error);
    res.status(500).json({ message: 'Server error during signup' });
  }
});

// Login
router.post('/login', validateLogin, async (req, res) => {
  try {
    const { email, password } = req.body;

    // Try to find user in any collection
    let user = await Student.findOne({ email });
    let role = 'student';

    if (!user) {
      user = await Recruiter.findOne({ email });
      role = 'recruiter';
    }

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check if recruiter is verified
    if (role === 'recruiter' && !user.verified) {
      return res.status(400).json({ 
        message: 'Account pending verification. Please contact admin.' 
      });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user._id, role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role,
        verified: user.verified || true
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// Verify college email
router.post('/verify-college-email', auth, requireRole(['student']), async (req, res) => {
  try {
    const student = await Student.findById(req.user._id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    student.collegeEmailVerified = true;
    await student.save();

    res.json({ message: 'Email verified successfully' });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ message: 'Server error during verification' });
  }
});

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    res.json({
      user: req.user,
      role: req.userRole
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
