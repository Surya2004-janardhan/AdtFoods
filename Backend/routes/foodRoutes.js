const express = require("express");
const router = express.Router();
const foodController = require("../controllers/foodController");
const { auth } = require("../middleware/auth");
const validateRequest =
  require("../middleware/validateRequest").validateRequest;
const { cacheMiddleware, clearCache } = require("../middleware/cache");

// Update food item schema
const updateFoodItemSchema = {
  available: { type: "boolean", required: true },
};

// Food routes
router.get(
  "/food-items",
  cacheMiddleware("food-items", 300),
  foodController.getAllFoodItems
);
router.put(
  "/food-items/:id",
  auth,
  validateRequest(updateFoodItemSchema),
  clearCache("food-items:*"),
  clearCache("menu:*"),
  foodController.updateFoodItem
);
// Restaurant routes (5 min cache)
router.get(
  "/restaurants",
  cacheMiddleware("restaurants", 300),
  foodController.getAllRestaurants
);
router.get(
  "/restaurants/:id",
  cacheMiddleware("restaurant", 300),
  foodController.getRestaurantById
);
// Menu items (2 min cache for freshness)
router.get(
  "/restaurants/:restaurantId/menu",
  cacheMiddleware("menu", 120),
  foodController.getFoodItemsByRestaurant
);

module.exports = router;
