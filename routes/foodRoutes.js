const express = require("express");
const router = express.Router();
const foodController = require("../controllers/foodController");
const { auth } = require("../middleware/auth");
const { validateRequest } = require("../middleware/validateRequest");

// Update food item schema
const updateFoodItemSchema = {
  available: { type: "boolean", required: true },
};

// Food routes
router.get("/food-items", foodController.getAllFoodItems);
router.put(
  "/food-items/:id",
  auth,
  validateRequest(updateFoodItemSchema),
  foodController.updateFoodItem
);
router.get("/restaurants", foodController.getAllRestaurants);

module.exports = router;
