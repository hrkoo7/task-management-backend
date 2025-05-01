const nodemailer = require('nodemailer');
const logger = require('../config/logger');

const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

const sendTaskAssignmentEmail = async (email, taskTitle) => {
  try {
    if (process.env.NODE_ENV === 'test') {
      logger.info(`Simulated email to ${email}: New task "${taskTitle}" assigned`);
      return;
    }

    await transporter.sendMail({
      from: `Task Manager <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: 'New Task Assigned',
      html: `
        <h3>You've been assigned a new task</h3>
        <p><strong>Task Title:</strong> ${taskTitle}</p>
        <p>Please check your task dashboard for details.</p>
      `
    });
    logger.info(`Task assignment email sent to ${email}`);
  } catch (error) {
    logger.error(`Email send failed: ${error.message}`);
  }
};

const sendPasswordResetEmail = async (email, resetToken) => {
  // Implementation similar to above
};

module.exports = {
  sendTaskAssignmentEmail,
  sendPasswordResetEmail
};