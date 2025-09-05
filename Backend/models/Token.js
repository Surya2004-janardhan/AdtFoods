const mongoose = require("mongoose");

const tokenSchema = new mongoose.Schema({
  user_id: String,
  token: String,
});

const Token = mongoose.model("tokens", tokenSchema);

module.exports = Token;
