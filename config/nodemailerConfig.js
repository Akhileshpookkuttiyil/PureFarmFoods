//nodemailrConfig.js

require("dotenv").config(); // Load environment variables from .env file
const nodemailer = require("nodemailer");

// Create a transporter object using your email service configuration
const transporter = nodemailer.createTransport({
  service: "gmail", // You can use other services like Yahoo, Outlook, etc.
  auth: {
    user: process.env.SMTP_USER, // Your email address from the .env file
    pass: process.env.SMTP_PASS, // Your email password (or app-specific password) from the .env file
  },
});

// Function to send verification email
const sendVerificationEmail = (to, verificationLink) => {
  const mailOptions = {
    from: process.env.EMAIL_USER, // Sender address from the .env file
    to: to, // List of recipients
    subject: "Email Verification", // Subject line
    text: `Please verify your new email address by clicking the following link: ${verificationLink}`, // Plain text body
  };

  return transporter.sendMail(mailOptions);
};

// Export the transporter and the sendVerificationEmail function
module.exports = { transporter, sendVerificationEmail };
