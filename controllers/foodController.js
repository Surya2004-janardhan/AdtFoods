const FoodItem = require("../models/FoodItem");
const Restaurant = require("../models/Restaurant");

// Get all food items
const getAllFoodItems = async (req, res) => {
  try {
    const items = await FoodItem.find({});
    res.json(items);
  } catch (error) {
    console.error("Error fetching food items:", error);
    res
      .status(500)
      .json({ error: "Unable to load menu items. Please try again later" });
  }
};

// Update food item availability
const updateFoodItem = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { available } = req.body;

    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid menu item ID" });
    }

    if (typeof available !== "boolean") {
      return res.status(400).json({ error: "Invalid availability value" });
    }

    const result = await FoodItem.updateOne({ id }, { available });

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Menu item not found" });
    }

    res.json({
      success: true,
      message: available ? "Item is now available" : "Item is now unavailable",
    });
  } catch (error) {
    console.error("Error updating food item:", error);
    res
      .status(500)
      .json({ error: "Unable to update menu item. Please try again later" });
  }
};

// Get all restaurants
const getAllRestaurants = async (req, res) => {
  try {
    const restaurants = await Restaurant.find({});
    res.json(restaurants);
  } catch (error) {
    console.error("Error fetching restaurants:", error);
    res.status(500).json({ error: "Failed to fetch restaurants" });
  }
};

module.exports = {
  getAllFoodItems,
  updateFoodItem,
  getAllRestaurants,
};
