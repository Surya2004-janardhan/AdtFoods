import React, { createContext, useState } from "react";
import axios from "../axiosConfig";

const FoodContext = createContext();

export const FoodProvider = ({ children }) => {
  const [restaurants, setRestaurants] = useState([]);
  const [foodItems, setFoodItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch all restaurants
  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/restaurants");
      // Handle both old format (array) and new format (object with data array)
      const restaurantData = response.data.data || response.data;
      setRestaurants(restaurantData);
      return { success: true, data: restaurantData };
    } catch (error) {
      console.error("Error fetching restaurants:", error);
      return {
        success: false,
        error: error.response?.data?.error || "Failed to fetch restaurants",
      };
    } finally {
      setLoading(false);
    }
  };

  // Fetch all food items
  const fetchFoodItems = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/food-items");
      // Handle both old format (array) and new format (object with data array)
      const foodData = response.data.data || response.data;
      setFoodItems(foodData);
      return { success: true, data: foodData };
    } catch (error) {
      console.error("Error fetching food items:", error);
      return {
        success: false,
        error: error.response?.data?.error || "Failed to fetch food items",
      };
    } finally {
      setLoading(false);
    }
  };

  // Get food items by restaurant ID
  const getFoodItemsByRestaurant = async (restaurantId) => {
    try {
      const response = await axios.get(`/restaurants/${restaurantId}/menu`);
      // Handle both old format (array) and new format (object with data array)
      const foodData = response.data.data || response.data;
      return { success: true, data: foodData };
    } catch (error) {
      console.error("Error fetching restaurant food items:", error);
      return {
        success: false,
        error: error.response?.data?.error || "Failed to fetch menu items",
      };
    }
  };

  // Get restaurant by ID
  const getRestaurantById = async (restaurantId) => {
    try {
      const response = await axios.get(`/restaurants/${restaurantId}`);
      const restaurantData = response.data.data || response.data;
      return { success: true, data: restaurantData };
    } catch (error) {
      console.error("Error fetching restaurant:", error);
      return {
        success: false,
        error: error.response?.data?.error || "Failed to fetch restaurant",
      };
    }
  };

  // Update food item availability (for staff)
  const updateFoodItemAvailability = async (itemId, available) => {
    try {
      const response = await axios.put(`/food-items/${itemId}`, { available });

      if (response.data.success) {
        // Update the item in local state
        setFoodItems((prevItems) =>
          prevItems.map((item) =>
            item._id === itemId ? { ...item, available } : item
          )
        );
        return { success: true };
      }
      return { success: false, error: "Failed to update item availability" };
    } catch (error) {
      console.error("Error updating food item availability:", error);
      return {
        success: false,
        error:
          error.response?.data?.error || "Failed to update item availability",
      };
    }
  };

  return (
    <FoodContext.Provider
      value={{
        restaurants,
        foodItems,
        loading,
        fetchRestaurants,
        fetchFoodItems,
        getFoodItemsByRestaurant,
        getRestaurantById,
        updateFoodItemAvailability,
      }}
    >
      {children}
    </FoodContext.Provider>
  );
};

export default FoodContext;
