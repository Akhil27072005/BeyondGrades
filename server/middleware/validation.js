const { body, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

const validateStudentSignup = [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('collegeId').isMongoId().withMessage('Valid college ID required'),
  body('yearOfGraduation').isInt({ min: 2020, max: 2030 }).withMessage('Valid graduation year required'),
  body('degree').optional({ values: 'falsy' }).trim().isLength({ min: 1 }).withMessage('Degree must be non-empty if provided'),
  body('branch').optional({ values: 'falsy' }).trim().isLength({ min: 1 }).withMessage('Branch must be non-empty if provided'),
  body('dateOfBirth').optional({ values: 'falsy' }).isISO8601().withMessage('Valid date required'),
  body('cgpa').optional({ values: 'falsy' }).isFloat({ min: 0, max: 10 }).withMessage('CGPA must be between 0 and 10'),
  body('linkedInUrl').optional({ values: 'falsy' }).isURL().withMessage('Valid LinkedIn URL required'),
  handleValidationErrors
];

const validateRecruiterSignup = [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('companyName').trim().isLength({ min: 2 }).withMessage('Company name required'),
  body('companyWebsite').optional({ values: 'falsy' }).isURL().withMessage('Valid website URL required'),
  body('companySize').optional({ values: 'falsy' }).trim().isLength({ min: 1 }).withMessage('Company size must be non-empty if provided'),
  body('industry').optional({ values: 'falsy' }).trim().isLength({ min: 1 }).withMessage('Industry must be non-empty if provided'),
  body('companyDescription').optional({ values: 'falsy' }).trim().isLength({ max: 2000 }).withMessage('Description too long'),
  body('contactPhone').optional({ values: 'falsy' }).trim().isLength({ min: 1 }).withMessage('Contact phone must be non-empty if provided'),
  body('jobTitle').optional({ values: 'falsy' }).trim().isLength({ min: 1 }).withMessage('Job title must be non-empty if provided'),
  body('linkedInUrl').optional({ values: 'falsy' }).isURL().withMessage('Valid LinkedIn URL required'),
  handleValidationErrors
];

const validateLogin = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password required'),
  handleValidationErrors
];

const validateProject = [
  body('title').trim().isLength({ min: 3 }).withMessage('Title must be at least 3 characters'),
  body('description').trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
  body('repoUrl').optional().isURL().withMessage('Valid repository URL required'),
  body('demoUrl').optional().isURL().withMessage('Valid demo URL required'),
  body('skillTags').optional().isArray().withMessage('Skill tags must be an array'),
  body('skillTags.*').optional().trim().notEmpty().withMessage('Skill tag must be non-empty'),
  body('domainTags').optional().isArray().withMessage('Domain tags must be an array'),
  body('domainTags.*').optional().trim().notEmpty().withMessage('Domain tag must be non-empty'),
  handleValidationErrors
];

const validateJob = [
  body('title').trim().isLength({ min: 3 }).withMessage('Job title must be at least 3 characters'),
  body('description').trim().isLength({ min: 20 }).withMessage('Description must be at least 20 characters'),
  body('domain').trim().notEmpty().withMessage('Domain is required'),
  body('requiredSkills').isArray({ min: 1 }).withMessage('At least one required skill needed'),
  body('requiredSkills.*.name').trim().notEmpty().withMessage('Skill name required'),
  body('requiredSkills.*.requiredLevel').isIn(['beginner', 'intermediate', 'advanced', 'expert']).withMessage('Valid skill level required'),
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  validateStudentSignup,
  validateRecruiterSignup,
  validateLogin,
  validateProject,
  validateJob
};
