const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Define the User schema
const userSchema = new mongoose.Schema({
  imageUrl: {
    type: String,
    required: false, // Making this required
  },
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
    enum: ["male", "female", "other"],
    required: false, // Not required during signup
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phone: {
    type: String,
    required: false, // optional
    index: { unique: true, sparse: true }, // Use a sparse unique index
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["user", "admin", "seller"], // Include 'seller' as a possible role
    default: "user", // Default role is 'user'
  },
  seller: {
    type: Schema.Types.ObjectId,
    ref: "Seller",
  },
  blocked: {
    type: Boolean,
    default: false,
  },
  // Add these fields for email verification
  emailVerificationToken: {
    type: String,
    required: false,
  },
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  emailVerificationTokenExpiresAt: {
    type: Date,
    required: false, // Not required until the token is created
  },
});

// Middleware to update the `updatedAt` field before saving the document
userSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

// Method to check if user is admin
userSchema.methods.isAdmin = function () {
  return this.role === "admin";
};

// Method to check if user is seller
userSchema.methods.isSeller = function () {
  return this.role === "seller";
};

userSchema.methods.blockUser = function () {
  this.blocked = true;
  return this.save();
};

userSchema.methods.unblockUser = function () {
  this.blocked = false;
  return this.save();
};

// Create the User model
const User = mongoose.model("User", userSchema);

// Export the User model
module.exports = User;
