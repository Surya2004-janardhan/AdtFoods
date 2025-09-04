import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  SafeAreaView,
  StyleSheet,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import OrdersContext from "../context/OrdersContext";
import BottomNavigation from "../components/BottomNavigation";
import Toast from "react-native-toast-message";

const OrdersScreen = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState("");
  const router = useRouter();
  const { getOrdersForUser, updateOrderStatus } = useContext(OrdersContext);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const role = (await AsyncStorage.getItem("userRole")) || "user";
        const userId = await AsyncStorage.getItem("userId");
        setUserRole(role);

        let ordersData = [];
        if (role === "staff") {
          // Staff can see all orders - use context function
          ordersData = await getOrdersForUser(null, true); // Pass null for userId and true for isStaff
        } else {
          // Users see only their own orders - use context function
          ordersData = await getOrdersForUser(userId, false);
        }

        setOrders(ordersData);
      } catch (error) {
        console.error("Error fetching orders:", error);
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Failed to load orders",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "#4CAF50";
      case "processing":
        return "#FF9800";
      case "pending":
        return "#2196F3";
      case "cancelled":
        return "#F44336";
      default:
        return "#9E9E9E";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "completed":
        return "Completed";
      case "processing":
        return "Processing";
      case "pending":
        return "Pending";
      case "cancelled":
        return "Cancelled";
      default:
        return "Unknown";
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      // Use context function instead of direct API call
      await updateOrderStatus(orderId, newStatus);

      // Update the orders list
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId ? { ...order, status: newStatus } : order
        )
      );

      Toast.show({
        type: "success",
        text1: "Success",
        text2: `Order status updated to ${newStatus}`,
      });
    } catch (error) {
      console.error("Error updating order status:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to update order status",
      });
    }
  };

  const renderOrderItem = ({ item }) => (
    <View className="bg-white mb-4 mx-4 rounded-xl shadow-lg border border-gray-100">
      <View className="p-5">
        {/* Header */}
        <View className="flex-row justify-between items-center mb-4">
          <Text
            className="text-lg font-semibold text-gray-900"
            style={{ fontFamily: "Poppins-SemiBold" }}
          >
            Order #{item._id?.slice(-6) || "N/A"}
          </Text>
          <View
            className="px-3 py-1 rounded-full"
            style={{ backgroundColor: getStatusColor(item.status) + "20" }}
          >
            <Text
              className="text-sm font-medium"
              style={{
                color: getStatusColor(item.status),
                fontFamily: "Poppins-Medium",
              }}
            >
              {getStatusText(item.status)}
            </Text>
          </View>
        </View>

        {/* Restaurant Info */}
        <View className="flex-row items-center mb-3">
          <MaterialCommunityIcons name="store" size={18} color="#666" />
          <Text
            className="ml-2 text-gray-700"
            style={{ fontFamily: "Poppins-Regular" }}
          >
            {item.restaurant?.name || "Restaurant"}
          </Text>
        </View>

        {/* Order Items */}
        <View className="mb-4">
          <Text
            className="text-gray-600 mb-2 text-sm"
            style={{ fontFamily: "Poppins-Medium" }}
          >
            Items ({item.items?.length || 0}):
          </Text>
          {item.items?.map((orderItem, index) => (
            <View
              key={index}
              className="flex-row justify-between items-center py-1"
            >
              <Text
                className="text-gray-800 flex-1"
                style={{ fontFamily: "Poppins-Regular" }}
              >
                {orderItem.food?.name || "Food Item"} x {orderItem.quantity}
              </Text>
              <Text
                className="text-gray-600 font-medium"
                style={{ fontFamily: "Poppins-Medium" }}
              >
                ₹
                {((orderItem.food?.price || 0) * orderItem.quantity).toFixed(2)}
              </Text>
            </View>
          ))}
        </View>

        {/* Order Details */}
        <View className="border-t border-gray-100 pt-3 mb-4">
          <View className="flex-row justify-between items-center mb-2">
            <Text
              className="text-gray-600"
              style={{ fontFamily: "Poppins-Regular" }}
            >
              Total Amount:
            </Text>
            <Text
              className="text-lg font-bold text-green-600"
              style={{ fontFamily: "Poppins-Bold" }}
            >
              ₹{(item.totalAmount || 0).toFixed(2)}
            </Text>
          </View>
          <View className="flex-row justify-between items-center">
            <Text
              className="text-gray-600"
              style={{ fontFamily: "Poppins-Regular" }}
            >
              Order Date:
            </Text>
            <Text
              className="text-gray-800"
              style={{ fontFamily: "Poppins-Regular" }}
            >
              {item.createdAt
                ? new Date(item.createdAt).toLocaleDateString()
                : "N/A"}
            </Text>
          </View>
        </View>

        {/* Staff Controls */}
        {userRole === "staff" &&
          item.status !== "completed" &&
          item.status !== "cancelled" && (
            <View className="border-t border-gray-100 pt-3">
              <Text
                className="text-gray-600 mb-2 text-sm"
                style={{ fontFamily: "Poppins-Medium" }}
              >
                Update Status:
              </Text>
              <View className="flex-row flex-wrap">
                {["pending", "processing", "completed", "cancelled"].map(
                  (status) => (
                    <TouchableOpacity
                      key={status}
                      onPress={() => handleUpdateOrderStatus(item._id, status)}
                      className={`mr-2 mb-2 px-4 py-2 rounded-lg ${
                        item.status === status
                          ? "bg-blue-500"
                          : "bg-gray-100 border border-gray-300"
                      }`}
                      disabled={item.status === status}
                    >
                      <Text
                        className={`text-sm font-medium ${
                          item.status === status
                            ? "text-white"
                            : "text-gray-700"
                        }`}
                        style={{ fontFamily: "Poppins-Medium" }}
                      >
                        {getStatusText(status)}
                      </Text>
                    </TouchableOpacity>
                  )
                )}
              </View>
            </View>
          )}
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <StatusBar barStyle="dark-content" backgroundColor="#f9fafb" />
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text
            className="mt-4 text-gray-600"
            style={{ fontFamily: "Poppins-Regular" }}
          >
            Loading orders...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" backgroundColor="#f9fafb" />

      {/* Header */}
      <View className="bg-white shadow-sm border-b border-gray-100">
        <View className="px-6 py-4">
          <Text
            className="text-2xl font-bold text-gray-900"
            style={{ fontFamily: "PlayfairDisplay-Bold" }}
          >
            {userRole === "staff" ? "All Orders" : "My Orders"}
          </Text>
          <Text
            className="text-gray-600 mt-1"
            style={{ fontFamily: "Poppins-Regular" }}
          >
            {orders.length} {orders.length === 1 ? "order" : "orders"} found
          </Text>
        </View>
      </View>

      {/* Orders List */}
      {orders.length === 0 ? (
        <View className="flex-1 justify-center items-center px-6">
          <MaterialCommunityIcons name="receipt" size={80} color="#ccc" />
          <Text
            className="text-xl text-gray-500 mt-4 text-center"
            style={{ fontFamily: "Poppins-SemiBold" }}
          >
            No orders found
          </Text>
          <Text
            className="text-gray-400 mt-2 text-center"
            style={{ fontFamily: "Poppins-Regular" }}
          >
            {userRole === "staff"
              ? "No orders have been placed yet."
              : "You haven't placed any orders yet."}
          </Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          renderItem={renderOrderItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ paddingVertical: 16 }}
          showsVerticalScrollIndicator={false}
        />
      )}

      <BottomNavigation />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  // Any additional styles if needed
});

export default OrdersScreen;
