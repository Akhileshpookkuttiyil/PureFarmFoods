const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Define the User schema
const userSchema = new mongoose.Schema({
  imageUrl: {
    type: String,
    required: false,
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
    required: false,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phone: {
    type: String,
    required: false,
    index: { unique: true, sparse: true },
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["user", "admin", "seller"],
    default: "user",
  },
  seller: {
    type: Schema.Types.ObjectId,
    ref: "Seller",
  },
  blocked: {
    type: Boolean,
    default: false,
  },
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
    required: false,
  },
  
  // Soft delete fields
  deleted: {
    type: Boolean,
    default: false,  // Default to false, meaning the user is not deleted
  },
  deletedAt: {
    type: Date,
    required: false, // This will be populated when the user is marked as deleted
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

// Soft delete method
userSchema.methods.softDelete = function () {
  this.deleted = true;
  this.deletedAt = new Date();  // Record the time of deletion
  return this.save();
};

// Method to restore a soft-deleted user
userSchema.methods.restoreUser = function () {
  this.deleted = false;
  this.deletedAt = null;  // Clear the deletion timestamp
  return this.save();
};

// Method to block the user
userSchema.methods.blockUser = function () {
  this.blocked = true;
  return this.save();
};

// Method to unblock the user
userSchema.methods.unblockUser = function () {
  this.blocked = false;
  return this.save();
};

// Create the User model
const User = mongoose.model("User", userSchema);

// Export the User model
module.exports = User;
