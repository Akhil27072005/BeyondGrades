const jwt = require('jsonwebtoken');
const Student = require('../models/Student');
const Recruiter = require('../models/Recruiter');
const Admin = require('../models/Admin');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    let user;
    switch (decoded.role) {
      case 'student':
        user = await Student.findById(decoded.id).select('-passwordHash');
        break;
      case 'recruiter':
        user = await Recruiter.findById(decoded.id).select('-passwordHash');
        break;
      case 'admin':
        user = await Admin.findById(decoded.id).select('-passwordHash');
        break;
      default:
        return res.status(401).json({ message: 'Invalid role' });
    }

    if (!user) {
      return res.status(401).json({ message: 'Token is not valid' });
    }

    req.user = user;
    req.userRole = decoded.role;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Token is not valid' });
  }
};

const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.userRole || !roles.includes(req.userRole)) {
      return res.status(403).json({ message: 'Access denied. Insufficient permissions.' });
    }
    next();
  };
};

module.exports = { auth, requireRole };
