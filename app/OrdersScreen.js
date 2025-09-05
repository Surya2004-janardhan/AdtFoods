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
  TextInput,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import OrdersContext from "../context/OrdersContext";
import BottomNavigation from "../components/BottomNavigation";
import Toast from "react-native-toast-message";

const OrdersScreen = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();
  const { getOrdersForUser, updateOrderStatus } = useContext(OrdersContext);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const role = (await AsyncStorage.getItem("userRole")) || "user";
        const userId = (await AsyncStorage.getItem("userId")) || "testuser123"; // Default for testing
        setUserRole(role);

        let ordersData = [];
        if (role === "staff") {
          // Staff can see all orders
          ordersData = await getOrdersForUser(null, true);
        } else {
          // Users see only their own orders
          ordersData = await getOrdersForUser(userId, false);
        }

        setOrders(ordersData || []);
        setFilteredOrders(ordersData || []);
      } catch (error) {
        console.error("Error fetching orders:", error);
        setOrders([]);
        setFilteredOrders([]);
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

  // Filter orders based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredOrders(orders);
    } else {
      const filtered = orders.filter(
        (order) =>
          order._id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.restaurant?.name
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          order.status?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.items?.some((item) =>
            item.food?.name?.toLowerCase().includes(searchQuery.toLowerCase())
          )
      );
      setFilteredOrders(filtered);
    }
  }, [searchQuery, orders]);

  const getStatusColor = (status) => {
    switch (status) {
      case "ready_to_pick":
        return "#4CAF50"; // Green
      case "pending":
        return "#FF9800"; // Orange
      case "cancelled":
        return "#F44336"; // Red
      default:
        return "#757575"; // Gray
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "ready_to_pick":
        return "Ready to Pick";
      case "pending":
        return "Pending";
      case "cancelled":
        return "Cancelled";
      default:
        return "Unknown";
    }
  };

  // const getStatusColor = (status) => {
  //   switch (status) {
  //     case "ready_to_pick":
  //       return "#4CAF50"; // Green
  //     case "pending":
  //       return "#FF9800"; // Orange
  //     case "cancelled":
  //       return "#F44336"; // Red
  //     default:
  //       return "#757575"; // Gray
  //   }
  // };

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
    <View style={styles.orderCard}>
      <View style={styles.orderContent}>
        {/* Header */}
        <View style={styles.orderHeader}>
          <Text style={[styles.orderTitle, { fontFamily: "Poppins-SemiBold" }]}>
            Order #{item._id?.slice(-6) || "N/A"}
          </Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(item.status) + "20" },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                {
                  color: getStatusColor(item.status),
                  fontFamily: "Poppins-Medium",
                },
              ]}
            >
              {getStatusText(item.status)}
            </Text>
          </View>
        </View>

        {/* Restaurant Info */}
        <View className="mb-3">
          <View className="flex-row items-center mb-2">
            <MaterialCommunityIcons name="store" size={18} color="#666" />
            <Text
              className="ml-2 text-gray-700 font-semibold"
              style={{ fontFamily: "Poppins-Medium" }}
            >
              {item.restaurantName || item.restaurant?.name || "Restaurant"}
            </Text>
          </View>
          <View className="flex-row items-center">
            <MaterialCommunityIcons name="map-marker" size={18} color="#666" />
            <Text
              className="ml-2 text-gray-600"
              style={{ fontFamily: "Poppins-Regular" }}
            >
              {item.restaurantLocation ||
                item.restaurant?.location ||
                "Location not available"}
            </Text>
          </View>
        </View>

        {/* OTP Display */}
        {item.otp && (
          <View className="mb-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
            <Text
              className="text-orange-700 text-sm font-medium mb-1"
              style={{ fontFamily: "Poppins-Medium" }}
            >
              Pickup OTP:
            </Text>
            <Text
              className="text-orange-900 text-xl font-bold"
              style={{ fontFamily: "Poppins-Bold" }}
            >
              {item.otp}
            </Text>
            <Text
              className="text-orange-600 text-xs mt-1"
              style={{ fontFamily: "Poppins-Regular" }}
            >
              Show this OTP to the restaurant for order pickup
            </Text>
          </View>
        )}

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
          item.status !== "ready_to_pick" &&
          item.status !== "cancelled" && (
            <View className="border-t border-gray-100 pt-3">
              <Text
                className="text-gray-600 mb-2 text-sm"
                style={{ fontFamily: "Poppins-Medium" }}
              >
                Update Status:
              </Text>
              <View className="flex-row flex-wrap">
                {["pending", "ready_to_pick", "cancelled"].map((status) => (
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
                        item.status === status ? "text-white" : "text-gray-700"
                      }`}
                      style={{ fontFamily: "Poppins-Medium" }}
                    >
                      {getStatusText(status)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#f9fafb" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={[styles.loadingText, { fontFamily: "Poppins-Regular" }]}>
            Loading orders...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
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
            {filteredOrders.length}{" "}
            {filteredOrders.length === 1 ? "order" : "orders"} found
          </Text>

          {/* Search Bar */}
          <View className="flex-row items-center bg-gray-50 rounded-xl px-4 py-3 mt-4">
            <MaterialCommunityIcons name="magnify" size={20} color="#9CA3AF" />
            <TextInput
              className="flex-1 ml-3 text-gray-700"
              style={{ fontFamily: "Poppins-Regular" }}
              placeholder="Search orders..."
              placeholderTextColor="#9CA3AF"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <MaterialCommunityIcons
                  name="close-circle"
                  size={20}
                  color="#9CA3AF"
                />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <View className="flex-1 justify-center items-center px-6">
          <MaterialCommunityIcons
            name={searchQuery ? "magnify" : "receipt"}
            size={80}
            color="#ccc"
          />
          <Text
            className="text-xl text-gray-500 mt-4 text-center"
            style={{ fontFamily: "Poppins-SemiBold" }}
          >
            {searchQuery ? "No matching orders found" : "No orders found"}
          </Text>
          <Text
            className="text-gray-400 mt-2 text-center"
            style={{ fontFamily: "Poppins-Regular" }}
          >
            {searchQuery
              ? "Try adjusting your search terms"
              : userRole === "staff"
              ? "No orders have been placed yet."
              : "You haven't placed any orders yet. Start by browsing restaurants!"}
          </Text>
          {!searchQuery && userRole !== "staff" && (
            <TouchableOpacity
              className="bg-orange-500 rounded-xl px-6 py-3 mt-6"
              onPress={() => router.push("/HomeScreen")}
              activeOpacity={0.8}
            >
              <Text
                className="text-white font-bold"
                style={{ fontFamily: "Poppins-Bold" }}
              >
                Browse Restaurants
              </Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={filteredOrders}
          renderItem={renderOrderItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={{ paddingVertical: 16 }}
          showsVerticalScrollIndicator={false}
        />
      )}

      <BottomNavigation userRole={userRole} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    color: "#6b7280",
    fontSize: 16,
  },
  orderCard: {
    backgroundColor: "#ffffff",
    marginBottom: 16,
    marginHorizontal: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  orderContent: {
    padding: 20,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  orderTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "500",
  },
});

export default OrdersScreen;
