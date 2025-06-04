const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    products: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        size: { type: String, required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
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
        "placed",
        "processing",
        "dispatched",
        "shipped",
        "out for delivery",
        "delivered",
        "cancelled",
        "returned",
      ],
      default: "placed",
    },
    shippingAddress: {
      firstName: { type: String, required: true },
      lastName: { type: String, required: true },
      address: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      postalCode: { type: String, required: true },
      phone: { type: String, required: true },
    },
    trackingInfo: {
      courierName: { type: String, default: "PureFarmFoods-TM" },
      trackingNumber: { type: String, default: null },
      currentLocation: { type: String, default: "Warehouse" },
    },
    trackingHistory: [
      {
        date: { type: Date, default: Date.now },
        location: { type: String },
        status: { type: String },
      },
    ],
    notes: { type: String },
    deletedAt: { type: Date, default: null },
    razorpayOrderId: {
      type: String,
      required: function () {
        // Required if payment method is UPI or CARD (online payment)
        return this.paymentMethod === "UPI" || this.paymentMethod === "CARD";
      },
    },
    razorpayPaymentId: {
      type: String,
      required: function () {
        // Required if payment is completed and method is online payment
        return (
          (this.paymentMethod === "UPI" || this.paymentMethod === "CARD") &&
          this.paymentStatus === "completed"
        );
      },
    },
  },
  { timestamps: true }
);

// Middleware to track order status and location changes
orderSchema.pre("save", function (next) {
  if (
    this.isModified("orderStatus") ||
    this.isModified("trackingInfo.currentLocation")
  ) {
    if (!this.trackingHistory) {
      this.trackingHistory = [];
    }

    this.trackingHistory.push({
      date: new Date(),
      location: this.trackingInfo.currentLocation,
      status: this.orderStatus,
    });
  }
  next();
});

// Index for faster queries on user, order status, and recent orders
orderSchema.index({ user: 1, orderStatus: 1, createdAt: -1 });

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
