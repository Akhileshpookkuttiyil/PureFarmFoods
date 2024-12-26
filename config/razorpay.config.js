const Razorpay = require("razorpay");
const dotenv = require("dotenv");

// Load environment variables from .env file
dotenv.config();

// Function to create a Razorpay instance
const CreateRazorPayInstance = () => {
  if (!process.env.KEY_ID || !process.env.KEY_SECRET) {
    throw new Error("Razorpay Key ID and Secret are required. Please set them in your .env file.");
  }

  return new Razorpay({
    key_id: process.env.KEY_ID,
    key_secret: process.env.KEY_SECRET,
  });
};

module.exports = CreateRazorPayInstance;
