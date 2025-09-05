import React, { createContext, useState, useEffect } from "react";
import axios from "../axiosConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";

const FoodContext = createContext();

export const FoodProvider = ({ children }) => {
  const [restaurants, setRestaurants] = useState([]);
  const [foodItems, setFoodItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // Cache configuration
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds
  const RESTAURANT_CACHE_KEY = "restaurants_cache";
  const RESTAURANT_CACHE_TIMESTAMP_KEY = "restaurants_cache_timestamp";

  // Check if cached data is still valid
  const isCacheValid = (timestamp) => {
    const now = Date.now();
    return now - timestamp < CACHE_DURATION;
  };

  // Load cached restaurants from AsyncStorage
  const loadCachedRestaurants = async () => {
    try {
      const cachedData = await AsyncStorage.getItem(RESTAURANT_CACHE_KEY);
      const cachedTimestamp = await AsyncStorage.getItem(
        RESTAURANT_CACHE_TIMESTAMP_KEY
      );

      if (cachedData && cachedTimestamp) {
        const timestamp = parseInt(cachedTimestamp);
        if (isCacheValid(timestamp)) {
          const parsedData = JSON.parse(cachedData);
          setRestaurants(parsedData);
          return { success: true, data: parsedData, fromCache: true };
        }
      }
      return { success: false, fromCache: false };
    } catch (error) {
      console.error("Error loading cached restaurants:", error);
      return { success: false, fromCache: false };
    }
  };

  // Save restaurants to cache
  const saveRestaurantsToCache = async (data) => {
    try {
      const timestamp = Date.now().toString();
      await AsyncStorage.setItem(RESTAURANT_CACHE_KEY, JSON.stringify(data));
      await AsyncStorage.setItem(RESTAURANT_CACHE_TIMESTAMP_KEY, timestamp);
    } catch (error) {
      console.error("Error saving restaurants to cache:", error);
    }
  };

  // Clear restaurant cache
  const clearRestaurantCache = async () => {
    try {
      await AsyncStorage.removeItem(RESTAURANT_CACHE_KEY);
      await AsyncStorage.removeItem(RESTAURANT_CACHE_TIMESTAMP_KEY);
    } catch (error) {
      console.error("Error clearing restaurant cache:", error);
    }
  };

  // Load cached data on component mount
  useEffect(() => {
    loadCachedRestaurants();
  }, []);

  // Fetch all restaurants
  const fetchRestaurants = async (forceRefresh = false) => {
    try {
      // Check cache first if not forcing refresh
      if (!forceRefresh) {
        const cacheResult = await loadCachedRestaurants();
        if (cacheResult.success) {
          return cacheResult;
        }
      }

      setLoading(true);
      const response = await axios.get("/restaurants");
      // Handle both old format (array) and new format (object with data array)
      const restaurantData = response.data.data || response.data;
      setRestaurants(restaurantData);

      // Save to cache
      await saveRestaurantsToCache(restaurantData);

      return { success: true, data: restaurantData, fromCache: false };
    } catch (error) {
      console.error("Error fetching restaurants:", error);
      return {
        success: false,
        error: error.response?.data?.error || "Failed to fetch restaurants",
        fromCache: false,
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
        clearRestaurantCache,
        CACHE_DURATION,
      }}
    >
      {children}
    </FoodContext.Provider>
  );
};

export default FoodContext;
