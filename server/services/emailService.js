const nodemailer = require('nodemailer');

const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

const sendVerificationEmail = async (email, name, verificationToken) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: email,
      subject: 'Beyond Grades - Email Verification',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2E5D62;">Welcome to Beyond Grades, ${name}!</h2>
          <p>Please verify your email address by clicking the link below:</p>
          <a href="${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}" 
             style="background-color: #2E5D62; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Verify Email
          </a>
          <p>If you didn't create an account, please ignore this email.</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Verification email sent successfully');
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw error;
  }
};

const sendInterviewInvite = async (email, studentName, jobTitle, companyName, interviewDetails) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: email,
      subject: `Interview Invitation - ${jobTitle} at ${companyName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2E5D62;">Interview Invitation</h2>
          <p>Dear ${studentName},</p>
          <p>Congratulations! You have been shortlisted for the position of <strong>${jobTitle}</strong> at <strong>${companyName}</strong>.</p>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3>Interview Details:</h3>
            <p><strong>Date:</strong> ${interviewDetails.date || 'TBD'}</p>
            <p><strong>Time:</strong> ${interviewDetails.time || 'TBD'}</p>
            <p><strong>Location:</strong> ${interviewDetails.location || 'TBD'}</p>
            <p><strong>Type:</strong> ${interviewDetails.type || 'TBD'}</p>
          </div>
          <p>Please confirm your availability by logging into your Beyond Grades account.</p>
          <a href="${process.env.FRONTEND_URL}/student/calendar" 
             style="background-color: #2E5D62; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
            View Calendar
          </a>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Interview invite email sent successfully');
  } catch (error) {
    console.error('Error sending interview invite:', error);
    throw error;
  }
};

const sendHiredNotification = async (email, studentName, jobTitle, companyName) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.SMTP_USER,
      to: email,
      subject: `Congratulations! You've been hired - ${jobTitle} at ${companyName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2E5D62;">Congratulations, ${studentName}!</h2>
          <p>Great news! You have been selected for the position of <strong>${jobTitle}</strong> at <strong>${companyName}</strong>.</p>
          <p>We're excited to have you join the team. Please check your Beyond Grades account for next steps and onboarding information.</p>
          <a href="${process.env.FRONTEND_URL}/student/dashboard" 
             style="background-color: #2E5D62; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
            View Dashboard
          </a>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Hired notification email sent successfully');
  } catch (error) {
    console.error('Error sending hired notification:', error);
    throw error;
  }
};

module.exports = {
  sendVerificationEmail,
  sendInterviewInvite,
  sendHiredNotification
};
