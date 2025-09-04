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
      setRestaurants(response.data);
      return { success: true, data: response.data };
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
      setFoodItems(response.data);
      return { success: true, data: response.data };
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
      const response = await axios.get("/food-items");
      const restaurantItems = response.data.filter(
        (item) =>
          item.restaurant_id === parseInt(restaurantId) && item.available
      );
      return { success: true, data: restaurantItems };
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
      if (restaurants.length === 0) {
        await fetchRestaurants();
      }
      const restaurant = restaurants.find(
        (r) => r.id === parseInt(restaurantId)
      );
      if (restaurant) {
        return { success: true, data: restaurant };
      } else {
        // Fallback: fetch all restaurants and find the one
        const response = await axios.get("/restaurants");
        const foundRestaurant = response.data.find(
          (r) => r.id === parseInt(restaurantId)
        );
        if (foundRestaurant) {
          return { success: true, data: foundRestaurant };
        }
        return { success: false, error: "Restaurant not found" };
      }
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
            item.id === itemId ? { ...item, available } : item
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
