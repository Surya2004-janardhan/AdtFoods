const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  user_email: String,
  user_name: String,
  user_phone: String,
  items: String,
  total_amount: Number,
  status: String,
  user_id: String,
  created_at: {
    type: Date,
    default: Date.now,
  },
});

const Order = mongoose.model("orders", orderSchema);

module.exports = Order;
