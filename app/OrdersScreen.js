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
  KeyboardAvoidingView,
  Platform,
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
        <View style={styles.restaurantInfo}>
          <View style={styles.restaurantNameRow}>
            <MaterialCommunityIcons name="store" size={18} color="#666" />
            <Text
              style={[styles.restaurantName, { fontFamily: "Poppins-Medium" }]}
            >
              {item.restaurantName || item.restaurant?.name || "Restaurant"}
            </Text>
          </View>
          <View style={styles.restaurantLocationRow}>
            <MaterialCommunityIcons name="map-marker" size={18} color="#666" />
            <Text
              style={[
                styles.restaurantLocation,
                { fontFamily: "Poppins-Regular" },
              ]}
            >
              {item.restaurantLocation ||
                item.restaurant?.location ||
                "Location not available"}
            </Text>
          </View>
        </View>

        {/* OTP Display */}
        {item.otp && (
          <View style={styles.otpContainer}>
            <Text style={[styles.otpLabel, { fontFamily: "Poppins-Medium" }]}>
              Pickup OTP:
            </Text>
            <Text style={[styles.otpCode, { fontFamily: "Poppins-Bold" }]}>
              {item.otp}
            </Text>
            <Text
              style={[styles.otpDescription, { fontFamily: "Poppins-Regular" }]}
            >
              Show this OTP to the restaurant for order pickup
            </Text>
          </View>
        )}

        {/* Order Items */}
        <View style={styles.itemsContainer}>
          <Text style={[styles.itemsHeader, { fontFamily: "Poppins-Medium" }]}>
            Items ({item.items?.length || 0}):
          </Text>
          {item.items?.map((orderItem, index) => (
            <View key={index} style={styles.itemRow}>
              <Text
                style={[styles.itemName, { fontFamily: "Poppins-Regular" }]}
              >
                {orderItem.food?.name || "Food Item"} x {orderItem.quantity}
              </Text>
              <Text
                style={[styles.itemPrice, { fontFamily: "Poppins-Medium" }]}
              >
                ₹
                {((orderItem.food?.price || 0) * orderItem.quantity).toFixed(2)}
              </Text>
            </View>
          ))}
        </View>

        {/* Order Details */}
        <View style={styles.orderDetails}>
          <View style={styles.detailRow}>
            <Text
              style={[styles.detailLabel, { fontFamily: "Poppins-Regular" }]}
            >
              Total Amount:
            </Text>
            <Text style={[styles.detailValue, { fontFamily: "Poppins-Bold" }]}>
              ₹{(item.totalAmount || 0).toFixed(2)}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text
              style={[styles.detailLabel, { fontFamily: "Poppins-Regular" }]}
            >
              Order Date:
            </Text>
            <Text
              style={[styles.detailDate, { fontFamily: "Poppins-Regular" }]}
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
            <View style={styles.staffControls}>
              <Text
                style={[
                  styles.staffControlsLabel,
                  { fontFamily: "Poppins-Medium" },
                ]}
              >
                Update Status:
              </Text>
              <View style={styles.statusButtons}>
                {["pending", "ready_to_pick", "cancelled"].map((status) => (
                  <TouchableOpacity
                    key={status}
                    onPress={() => handleUpdateOrderStatus(item._id, status)}
                    style={[
                      styles.statusButton,
                      item.status === status
                        ? styles.activeStatusButton
                        : styles.inactiveStatusButton,
                    ]}
                    disabled={item.status === status}
                  >
                    <Text
                      style={[
                        styles.statusButtonText,
                        { fontFamily: "Poppins-Medium" },
                        item.status === status
                          ? styles.activeStatusButtonText
                          : styles.inactiveStatusButtonText,
                      ]}
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

      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={[styles.headerTitle, { fontFamily: "Poppins-Bold" }]}>
              {userRole === "staff" ? "All Orders" : "My Orders"}
            </Text>
            <Text
              style={[styles.headerSubtitle, { fontFamily: "Poppins-Regular" }]}
            >
              {filteredOrders.length}{" "}
              {filteredOrders.length === 1 ? "order" : "orders"} found
            </Text>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
              <MaterialCommunityIcons
                name="magnify"
                size={20}
                color="#9CA3AF"
              />
              <TextInput
                style={[styles.searchInput, { fontFamily: "Poppins-Regular" }]}
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
          <View style={styles.emptyState}>
            <MaterialCommunityIcons
              name={searchQuery ? "magnify" : "receipt"}
              size={80}
              color="#ccc"
            />
            <Text
              style={[styles.emptyTitle, { fontFamily: "Poppins-SemiBold" }]}
            >
              {searchQuery ? "No matching orders found" : "No orders found"}
            </Text>
            <Text
              style={[styles.emptySubtitle, { fontFamily: "Poppins-Regular" }]}
            >
              {searchQuery
                ? "Try adjusting your search terms"
                : userRole === "staff"
                ? "No orders have been placed yet."
                : "You haven't placed any orders yet. Start by browsing restaurants!"}
            </Text>
            {!searchQuery && userRole !== "staff" && (
              <TouchableOpacity
                style={styles.browseButton}
                onPress={() => router.push("/HomeScreen")}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.browseButtonText,
                    { fontFamily: "Poppins-Bold" },
                  ]}
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
      </KeyboardAvoidingView>

      <BottomNavigation userRole={userRole} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  keyboardAvoidingView: {
    flex: 1,
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
  restaurantInfo: {
    marginBottom: 12,
  },
  restaurantNameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  restaurantName: {
    marginLeft: 8,
    color: "#374151",
    fontWeight: "600",
    fontSize: 14,
  },
  restaurantLocationRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  restaurantLocation: {
    marginLeft: 8,
    color: "#6b7280",
    fontSize: 14,
  },
  otpContainer: {
    marginBottom: 12,
    padding: 12,
    backgroundColor: "#fef3c7",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#fde68a",
  },
  otpLabel: {
    color: "#b45309",
    fontSize: 14,
    marginBottom: 4,
  },
  otpCode: {
    color: "#92400e",
    fontSize: 20,
    fontWeight: "bold",
  },
  otpDescription: {
    color: "#d97706",
    fontSize: 12,
    marginTop: 4,
  },
  itemsContainer: {
    marginBottom: 16,
  },
  itemsHeader: {
    color: "#6b7280",
    fontSize: 14,
    marginBottom: 8,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  itemName: {
    color: "#1f2937",
    fontSize: 14,
    flex: 1,
  },
  itemPrice: {
    color: "#6b7280",
    fontSize: 14,
    fontWeight: "500",
  },
  orderDetails: {
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
    paddingTop: 12,
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  detailLabel: {
    color: "#6b7280",
    fontSize: 14,
  },
  detailValue: {
    color: "#059669",
    fontSize: 18,
    fontWeight: "bold",
  },
  detailDate: {
    color: "#1f2937",
    fontSize: 14,
  },
  staffControls: {
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
    paddingTop: 12,
  },
  staffControlsLabel: {
    color: "#6b7280",
    fontSize: 14,
    marginBottom: 8,
  },
  statusButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  statusButton: {
    marginRight: 8,
    marginBottom: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  activeStatusButton: {
    backgroundColor: "#3b82f6",
  },
  inactiveStatusButton: {
    backgroundColor: "#f3f4f6",
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  statusButtonText: {
    fontSize: 14,
    fontWeight: "500",
  },
  activeStatusButtonText: {
    color: "#ffffff",
  },
  inactiveStatusButtonText: {
    color: "#374151",
  },
  header: {
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  headerContent: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1f2937",
  },
  headerSubtitle: {
    color: "#6b7280",
    marginTop: 4,
    fontSize: 14,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginTop: 16,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    color: "#374151",
    fontSize: 14,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 20,
    color: "#6b7280",
    marginTop: 16,
    textAlign: "center",
  },
  emptySubtitle: {
    color: "#9ca3af",
    marginTop: 8,
    textAlign: "center",
    fontSize: 14,
  },
  browseButton: {
    backgroundColor: "#f97316",
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
    marginTop: 24,
  },
  browseButtonText: {
    color: "#ffffff",
    fontSize: 16,
  },
});

export default OrdersScreen;
