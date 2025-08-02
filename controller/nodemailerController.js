const nodemailer = require("nodemailer");
const crypto = require("crypto");
const User = require("../model/User");

const otpStore = {}; // Replace with Redis or DB in production

// Configure Nodemailer
const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Generate 6-digit OTP
function generateOTP() {
  return crypto.randomInt(100000, 999999);
}

// Send OTP
exports.sendOTP = async (req, res) => {
  const email = req.body.email?.toLowerCase();

  if (!email) {
    return res
      .status(400)
      .json({ success: false, message: "Email is required." });
  }

  try {
    const otp = generateOTP();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 mins

    otpStore[email] = { otp, expiresAt, attempts: 0 };

    const mailOptions = {
      from: `"PureFarmFoods-TM Support" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Your OTP for PureFarmFoods-TM Verification",
      html: `<p>Your OTP is: <strong>${otp}</strong></p><p>This OTP is valid for 10 minutes.</p>`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ success: true, message: "OTP sent to email." });
  } catch (error) {
    console.error("Error sending OTP:", error);
    res.status(500).json({ success: false, message: "Unable to send OTP." });
  }
};

// Verify OTP
exports.verifyOTP = async (req, res) => {
  const email = req.body.email?.toLowerCase();
  const otp = req.body.otp?.toString();

  if (!email || !otp) {
    return res
      .status(400)
      .json({ success: false, message: "Email and OTP are required." });
  }

  try {
    const storedData = otpStore[email];

    if (!storedData) {
      return res
        .status(400)
        .json({ success: false, message: "No OTP found for this email." });
    }

    if (storedData.attempts >= 5) {
      return res.status(429).json({
        success: false,
        message: "Too many failed attempts. Please request a new OTP.",
      });
    }

    storedData.attempts++;

    if (
      Date.now() > storedData.expiresAt ||
      storedData.otp.toString() !== otp
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired OTP." });
    }

    delete otpStore[email]; // OTP verified
    res
      .status(200)
      .json({ success: true, message: "OTP verified successfully." });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res
      .status(500)
      .json({ success: false, message: "OTP verification failed." });
  }
};

// Send Email Verification Link
exports.sendVerificationEmail = async (req, res) => {
  console.log(req.body);
  const { email: newEmail } = req.body;

  if (!newEmail) {
    return res
      .status(400)
      .json({ success: false, message: "New email is required." });
  }

  // You need to get current logged-in user (assuming session stores user id)
  const userId = req.session?.user?._id;
  if (!userId) {
    return res.status(401).json({ success: false, message: "Unauthorized." });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found." });
    }

    const currentEmailLower = user.email?.toLowerCase();
    const emailToUse = newEmail.toLowerCase();

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = Date.now() + 60 * 60 * 1000; // 1 hour

    if (currentEmailLower) {
      // Update existing user's email
      user.pendingEmail = emailToUse;
      user.emailVerificationToken = token;
      user.emailVerificationTokenExpiresAt = expiresAt;
      await user.save();
    } else {
      // Registration flow (user may not exist yet)
      await User.updateOne(
        { email: emailToUse },
        {
          emailVerificationToken: token,
          emailVerificationTokenExpiresAt: expiresAt,
        },
        { upsert: true }
      );
    }

    const verificationLink = `${req.protocol}://${req.get(
      "host"
    )}/user/verify-email/${token}`;

    const mailOptions = {
      from: `"PureFarmFoods-TM Support" <${process.env.SMTP_USER}>`,
      to: emailToUse,
      subject: "PureFarmFoods-TM Email Verification",
      html: `
        <p>Welcome to PureFarmFoods-TM!</p>
        <p>Please click the link below to verify your email:</p>
        <p><a href="${verificationLink}">Verify Email</a></p>
        <p>This link is valid for 1 hour.</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    res
      .status(200)
      .json({ success: true, message: "Verification email sent." });
  } catch (error) {
    console.error("Error sending verification email:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to send verification email." });
  }
};

// Verify Email by Token
exports.verifyEmailToken = async (req, res) => {
  const { token } = req.params;

  if (!token) {
    return res
      .status(400)
      .json({ success: false, message: "Token is required." });
  }

  try {
    const user = await User.findOne({ emailVerificationToken: token });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired token." });
    }

    if (
      !user.emailVerificationTokenExpiresAt ||
      Date.now() > user.emailVerificationTokenExpiresAt
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Token has expired." });
    }

    // If pendingEmail exists, it's an email update
    if (user.pendingEmail) {
      user.email = user.pendingEmail;
      user.pendingEmail = null;
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationTokenExpiresAt = null;
    await user.save();

    res
      .status(200)
      .json({ success: true, message: "Email verified successfully." });
  } catch (error) {
    console.error("Error verifying email:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to verify email." });
  }
};
