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
        size: { type: String, required: true },
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
      enum: [
        "placed", // Order placed by the customer
        "processing", // Order being prepared (payment verification, picking, packing)
        "dispatched", // Order handed to the carrier, awaiting transit
        "shipped", // Order is in transit (tracking info available)
        "out for delivery", // Order is with the delivery driver
        "delivered", // Order delivered successfully
        "cancelled", // Order cancelled
        "returned", // Customer returns the order
      ],
      default: "placed", // Default status when the order is placed
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
      currentLocation: { type: String, default: "Warehouse" }, // Added currentLocation field
    },
    trackingHistory: [
      {
        date: { type: Date, default: Date.now }, // Automatically capture date of update
        location: { type: String },
        status: { type: String },
      },
    ],
    notes: { type: String }, // Optional notes or additional info
    deletedAt: { type: Date, default: null }, // Soft delete field
    razorpayOrderId: { type: String, required: true }, // Razorpay order ID
    razorpayPaymentId: { type: String }, // Razorpay payment ID (to be updated post-payment verification)
  },
  { timestamps: true } // Automatically manage createdAt and updatedAt fields
);

// Middleware to capture changes to order status and current location
orderSchema.pre("save", function (next) {
  if (
    this.isModified("orderStatus") ||
    this.isModified("trackingInfo.currentLocation")
  ) {
    // If orderStatus or currentLocation is modified, push the new event to trackingHistory
    const newEvent = {
      date: new Date(),
      location: this.trackingInfo.currentLocation,
      status: this.orderStatus,
    };

    // Ensure trackingHistory exists, then push new event
    if (!this.trackingHistory) {
      this.trackingHistory = [];
    }

    this.trackingHistory.push(newEvent);
  }

  next();
});

// Indexing for quick lookups
orderSchema.index({ user: 1, orderStatus: 1, createdAt: -1 });

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
