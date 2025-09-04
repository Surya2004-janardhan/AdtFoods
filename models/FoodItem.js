const mongoose = require("mongoose");

const foodItemSchema = new mongoose.Schema({
  id: Number,
  name: String,
  price: Number,
  available: Boolean,
  image: String,
});

const FoodItem = mongoose.model("fooditems", foodItemSchema);

module.exports = FoodItem;
