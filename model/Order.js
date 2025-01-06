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
        size:{type: String,required: true},
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
      },
    ],
    totalAmount: {
      type: Number,
      required: true, // Total amount of the order
    },
    paymentMethod: {
      type: String,
      enum: ["UPI", "CARD", "COD"],
      required: true,
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
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      postalCode: { type: String, required: true },
      phone: {
        type: String,
        required: true,
      },
    },
    trackingInfo: {
      courierName: { type: String, default: "PureFarmFoods-TM" },
      trackingNumber: { type: String, default: null },
    },
    notes: { type: String }, // Optional notes or additional info
    deletedAt: { type: Date, default: null }, // Soft delete field
    razorpayOrderId: { type: String, required: true }, // Razorpay order ID
    razorpayPaymentId: { type: String }, // Razorpay payment ID (to be updated post-payment verification)
  },
  { timestamps: true } // Automatically manage createdAt and updatedAt fields
);

// Indexing for quick lookups
orderSchema.index({ user: 1, orderStatus: 1, createdAt: -1 });

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
