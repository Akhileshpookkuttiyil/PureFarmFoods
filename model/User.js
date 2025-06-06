const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Define the User schema
const userSchema = new mongoose.Schema(
  {
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
      default: null,
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
      default: false,
    },
    deletedAt: {
      type: Date,
      required: false,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

// TTL index: Auto-delete 7 days after deletedAt is set, only if deleted = true
userSchema.index(
  { deletedAt: 1 },
  {
    expireAfterSeconds: 604800, // 7 days
    partialFilterExpression: { deleted: true },
  }
);

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
  this.deletedAt = new Date();
  return this.save();
};

// Restore a soft-deleted user
userSchema.methods.restoreUser = function () {
  this.deleted = false;
  this.deletedAt = null;
  return this.save();
};

// Block user
userSchema.methods.blockUser = function () {
  this.blocked = true;
  return this.save();
};

// Unblock user
userSchema.methods.unblockUser = function () {
  this.blocked = false;
  return this.save();
};

// Create and export the User model
const User = mongoose.model("User", userSchema);
module.exports = User;
