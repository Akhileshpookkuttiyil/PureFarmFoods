const nodemailer = require('nodemailer');
const crypto = require('crypto');
const User = require('../model/User'); // Adjust to your user model path
const otpStore = {}; // Temporary store for OTPs; consider using a database in production

// Configure Nodemailer
const transporter = nodemailer.createTransport({
    service: 'Gmail', // You can use other email services
    auth: {
        user: process.env.SMTP_USER, // Your email
        pass: process.env.SMTP_PASS, // Your email password
    },
});

// Generate OTP
function generateOTP() {
    return crypto.randomInt(100000, 999999); // 6-digit random number
}

// Send OTP email
exports.sendOTP = async (req, res) => {
    const { email } = req.body;

    try {
        const otp = generateOTP();
        otpStore[email] = otp; // Save OTP for the email in memory

        // Email details
        const mailOptions = {
            from: process.env.SMTP_USER, // Use the SMTP_USER for the "from" field
            to: email,
            subject: 'Your OTP for Email Verification',
            text: `Your OTP is: ${otp}. It is valid for 10 minutes.`,
        };

        // Send the email
        await transporter.sendMail(mailOptions);
        res.status(200).json({ success: true, message: 'OTP sent to email.' });
    } catch (error) {
        console.error('Error sending OTP:', error);
        res.status(500).json({ success: false, message: 'Failed to send OTP.' });
    }
};

// Verify OTP
exports.verifyOTP = async (req, res) => {
    const { email, otp } = req.body;

    try {
        // Check if the OTP exists and matches
        if (otpStore[email] && otpStore[email].toString() === otp.toString()) {
            delete otpStore[email]; // OTP verified, remove it from the store
            res.status(200).json({ success: true, message: 'OTP verified successfully.' });
        } else {
            res.status(400).json({ success: false, message: 'Invalid or expired OTP.' });
        }
    } catch (error) {
        console.error('Error verifying OTP:', error);
        res.status(500).json({ success: false, message: 'Failed to verify OTP.' });
    }
};

// Send Email Verification Token
exports.sendVerificationEmail = async (req, res) => {
    const { email } = req.body;
    try {
        const token = crypto.randomBytes(32).toString('hex'); // Generate email verification token
        const expiresAt = Date.now() + 60 * 60 * 1000; // 1 hour expiration time

        // Save token and expiration to the user model
        await User.updateOne(
            { email },
            { emailVerificationToken: token, emailVerificationTokenExpiresAt: expiresAt }
        );

        const verificationLink = `${req.protocol}://${req.get('host')}/user/verify-email/${token}`;

        const mailOptions = {
            from: process.env.EMAIL,
            to: email,
            subject: 'Email Verification',
            html: `<p>Click <a href="${verificationLink}">here</a> to verify your email.</p>`,
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({ success: true, message: 'Verification email sent.' });
    } catch (error) {
        console.error('Error sending verification email:', error);
        res.status(500).json({ success: false, message: 'Failed to send verification email.' });
    }
};


// Verify Email from Token
exports.verifyEmailToken = async (req, res) => {
    const { token } = req.params;

    try {
        const user = await User.findOne({ emailVerificationToken: token });

        console.log("User found:", user); // Debug log

        if (!user) {
            console.log("Token not found"); // Debug log
            return res.status(400).json({ success: false, message: 'Invalid or expired token.' });
        }

        // Check if the token has expired
        if (!user.emailVerificationTokenExpiresAt || Date.now() > user.emailVerificationTokenExpiresAt) {
            console.log("Token expired"); // Debug log
            return res.status(400).json({ success: false, message: 'Invalid or expired token.' });
        }

        // Update user's email verification status
        user.isEmailVerified = true;
        user.emailVerificationToken = null; // Clear the token after verification
        user.emailVerificationTokenExpiresAt = null; // Clear the expiration time
        await user.save();

        res.status(200).json({ success: true, message: 'Email verified successfully.' });
    } catch (error) {
        console.error('Error verifying email:', error);
        res.status(500).json({ success: false, message: 'Failed to verify email.' });
    }
};

