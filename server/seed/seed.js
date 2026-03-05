const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import models
const Student = require('../models/Student');
const Recruiter = require('../models/Recruiter');
const College = require('../models/College');
const Job = require('../models/Job');
const Project = require('../models/Project');
const Hire = require('../models/Hire');
const Admin = require('../models/Admin');
const CalendarEvent = require('../models/CalendarEvent');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected for seeding');
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    console.log('🌱 Starting seed process...');

    // Clear existing data
    await Student.deleteMany({});
    await Recruiter.deleteMany({});
    await College.deleteMany({});
    await Job.deleteMany({});
    await Project.deleteMany({});
    await Hire.deleteMany({});
    await Admin.deleteMany({});
    await CalendarEvent.deleteMany({});

    console.log('🗑️  Cleared existing data');

    // Create colleges
    const colleges = [
      {
        name: 'Indian Institute of Technology Delhi',
        address: 'Hauz Khas, New Delhi, 110016',
        contactEmail: 'admin@iitd.ac.in',
        batches: [
          { year: 2024, studentIds: [] },
          { year: 2025, studentIds: [] },
          { year: 2026, studentIds: [] }
        ]
      },
      {
        name: 'Indian Institute of Technology Bombay',
        address: 'Powai, Mumbai, 400076',
        contactEmail: 'admin@iitb.ac.in',
        batches: [
          { year: 2024, studentIds: [] },
          { year: 2025, studentIds: [] }
        ]
      }
    ];

    const createdColleges = await College.insertMany(colleges);
    console.log('🏫 Created colleges');

    // Create admin
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = new Admin({
      name: 'System Admin',
      email: 'admin@beyondgrades.com',
      passwordHash: adminPassword,
      role: 'admin'
    });
    await admin.save();
    console.log('👤 Created admin');

    // Create students
    const studentPassword = await bcrypt.hash('password123', 10);
    const students = [
      {
        name: 'Rajesh Kumar',
        email: 'rajesh.kumar@iitd.ac.in',
        passwordHash: studentPassword,
        collegeId: createdColleges[0]._id,
        yearOfGraduation: 2024,
        phone: '+91-9876543210',
        degree: 'B.Tech',
        branch: 'Computer Science',
        dateOfBirth: new Date('2002-05-15'),
        cgpa: 8.7,
        linkedInUrl: 'https://linkedin.com/in/rajesh-kumar',
        collegeEmailVerified: true,
        roleTags: ['SDE', 'Full Stack Developer'],
        skills: [
          { name: 'JavaScript', level: 'expert', years: 3, confidence: 0.9 },
          { name: 'React', level: 'advanced', years: 2, confidence: 0.8 },
          { name: 'Node.js', level: 'advanced', years: 2, confidence: 0.8 },
          { name: 'Python', level: 'intermediate', years: 1, confidence: 0.6 }
        ],
        githubUrl: 'https://github.com/rajesh-kumar',
        portfolioUrl: 'https://rajesh-kumar.dev',
        visibility: { public: true, contactAllowed: true }
      },
      {
        name: 'Priya Sharma',
        email: 'priya.sharma@iitd.ac.in',
        passwordHash: studentPassword,
        collegeId: createdColleges[0]._id,
        yearOfGraduation: 2024,
        phone: '+91-9876543211',
        degree: 'B.Tech',
        branch: 'Mathematics and Computing',
        dateOfBirth: new Date('2002-08-22'),
        cgpa: 9.1,
        linkedInUrl: 'https://linkedin.com/in/priya-sharma',
        collegeEmailVerified: true,
        roleTags: ['Data Scientist', 'ML Engineer'],
        skills: [
          { name: 'Python', level: 'expert', years: 3, confidence: 0.9 },
          { name: 'Machine Learning', level: 'advanced', years: 2, confidence: 0.8 },
          { name: 'TensorFlow', level: 'intermediate', years: 1, confidence: 0.7 },
          { name: 'SQL', level: 'advanced', years: 2, confidence: 0.8 }
        ],
        githubUrl: 'https://github.com/priya-sharma',
        portfolioUrl: 'https://priya-sharma.dev',
        visibility: { public: true, contactAllowed: true }
      },
      {
        name: 'Amit Singh',
        email: 'amit.singh@iitd.ac.in',
        passwordHash: studentPassword,
        collegeId: createdColleges[0]._id,
        yearOfGraduation: 2025,
        phone: '+91-9876543212',
        degree: 'B.Tech',
        branch: 'Computer Science',
        dateOfBirth: new Date('2003-01-10'),
        cgpa: 8.4,
        linkedInUrl: 'https://linkedin.com/in/amit-singh',
        collegeEmailVerified: true,
        roleTags: ['Mobile Developer', 'iOS Developer'],
        skills: [
          { name: 'Swift', level: 'advanced', years: 2, confidence: 0.8 },
          { name: 'iOS Development', level: 'advanced', years: 2, confidence: 0.8 },
          { name: 'React Native', level: 'intermediate', years: 1, confidence: 0.6 },
          { name: 'JavaScript', level: 'intermediate', years: 1, confidence: 0.6 }
        ],
        githubUrl: 'https://github.com/amit-singh',
        visibility: { public: true, contactAllowed: true }
      },
      {
        name: 'Sneha Patel',
        email: 'sneha.patel@iitb.ac.in',
        passwordHash: studentPassword,
        collegeId: createdColleges[1]._id,
        yearOfGraduation: 2024,
        phone: '+91-9876543213',
        degree: 'B.Tech',
        branch: 'Electrical Engineering',
        dateOfBirth: new Date('2002-11-05'),
        cgpa: 8.9,
        linkedInUrl: 'https://linkedin.com/in/sneha-patel',
        collegeEmailVerified: true,
        roleTags: ['DevOps Engineer', 'Cloud Engineer'],
        skills: [
          { name: 'AWS', level: 'advanced', years: 2, confidence: 0.8 },
          { name: 'Docker', level: 'advanced', years: 2, confidence: 0.8 },
          { name: 'Kubernetes', level: 'intermediate', years: 1, confidence: 0.7 },
          { name: 'Python', level: 'intermediate', years: 1, confidence: 0.6 }
        ],
        githubUrl: 'https://github.com/sneha-patel',
        visibility: { public: true, contactAllowed: true }
      },
      {
        name: 'Vikram Reddy',
        email: 'vikram.reddy@iitd.ac.in',
        passwordHash: studentPassword,
        collegeId: createdColleges[0]._id,
        yearOfGraduation: 2025,
        phone: '+91-9876543214',
        degree: 'B.Tech',
        branch: 'Computer Science',
        dateOfBirth: new Date('2003-03-18'),
        cgpa: 8.2,
        linkedInUrl: 'https://linkedin.com/in/vikram-reddy',
        collegeEmailVerified: true,
        roleTags: ['Backend Developer', 'API Developer'],
        skills: [
          { name: 'Java', level: 'advanced', years: 2, confidence: 0.8 },
          { name: 'Spring Boot', level: 'advanced', years: 2, confidence: 0.8 },
          { name: 'SQL', level: 'advanced', years: 2, confidence: 0.8 },
          { name: 'Microservices', level: 'intermediate', years: 1, confidence: 0.6 }
        ],
        githubUrl: 'https://github.com/vikram-reddy',
        visibility: { public: true, contactAllowed: true }
      },
      {
        name: 'Ananya Gupta',
        email: 'ananya.gupta@iitb.ac.in',
        passwordHash: studentPassword,
        collegeId: createdColleges[1]._id,
        yearOfGraduation: 2024,
        phone: '+91-9876543215',
        degree: 'B.Tech',
        branch: 'Computer Science',
        dateOfBirth: new Date('2002-07-30'),
        cgpa: 9.0,
        linkedInUrl: 'https://linkedin.com/in/ananya-gupta',
        collegeEmailVerified: true,
        roleTags: ['Frontend Developer', 'UI/UX Developer'],
        skills: [
          { name: 'React', level: 'expert', years: 3, confidence: 0.9 },
          { name: 'JavaScript', level: 'expert', years: 3, confidence: 0.9 },
          { name: 'CSS', level: 'advanced', years: 2, confidence: 0.8 },
          { name: 'TypeScript', level: 'intermediate', years: 1, confidence: 0.7 }
        ],
        githubUrl: 'https://github.com/ananya-gupta',
        visibility: { public: true, contactAllowed: true }
      },
      {
        name: 'Rahul Verma',
        email: 'rahul.verma@iitd.ac.in',
        passwordHash: studentPassword,
        collegeId: createdColleges[0]._id,
        yearOfGraduation: 2025,
        phone: '+91-9876543216',
        degree: 'B.Tech',
        branch: 'Computer Science',
        dateOfBirth: new Date('2003-04-12'),
        cgpa: 8.5,
        linkedInUrl: 'https://linkedin.com/in/rahul-verma',
        collegeEmailVerified: true,
        roleTags: ['Blockchain Developer', 'Smart Contract Developer'],
        skills: [
          { name: 'Solidity', level: 'advanced', years: 2, confidence: 0.8 },
          { name: 'Ethereum', level: 'advanced', years: 2, confidence: 0.8 },
          { name: 'Web3', level: 'intermediate', years: 1, confidence: 0.7 },
          { name: 'JavaScript', level: 'advanced', years: 2, confidence: 0.8 }
        ],
        githubUrl: 'https://github.com/rahul-verma',
        visibility: { public: true, contactAllowed: true }
      },
      {
        name: 'Kavya Nair',
        email: 'kavya.nair@iitb.ac.in',
        passwordHash: studentPassword,
        collegeId: createdColleges[1]._id,
        yearOfGraduation: 2026,
        phone: '+91-9876543217',
        degree: 'B.Tech',
        branch: 'Computer Science',
        dateOfBirth: new Date('2004-02-28'),
        cgpa: 8.8,
        linkedInUrl: 'https://linkedin.com/in/kavya-nair',
        collegeEmailVerified: true,
        roleTags: ['Cybersecurity Analyst', 'Security Engineer'],
        skills: [
          { name: 'Cybersecurity', level: 'advanced', years: 2, confidence: 0.8 },
          { name: 'Python', level: 'advanced', years: 2, confidence: 0.8 },
          { name: 'Network Security', level: 'intermediate', years: 1, confidence: 0.7 },
          { name: 'Linux', level: 'advanced', years: 2, confidence: 0.8 }
        ],
        githubUrl: 'https://github.com/kavya-nair',
        visibility: { public: true, contactAllowed: true }
      },
      {
        name: 'Arjun Mehta',
        email: 'arjun.mehta@iitd.ac.in',
        passwordHash: studentPassword,
        collegeId: createdColleges[0]._id,
        yearOfGraduation: 2024,
        phone: '+91-9876543218',
        degree: 'B.Tech',
        branch: 'Computer Science',
        dateOfBirth: new Date('2002-09-14'),
        cgpa: 8.3,
        linkedInUrl: 'https://linkedin.com/in/arjun-mehta',
        collegeEmailVerified: true,
        roleTags: ['Game Developer', 'Unity Developer'],
        skills: [
          { name: 'Unity', level: 'expert', years: 3, confidence: 0.9 },
          { name: 'C#', level: 'advanced', years: 2, confidence: 0.8 },
          { name: 'Game Design', level: 'intermediate', years: 1, confidence: 0.7 },
          { name: '3D Modeling', level: 'beginner', years: 0, confidence: 0.5 }
        ],
        githubUrl: 'https://github.com/arjun-mehta',
        visibility: { public: true, contactAllowed: true }
      },
      {
        name: 'Sakshi Joshi',
        email: 'sakshi.joshi@iitb.ac.in',
        passwordHash: studentPassword,
        collegeId: createdColleges[1]._id,
        yearOfGraduation: 2025,
        phone: '+91-9876543219',
        degree: 'B.Tech',
        branch: 'Electrical Engineering',
        dateOfBirth: new Date('2003-06-20'),
        cgpa: 9.2,
        linkedInUrl: 'https://linkedin.com/in/sakshi-joshi',
        collegeEmailVerified: true,
        roleTags: ['AI Engineer', 'ML Engineer'],
        skills: [
          { name: 'Python', level: 'expert', years: 3, confidence: 0.9 },
          { name: 'Machine Learning', level: 'expert', years: 3, confidence: 0.9 },
          { name: 'Deep Learning', level: 'advanced', years: 2, confidence: 0.8 },
          { name: 'TensorFlow', level: 'advanced', years: 2, confidence: 0.8 },
          { name: 'PyTorch', level: 'intermediate', years: 1, confidence: 0.7 }
        ],
        githubUrl: 'https://github.com/sakshi-joshi',
        visibility: { public: true, contactAllowed: true }
      },
      {
        name: 'Rohan Kapoor',
        email: 'rohan.kapoor@iitd.ac.in',
        passwordHash: studentPassword,
        collegeId: createdColleges[0]._id,
        yearOfGraduation: 2026,
        phone: '+91-9876543220',
        degree: 'B.Tech',
        branch: 'Computer Science',
        dateOfBirth: new Date('2004-10-08'),
        cgpa: 8.6,
        linkedInUrl: 'https://linkedin.com/in/rohan-kapoor',
        collegeEmailVerified: true,
        roleTags: ['Full Stack Developer', 'Web Developer'],
        skills: [
          { name: 'JavaScript', level: 'expert', years: 3, confidence: 0.9 },
          { name: 'React', level: 'expert', years: 3, confidence: 0.9 },
          { name: 'Node.js', level: 'advanced', years: 2, confidence: 0.8 },
          { name: 'MongoDB', level: 'advanced', years: 2, confidence: 0.8 },
          { name: 'Express', level: 'advanced', years: 2, confidence: 0.8 }
        ],
        githubUrl: 'https://github.com/rohan-kapoor',
        visibility: { public: true, contactAllowed: true }
      },
      {
        name: 'Neha Agarwal',
        email: 'neha.agarwal@iitb.ac.in',
        passwordHash: studentPassword,
        collegeId: createdColleges[1]._id,
        yearOfGraduation: 2024,
        phone: '+91-9876543221',
        degree: 'B.Tech',
        branch: 'Mathematics and Computing',
        dateOfBirth: new Date('2002-12-01'),
        cgpa: 9.3,
        linkedInUrl: 'https://linkedin.com/in/neha-agarwal',
        collegeEmailVerified: true,
        roleTags: ['Data Engineer', 'Big Data Engineer'],
        skills: [
          { name: 'Python', level: 'expert', years: 3, confidence: 0.9 },
          { name: 'Apache Spark', level: 'advanced', years: 2, confidence: 0.8 },
          { name: 'Hadoop', level: 'intermediate', years: 1, confidence: 0.7 },
          { name: 'SQL', level: 'expert', years: 3, confidence: 0.9 },
          { name: 'Kafka', level: 'intermediate', years: 1, confidence: 0.7 }
        ],
        githubUrl: 'https://github.com/neha-agarwal',
        visibility: { public: true, contactAllowed: true }
      },
      {
        name: 'Vikash Kumar',
        email: 'vikash.kumar@iitd.ac.in',
        passwordHash: studentPassword,
        collegeId: createdColleges[0]._id,
        yearOfGraduation: 2025,
        phone: '+91-9876543222',
        degree: 'B.Tech',
        branch: 'Computer Science',
        dateOfBirth: new Date('2003-07-25'),
        cgpa: 8.9,
        linkedInUrl: 'https://linkedin.com/in/vikash-kumar',
        collegeEmailVerified: true,
        roleTags: ['Cloud Engineer', 'DevOps Engineer'],
        skills: [
          { name: 'AWS', level: 'expert', years: 3, confidence: 0.9 },
          { name: 'Docker', level: 'expert', years: 3, confidence: 0.9 },
          { name: 'Kubernetes', level: 'advanced', years: 2, confidence: 0.8 },
          { name: 'Terraform', level: 'intermediate', years: 1, confidence: 0.7 },
          { name: 'Python', level: 'advanced', years: 2, confidence: 0.8 }
        ],
        githubUrl: 'https://github.com/vikash-kumar',
        visibility: { public: true, contactAllowed: true }
      }
    ];

    const createdStudents = await Student.insertMany(students);
    console.log('👥 Created students');

    // Update college batches with student IDs
    for (let i = 0; i < createdStudents.length; i++) {
      const student = createdStudents[i];
      const college = createdColleges.find(c => c._id.toString() === student.collegeId.toString());
      if (college) {
        const batch = college.batches.find(b => b.year === student.yearOfGraduation);
        if (batch) {
          batch.studentIds.push(student._id);
        }
      }
    }
    await College.bulkSave(createdColleges);
    console.log('📚 Updated college batches');

    // Create projects
    const projects = [
      {
        studentId: createdStudents[0]._id,
        title: 'E-commerce Platform',
        description: 'Full-stack e-commerce platform built with React, Node.js, and MongoDB. Features include user authentication, product catalog, shopping cart, and payment integration.',
        domainTags: ['web development', 'e-commerce'],
        skillTags: ['JavaScript', 'React', 'Node.js', 'MongoDB', 'Express'],
        repoUrl: 'https://github.com/rajesh-kumar/ecommerce-platform',
        demoUrl: 'https://ecommerce-demo.herokuapp.com',
        role: 'Full Stack Developer',
        contributions: ['Designed database schema', 'Implemented user authentication', 'Built payment integration'],
        evidenceScore: 0.85
      },
      {
        studentId: createdStudents[1]._id,
        title: 'Machine Learning Model for Stock Prediction',
        description: 'Developed a machine learning model using Python and TensorFlow to predict stock prices. Implemented LSTM neural networks and achieved 85% accuracy.',
        domainTags: ['data science', 'machine learning'],
        skillTags: ['Python', 'Machine Learning', 'TensorFlow', 'Pandas', 'NumPy'],
        repoUrl: 'https://github.com/priya-sharma/stock-prediction',
        demoUrl: 'https://stock-prediction-demo.herokuapp.com',
        role: 'Data Scientist',
        contributions: ['Data preprocessing', 'Model training', 'Performance optimization'],
        evidenceScore: 0.90
      },
      {
        studentId: createdStudents[2]._id,
        title: 'iOS Weather App',
        description: 'Native iOS weather application built with Swift and SwiftUI. Features real-time weather data, location services, and beautiful UI design.',
        domainTags: ['mobile development', 'iOS'],
        skillTags: ['Swift', 'iOS Development', 'SwiftUI', 'Core Location'],
        repoUrl: 'https://github.com/amit-singh/weather-app',
        demoUrl: 'https://apps.apple.com/weather-app',
        role: 'iOS Developer',
        contributions: ['UI/UX design', 'API integration', 'Location services'],
        evidenceScore: 0.80
      }
    ];

    const createdProjects = await Project.insertMany(projects);
    console.log('📁 Created projects');

    // Update students with project references
    for (let i = 0; i < createdProjects.length; i++) {
      const project = createdProjects[i];
      const student = createdStudents.find(s => s._id.toString() === project.studentId.toString());
      if (student) {
        student.projects.push(project._id);
      }
    }
    await Student.bulkSave(createdStudents);
    console.log('🔗 Linked projects to students');

    // Create recruiters
    const recruiterPassword = await bcrypt.hash('password123', 10);
    const recruiters = [
      {
        name: 'John Smith',
        email: 'john.smith@techcorp.com',
        passwordHash: recruiterPassword,
        companyName: 'TechCorp Solutions',
        companyWebsite: 'https://techcorp.com',
        companySize: '51-200',
        industry: 'Technology',
        companyDescription: 'Enterprise software and cloud solutions provider. We build products that help businesses scale globally.',
        contactPhone: '+1-555-0100',
        jobTitle: 'Senior Talent Acquisition Manager',
        linkedInUrl: 'https://linkedin.com/in/johnsmith',
        verified: true
      },
      {
        name: 'Sarah Johnson',
        email: 'sarah.johnson@innovate.com',
        passwordHash: recruiterPassword,
        companyName: 'InnovateTech',
        companyWebsite: 'https://innovate.com',
        companySize: '11-50',
        industry: 'Technology',
        companyDescription: 'AI and machine learning startup focused on NLP and computer vision. Series A funded.',
        contactPhone: '+1-555-0101',
        jobTitle: 'HR Lead',
        linkedInUrl: 'https://linkedin.com/in/sarahjohnson',
        verified: true
      },
      {
        name: 'Mike Wilson',
        email: 'mike.wilson@startup.com',
        passwordHash: recruiterPassword,
        companyName: 'StartupXYZ',
        companyWebsite: 'https://startup.com',
        companySize: '1-10',
        industry: 'E-commerce',
        companyDescription: 'Early-stage e-commerce platform for sustainable products.',
        contactPhone: '+1-555-0102',
        jobTitle: 'Founder & Recruiter',
        linkedInUrl: 'https://linkedin.com/in/mikewilson',
        verified: false
      }
    ];

    const createdRecruiters = await Recruiter.insertMany(recruiters);
    console.log('💼 Created recruiters');

    // Create jobs
    const jobs = [
      {
        recruiterId: createdRecruiters[0]._id,
        title: 'Senior Software Engineer',
        description: 'We are looking for a Senior Software Engineer to join our team. You will be responsible for developing and maintaining our web applications using modern technologies.',
        domain: 'web development',
        requiredSkills: [
          { name: 'JavaScript', requiredLevel: 'advanced', weight: 1.0 },
          { name: 'React', requiredLevel: 'advanced', weight: 0.8 },
          { name: 'Node.js', requiredLevel: 'intermediate', weight: 0.6 }
        ],
        optionalSkills: ['TypeScript', 'AWS', 'Docker'],
        minExperienceYears: 2,
        locationType: 'hybrid',
        batchTarget: [2024, 2025],
        shortlistSettings: {
          topN: 10,
          weights: { domain: 0.30, skill: 0.45, expertise: 0.25 }
        }
      },
      {
        recruiterId: createdRecruiters[1]._id,
        title: 'Data Scientist',
        description: 'Join our data science team to build machine learning models and analyze large datasets. Experience with Python, ML frameworks, and statistical analysis required.',
        domain: 'data science',
        requiredSkills: [
          { name: 'Python', requiredLevel: 'advanced', weight: 1.0 },
          { name: 'Machine Learning', requiredLevel: 'advanced', weight: 0.9 },
          { name: 'SQL', requiredLevel: 'intermediate', weight: 0.7 }
        ],
        optionalSkills: ['TensorFlow', 'PyTorch', 'AWS'],
        minExperienceYears: 1,
        locationType: 'remote',
        batchTarget: [2024, 2025],
        shortlistSettings: {
          topN: 8,
          weights: { domain: 0.30, skill: 0.45, expertise: 0.25 }
        }
      }
    ];

    const createdJobs = await Job.insertMany(jobs);
    console.log('💼 Created jobs');

    // Update recruiters with job references
    for (let i = 0; i < createdJobs.length; i++) {
      const job = createdJobs[i];
      const recruiter = createdRecruiters.find(r => r._id.toString() === job.recruiterId.toString());
      if (recruiter) {
        recruiter.postedJobs.push(job._id);
      }
    }
    await Recruiter.bulkSave(createdRecruiters);
    console.log('🔗 Linked jobs to recruiters');

    // Create a hire record (for testing anti-moonlighting)
    const hire = new Hire({
      studentId: createdStudents[0]._id, // Rajesh Kumar
      jobId: createdJobs[0]._id,
      recruiterId: createdRecruiters[0]._id,
      company: 'TechCorp Solutions',
      active: true
    });
    await hire.save();
    console.log('✅ Created hire record (for testing exclusions)');

    // Create calendar events for first student (Rajesh)
    const baseDate = new Date();
    const inDays = (d) => new Date(baseDate.getTime() + d * 24 * 60 * 60 * 1000);
    const calendarEvents = [
      {
        studentId: createdStudents[0]._id,
        title: 'Offer - Senior Software Engineer',
        type: 'offer',
        start: inDays(1),
        offerStage: 'pending',
        offerDeadline: inDays(2),
        company: 'TechCorp Solutions',
        jobId: createdJobs[0]._id,
        compensationSummary: 'CTC 18–22 LPA, signing bonus',
        recruiterContact: 'john.smith@techcorp.com'
      },
      {
        studentId: createdStudents[0]._id,
        title: 'HR Screen - Senior Software Engineer',
        type: 'interview',
        start: inDays(5),
        end: inDays(5),
        company: 'TechCorp Solutions',
        jobId: createdJobs[0]._id,
        roundType: 'HR',
        roundIndex: 1,
        durationMinutes: 45,
        joinLink: 'https://meet.google.com/abc-defg-hij',
        location: 'Google Meet'
      },
      {
        studentId: createdStudents[0]._id,
        title: 'Tech Round - Senior Software Engineer',
        type: 'interview',
        start: inDays(12),
        end: inDays(12),
        company: 'TechCorp Solutions',
        jobId: createdJobs[0]._id,
        roundType: 'Tech',
        roundIndex: 2,
        durationMinutes: 60,
        joinLink: 'https://zoom.us/j/123456789',
        location: 'Zoom'
      },
      {
        studentId: createdStudents[0]._id,
        title: 'Application deadline - Data Scientist',
        type: 'deadline',
        start: inDays(3),
        company: 'InnovateTech',
        jobId: createdJobs[1]._id,
        notes: 'Submit portfolio and cover letter'
      },
      {
        studentId: createdStudents[0]._id,
        title: 'Campus placement briefing',
        type: 'campus',
        start: inDays(7),
        end: inDays(7),
        location: 'Main auditorium',
        notes: 'TPO session for 2024 batch'
      },
      {
        studentId: createdStudents[0]._id,
        title: 'Midterm exams',
        type: 'block',
        start: inDays(10),
        end: inDays(14),
        isBlocked: true,
        notes: 'No interviews this week'
      }
    ];
    await CalendarEvent.insertMany(calendarEvents);
    console.log('📅 Created calendar events');

    console.log('🎉 Seed data created successfully!');
    console.log('\n📊 Summary:');
    console.log(`- ${createdColleges.length} colleges`);
    console.log(`- ${createdStudents.length} students`);
    console.log(`- ${createdProjects.length} projects`);
    console.log(`- ${createdRecruiters.length} recruiters`);
    console.log(`- ${createdJobs.length} jobs`);
    console.log(`- ${calendarEvents.length} calendar events`);
    console.log(`- 1 admin`);
    console.log(`- 1 hire record`);
    
    console.log('\n🔑 Test Accounts:');
    console.log('Students: rajesh.kumar@iitd.ac.in, priya.sharma@iitd.ac.in, etc. (password: password123)');
    console.log('Recruiters: john.smith@techcorp.com, sarah.johnson@innovate.com (password: password123)');
    console.log('Admin: admin@beyondgrades.com (password: admin123)');

  } catch (error) {
    console.error('❌ Seed error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
};

// Run seed
connectDB().then(() => {
  seedData();
});
