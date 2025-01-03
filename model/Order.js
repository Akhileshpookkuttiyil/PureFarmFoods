// models/Order.js

const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to the User who placed the order
      required: true,
    },
    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product", // Reference to the Product model
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        }, // The price at the time of order
      },
    ],
    totalAmount: {
      type: Number,
      required: true, // Total amount of the order
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded"],
      default: "pending",
    },
    orderStatus: {
      type: String,
      enum: ["placed", "dispatched", "delivered", "cancelled", "returned"],
      default: "placed",
    },
    shippingAddress: {
      fullName: { type: String, required: true },
      addressLine1: { type: String, required: true },
      addressLine2: { type: String },
      city: { type: String, required: true },
      state: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
      phone: { type: String, required: true },
    },
    trackingInfo: {
      courierName: { type: String },
      trackingNumber: { type: String },
    },
    createdAt: {
      type: Date,
      default: Date.now, // Timestamp for order creation
    },
    updatedAt: {
      type: Date,
      default: Date.now, // Timestamp for the last update
    },
  },
  { timestamps: true }
); // Automatically manage createdAt and updatedAt fields

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
