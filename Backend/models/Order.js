const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  food: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "FoodItem",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  price: {
    type: Number,
    required: true,
  },
});

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: Number,
    unique: true,
    default: 1,
  },
  userId: {
    type: String,
    required: true,
  },
  customerName: {
    type: String,
    required: true,
  },
  restaurant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Restaurant",
    required: true,
  },
  items: [orderItemSchema],
  totalAmount: {
    type: Number,
    required: true,
  },
  deliveryFee: {
    type: Number,
    default: 30,
  },
  tax: {
    type: Number,
    default: 0,
  },
  paymentMethod: {
    type: String,
    required: true,
    enum: ["card", "upi", "cash", "razorpay"],
  },
  status: {
    type: String,
    default: "pending",
    enum: ["pending", "ready_to_pick", "cancelled"],
  },
  otp: {
    type: String,
    required: true,
  },
  restaurantName: {
    type: String,
    required: true,
  },
  restaurantLocation: {
    type: String,
    required: true,
  },
  razorpayOrderId: String,
  razorpayPaymentId: String,
  note: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

orderSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;
