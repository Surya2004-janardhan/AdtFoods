const mongoose = require("mongoose");

const restaurantSchema = new mongoose.Schema({}, { strict: false });

const Restaurant = mongoose.model("restaurants", restaurantSchema);

module.exports = Restaurant;
