const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Cart = require("./Cart");
const Order = require("./Order");
const Wishlist = require("./wishlist");

// Define the User schema
const userSchema = new mongoose.Schema(
  {
    imageUrl: {
      type: String,
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
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      required: true,
    },
    pendingEmail: {
      type: String,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
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
    },
    emailVerificationTokenExpiresAt: {
      type: Date,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    // Soft delete fields
    deleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// TTL index: Auto-delete documents
userSchema.index(
  { deletedAt: 1 },
  {
    expireAfterSeconds: 60, // 1 minute in seconds
    partialFilterExpression: { deleted: true },
  }
);

// Index for email verification token (for fast lookups)
userSchema.index({ emailVerificationToken: 1 });

// Check if user is admin
userSchema.methods.isAdmin = function () {
  return this.role === "admin";
};

// Check if user is seller
userSchema.methods.isSeller = function () {
  return this.role === "seller";
};

// Soft delete modified to cleanup related data
userSchema.methods.softDelete = async function () {
  const deletedAt = new Date();

  this.deleted = true;
  this.deletedAt = deletedAt;

  try {
    await Promise.all([
      Cart.updateMany({ user: this._id }, { deleted: true, deletedAt }),
      Wishlist.updateMany({ user: this._id }, { deleted: true, deletedAt }),
      Order.updateMany({ user: this._id }, { deleted: true, deletedAt }),
    ]);

    return await this.save();
  } catch (err) {
    console.error("Soft delete failed:", err);
    throw err;
  }
};

userSchema.methods.hardDelete = async function (deleteOrders = true) {
  try {
    const deletions = [
      Cart.deleteMany({ user: this._id }),
      Wishlist.deleteMany({ user: this._id }),
    ];

    if (deleteOrders) {
      deletions.push(Order.deleteMany({ user: this._id }));
    }

    await Promise.all(deletions);

    return await this.deleteOne();
  } catch (err) {
    console.error("Hard delete failed:", err);
    throw err;
  }
};

// Restore user
userSchema.methods.restoreUser = async function () {
  if (!this.deleted) {
    throw new Error("User is not deleted.");
  }

  this.deleted = false;
  this.deletedAt = null;

  await Promise.all([
    Cart.updateMany(
      { user: this._id, deleted: true },
      { deleted: false, deletedAt: null }
    ),
    Wishlist.updateMany(
      { user: this._id, deleted: true },
      { deleted: false, deletedAt: null }
    ),
    Order.updateMany(
      // Optional
      { user: this._id, deleted: true },
      { deleted: false, deletedAt: null }
    ),
  ]);

  return this.save();
};

// Block user
userSchema.methods.blockUser = function () {
  if (this.blocked) return this;
  this.blocked = true;
  return this.save();
};

// Unblock user
userSchema.methods.unblockUser = function () {
  if (!this.blocked) return this;
  this.blocked = false;
  return this.save();
};

// Create and export the User model
const User = mongoose.model("User", userSchema);
module.exports = User;
