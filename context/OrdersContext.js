import React, { createContext, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "../axiosConfig";

const OrdersContext = createContext();

export const OrdersProvider = ({ children }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  // Cache configuration
  const CACHE_DURATION = 30 * 1000; // 30 seconds (orders update frequently)
  const ORDERS_CACHE_KEY = "orders_cache";
  const ORDERS_CACHE_TIMESTAMP_KEY = "orders_cache_timestamp";

  // Check if cached data is still valid
  const isCacheValid = (timestamp) => {
    const now = Date.now();
    return now - timestamp < CACHE_DURATION;
  };

  // Load cached orders
  const loadCachedOrders = async (cacheKey) => {
    try {
      const cachedData = await AsyncStorage.getItem(cacheKey);
      const cachedTimestamp = await AsyncStorage.getItem(
        `${cacheKey}_timestamp`
      );

      if (cachedData && cachedTimestamp) {
        const timestamp = parseInt(cachedTimestamp);
        if (isCacheValid(timestamp)) {
          return {
            success: true,
            data: JSON.parse(cachedData),
            fromCache: true,
          };
        }
      }
      return { success: false, fromCache: false };
    } catch (error) {
      console.error("Error loading cached orders:", error);
      return { success: false, fromCache: false };
    }
  };

  // Save orders to cache
  const saveOrdersToCache = async (cacheKey, data) => {
    try {
      const timestamp = Date.now().toString();
      await AsyncStorage.setItem(cacheKey, JSON.stringify(data));
      await AsyncStorage.setItem(`${cacheKey}_timestamp`, timestamp);
    } catch (error) {
      console.error("Error saving orders to cache:", error);
    }
  };

  // Clear orders cache
  const clearOrdersCache = async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const orderCacheKeys = keys.filter(
        (key) => key.startsWith("orders_") || key.startsWith("user_orders_")
      );
      if (orderCacheKeys.length > 0) {
        await AsyncStorage.multiRemove(orderCacheKeys);
      }
    } catch (error) {
      console.error("Error clearing orders cache:", error);
    }
  };

  // Fetch all orders (for staff)
  const fetchAllOrders = async (forceRefresh = false) => {
    try {
      // Check cache first
      if (!forceRefresh) {
        const cacheResult = await loadCachedOrders(ORDERS_CACHE_KEY);
        if (cacheResult.success) {
          setOrders(cacheResult.data);
          return cacheResult;
        }
      }

      setLoading(true);
      const response = await axios.get("/orders");
      setOrders(response.data);

      // Save to cache
      await saveOrdersToCache(ORDERS_CACHE_KEY, response.data);

      return { success: true, data: response.data, fromCache: false };
    } catch (error) {
      console.error("Error fetching all orders:", error);
      return {
        success: false,
        error: error.response?.data?.error || "Failed to fetch orders",
      };
    } finally {
      setLoading(false);
    }
  };

  // Fetch orders by user ID
  const fetchUserOrders = async (userId, forceRefresh = false) => {
    try {
      const cacheKey = `user_orders_${userId}`;

      // Check cache first
      if (!forceRefresh) {
        const cacheResult = await loadCachedOrders(cacheKey);
        if (cacheResult.success) {
          setOrders(cacheResult.data);
          return cacheResult;
        }
      }

      setLoading(true);
      const response = await axios.get(`/orders/${userId}`);
      setOrders(response.data);

      // Save to cache
      await saveOrdersToCache(cacheKey, response.data);

      return { success: true, data: response.data, fromCache: false };
    } catch (error) {
      console.error("Error fetching user orders:", error);
      return {
        success: false,
        error: error.response?.data?.error || "Failed to fetch your orders",
      };
    } finally {
      setLoading(false);
    }
  };

  // Create a new order
  const createOrder = async (orderData) => {
    try {
      const response = await axios.post("/orders", orderData);

      if (response.data.success) {
        // Add the new order to the local state
        setOrders((prevOrders) => [...prevOrders, response.data.order]);

        // Clear orders cache since new order was created
        await clearOrdersCache();

        return { success: true, data: response.data.order };
      }
      return { success: false, error: "Failed to create order" };
    } catch (error) {
      console.error("Error creating order:", error);
      return {
        success: false,
        error: error.response?.data?.error || "Failed to place order",
      };
    }
  };

  // Update order status (for staff)
  const updateOrderStatus = async (orderId, status) => {
    try {
      const response = await axios.put(`/orders/${orderId}/status`, { status });

      // Update the order in local state
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId ? { ...order, status } : order
        )
      );

      // Clear orders cache since status was updated
      await clearOrdersCache();

      return response.data;
    } catch (error) {
      console.error("Error updating order status:", error);
      throw new Error(
        error.response?.data?.error || "Failed to update order status"
      );
    }
  };

  // Get orders based on user role or parameters
  const getOrdersForUser = async (userId = null, isStaff = null) => {
    try {
      let userRole = isStaff;
      let targetUserId = userId;

      // If parameters not provided, get from AsyncStorage
      if (isStaff === null) {
        const storedRole = await AsyncStorage.getItem("userRole");
        userRole = storedRole === "staff";
      }

      if (!userId && !userRole) {
        targetUserId = await AsyncStorage.getItem("userId");
      }

      if (userRole) {
        // Staff can see all orders
        const response = await axios.get("/orders");
        return response.data;
      } else {
        // Users see only their own orders
        const response = await axios.get(`/orders/${targetUserId}`);
        return response.data;
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      throw new Error(error.response?.data?.error || "Failed to fetch orders");
    }
  };

  const addOrder = (newOrder) => {
    setOrders((prevOrders) => [...prevOrders, newOrder]);
  };

  return (
    <OrdersContext.Provider
      value={{
        orders,
        loading,
        addOrder,
        fetchAllOrders,
        fetchUserOrders,
        createOrder,
        updateOrderStatus,
        getOrdersForUser,
        clearOrdersCache,
      }}
    >
      {children}
    </OrdersContext.Provider>
  );
};

export default OrdersContext;
