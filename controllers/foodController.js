const FoodItem = require("../models/FoodItem");
const Restaurant = require("../models/Restaurant");
const { seedRestaurants } = require("../scripts/seedRestaurants");

// Get all food items
const getAllFoodItems = async (req, res) => {
  try {
    const items = await FoodItem.find({}).populate(
      "restaurant",
      "name location"
    );
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
    const { id } = req.params;
    const { available } = req.body;

    if (typeof available !== "boolean") {
      return res.status(400).json({ error: "Invalid availability value" });
    }

    const result = await FoodItem.findByIdAndUpdate(
      id,
      { available },
      { new: true }
    );

    if (!result) {
      return res.status(404).json({ error: "Menu item not found" });
    }

    res.json({
      success: true,
      message: available ? "Item is now available" : "Item is now unavailable",
      data: result,
    });
  } catch (error) {
    console.error("Error updating food item:", error);
    res
      .status(500)
      .json({ error: "Unable to update menu item. Please try again later" });
  }
};

// Get all restaurants (with auto-seeding)
const getAllRestaurants = async (req, res) => {
  try {
    // Check if restaurants exist, if not, seed them
    let restaurants = await Restaurant.find({ isActive: true }).sort({
      name: 1,
    });

    if (restaurants.length === 0) {
      console.log("No restaurants found. Auto-seeding...");
      const seedResult = await seedRestaurants();

      if (seedResult.success) {
        restaurants = await Restaurant.find({ isActive: true }).sort({
          name: 1,
        });
        console.log(`Auto-seeded ${restaurants.length} restaurants`);
      }
    }

    res.json({
      success: true,
      data: restaurants,
      count: restaurants.length,
    });
  } catch (error) {
    console.error("Error fetching restaurants:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch restaurants",
    });
  }
};

// Get restaurant by ID
const getRestaurantById = async (req, res) => {
  try {
    const { id } = req.params;
    const restaurant = await Restaurant.findById(id);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        error: "Restaurant not found",
      });
    }

    res.json({
      success: true,
      data: restaurant,
    });
  } catch (error) {
    console.error("Error fetching restaurant:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch restaurant details",
    });
  }
};

// Get food items by restaurant ID
const getFoodItemsByRestaurant = async (req, res) => {
  try {
    const { restaurantId } = req.params;

    const foodItems = await FoodItem.find({
      restaurant: restaurantId,
    }).populate("restaurant", "name location");

    res.json({
      success: true,
      data: foodItems,
      count: foodItems.length,
    });
  } catch (error) {
    console.error("Error fetching food items by restaurant:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch menu items",
    });
  }
};

module.exports = {
  getAllFoodItems,
  updateFoodItem,
  getAllRestaurants,
  getRestaurantById,
  getFoodItemsByRestaurant,
};
