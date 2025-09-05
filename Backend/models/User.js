const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  user_id: String,
  name: String,
  password: String,
  email: String,
  phone_number: String,
  device_token: String,
});

const User = mongoose.model("users", userSchema);

module.exports = User;
