import React, { createContext, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "../axiosConfig";

const OrdersContext = createContext();

export const OrdersProvider = ({ children }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch all orders (for staff)
  const fetchAllOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/orders");
      setOrders(response.data);
      return { success: true, data: response.data };
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
  const fetchUserOrders = async (userId) => {
    try {
      setLoading(true);
      const response = await axios.get(`/orders/${userId}`);
      setOrders(response.data);
      return { success: true, data: response.data };
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
      }}
    >
      {children}
    </OrdersContext.Provider>
  );
};

export default OrdersContext;
