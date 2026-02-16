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
import Toast from "react-native-toast-message";
import OrdersContext from "../context/OrdersContext";

const StaffOrdersScreen = () => {
  const { orders, loading, fetchAllOrders, updateOrderStatus: updateOrderStatusContext } =
    useContext(OrdersContext);
  const [filter, setFilter] = useState("all"); // all, pending, in_progress, completed
  const [updatingOrders, setUpdatingOrders] = useState({});
  const router = useRouter();

  useEffect(() => {
    const loadOrders = async () => {
      const result = await fetchAllOrders();
      if (!result.success && result.error) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: result.error,
        });
      }
    };

    loadOrders();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "#FF6B00";
      case "in_progress":
        return "#2196F3";
      case "ready_to_pick":
        return "#4CAF50";
      case "completed":
        return "#4CAF50";
      case "cancelled":
        return "#FF4444";
      default:
        return "#666666";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "pending":
        return "New Order";
      case "in_progress":
        return "Preparing";
      case "ready_to_pick":
        return "Ready";
      case "completed":
        return "Completed";
      case "cancelled":
        return "Cancelled";
      default:
        return "Unknown";
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    // Prevent multiple simultaneous updates for the same order
    if (updatingOrders[orderId]) return;

    try {
      // Mark order as updating
      setUpdatingOrders((prev) => ({ ...prev, [orderId]: true }));

      await updateOrderStatusContext(orderId, newStatus);

      Toast.show({
        type: "success",
        text1: "Status Updated",
        text2: `Order status changed to ${getStatusText(newStatus)}`,
      });
    } catch (error) {
      console.error("Error updating order status:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: error.message || "Failed to update order status",
      });
    } finally {
      // Remove loading state
      setUpdatingOrders((prev) => {
        const newState = { ...prev };
        delete newState[orderId];
        return newState;
      });
    }
  };

  const getFilteredOrders = () => {
    if (filter === "all") return orders;
    return orders.filter((order) => order.status === filter);
  };

  // Helper function to get normalized order ID
  const getOrderId = (order) => order._id || order.id;

  // Helper function to format food item display
  const formatFoodItemDisplay = (foodItem) => {
    if (typeof foodItem === 'string') {
      return foodItem;
    }
    const itemName = foodItem.food?.name || 'Item';
    const quantity = foodItem.quantity || 1;
    return `${itemName} x${quantity}`;
  };

  const FilterButton = ({ title, value, count }) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        filter === value && styles.activeFilterButton,
      ]}
      onPress={() => setFilter(value)}
    >
      <Text
        style={[
          styles.filterButtonText,
          filter === value && styles.activeFilterButtonText,
        ]}
      >
        {title}
      </Text>
      {count > 0 && (
        <View
          style={[
            styles.filterBadge,
            filter === value && styles.activeFilterBadge,
          ]}
        >
          <Text
            style={[
              styles.filterBadgeText,
              filter === value && styles.activeFilterBadgeText,
            ]}
          >
            {count}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderOrder = ({ item }) => {
    const orderId = getOrderId(item);
    const isUpdating = updatingOrders[orderId];

    return (
      <View style={[styles.orderCard, isUpdating && { opacity: 0.6 }]}>
        <View style={styles.orderHeader}>
          <View>
            <Text style={styles.orderNumber}>
              #{item.orderNumber || item._id?.slice(-6)}
            </Text>
            <Text style={styles.orderTime}>
              {new Date(item.createdAt || Date.now()).toLocaleTimeString()}
            </Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(item.status) },
            ]}
          >
            <Text style={styles.statusText}>
              {isUpdating ? "Updating..." : getStatusText(item.status)}
            </Text>
          </View>
        </View>

        <View style={styles.customerInfo}>
          <MaterialCommunityIcons name="account" size={16} color="#666666" />
          <Text style={styles.customerName}>
            {item.customerName || "Customer"}
          </Text>
          <TouchableOpacity
            style={styles.callButton}
            onPress={() => {
              Toast.show({
                type: "info",
                text1: "Call Customer",
                text2: item.customerPhone || "N/A",
              });
            }}
          >
            <MaterialCommunityIcons name="phone" size={16} color="#FF6B00" />
          </TouchableOpacity>
        </View>

        <View style={styles.itemsList}>
          {(item.items || []).map((foodItem, index) => (
            <Text key={index} style={styles.itemText}>
              • {formatFoodItemDisplay(foodItem)}
            </Text>
          ))}
        </View>

        <View style={styles.orderFooter}>
          <View>
            <Text style={styles.estimatedTime}>
              Est. {item.estimatedTime || "30 mins"}
            </Text>
            <Text style={styles.orderTotal}>₹{item.totalAmount || item.total}</Text>
          </View>

          {item.status !== "completed" && item.status !== "ready_to_pick" && (
            <View style={styles.actionButtons}>
              {item.status === "pending" && (
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    styles.acceptButton,
                    isUpdating && { opacity: 0.5 },
                  ]}
                  onPress={() => updateOrderStatus(orderId, "ready_to_pick")}
                  disabled={isUpdating}
                >
                  <MaterialCommunityIcons
                    name="check"
                    size={16}
                    color="#FFFFFF"
                  />
                  <Text style={styles.actionButtonText}>Mark Ready</Text>
                </TouchableOpacity>
              )}
              {item.status === "in_progress" && (
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    styles.readyButton,
                    isUpdating && { opacity: 0.5 },
                  ]}
                  onPress={() => updateOrderStatus(orderId, "ready_to_pick")}
                  disabled={isUpdating}
                >
                  <MaterialCommunityIcons
                    name="check-all"
                    size={16}
                    color="#FFFFFF"
                  />
                  <Text style={styles.actionButtonText}>Ready</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.loadingContent}>
          <View style={styles.loadingIcon}>
            <MaterialCommunityIcons
              name="clipboard-list"
              size={48}
              color="#FF6B00"
            />
          </View>
          <ActivityIndicator size="large" color="#FF6B00" />
          <Text style={styles.loadingText}>Loading orders...</Text>
        </View>
      </View>
    );
  }

  const filteredOrders = getFilteredOrders();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Order Management</Text>
          <Text style={styles.headerSubtitle}>Manage incoming orders</Text>
        </View>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={() => {
            Toast.show({
              type: "success",
              text1: "Refreshed",
              text2: "Orders list updated",
            });
          }}
        >
          <MaterialCommunityIcons name="refresh" size={24} color="#FF6B00" />
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <FilterButton title="All" value="all" count={orders.length} />
        <FilterButton
          title="Pending"
          value="pending"
          count={orders.filter((o) => o.status === "pending").length}
        />
        <FilterButton
          title="Preparing"
          value="in_progress"
          count={orders.filter((o) => o.status === "in_progress").length}
        />
        <FilterButton
          title="Ready"
          value="completed"
          count={orders.filter((o) => o.status === "completed").length}
        />
      </View>

      {/* Orders List */}
      <FlatList
        data={filteredOrders}
        renderItem={renderOrder}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons
              name="clipboard-text-outline"
              size={64}
              color="#CCCCCC"
            />
            <Text style={styles.emptyText}>No orders in this category</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContent: {
    alignItems: "center",
    gap: 16,
  },
  loadingIcon: {
    width: 80,
    height: 80,
    backgroundColor: "#FFF8F0",
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  loadingText: {
    fontFamily: "Poppins-Bold",
    fontSize: 16,
    color: "#333333",
    marginTop: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    minHeight: 72,
  },
  headerTitle: {
    fontFamily: "Poppins-Bold",
    fontSize: 20,
    color: "#333333",
  },
  headerSubtitle: {
    fontFamily: "Poppins",
    fontSize: 12,
    color: "#666666",
    marginTop: 2,
  },
  refreshButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FFF8F0",
    justifyContent: "center",
    alignItems: "center",
  },
  filterContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    gap: 8,
  },
  filterButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: "#F8F9FA",
    gap: 4,
  },
  activeFilterButton: {
    backgroundColor: "#FF6B00",
  },
  filterButtonText: {
    fontFamily: "Poppins",
    fontSize: 12,
    color: "#666666",
  },
  activeFilterButtonText: {
    color: "#FFFFFF",
  },
  filterBadge: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: "center",
  },
  activeFilterBadge: {
    backgroundColor: "#FFFFFF",
  },
  filterBadgeText: {
    fontFamily: "Poppins-Bold",
    fontSize: 10,
    color: "#FF6B00",
  },
  activeFilterBadgeText: {
    color: "#FF6B00",
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 100, // Space for bottom navigation
  },
  orderCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  orderNumber: {
    fontFamily: "Poppins-Bold",
    fontSize: 16,
    color: "#333333",
  },
  orderTime: {
    fontFamily: "Poppins",
    fontSize: 12,
    color: "#666666",
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontFamily: "Poppins-Bold",
    fontSize: 12,
    color: "#FFFFFF",
  },
  customerInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  customerName: {
    fontFamily: "Poppins",
    fontSize: 14,
    color: "#333333",
    flex: 1,
  },
  callButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FFF8F0",
    justifyContent: "center",
    alignItems: "center",
  },
  itemsList: {
    marginBottom: 16,
  },
  itemText: {
    fontFamily: "Poppins",
    fontSize: 12,
    color: "#666666",
    marginBottom: 4,
  },
  orderFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  estimatedTime: {
    fontFamily: "Poppins",
    fontSize: 12,
    color: "#666666",
  },
  orderTotal: {
    fontFamily: "Poppins-Bold",
    fontSize: 16,
    color: "#FF6B00",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 8,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
  },
  acceptButton: {
    backgroundColor: "#2196F3",
  },
  readyButton: {
    backgroundColor: "#4CAF50",
  },
  actionButtonText: {
    fontFamily: "Poppins-Bold",
    fontSize: 12,
    color: "#FFFFFF",
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontFamily: "Poppins",
    fontSize: 14,
    color: "#666666",
    textAlign: "center",
    marginTop: 16,
  },
});

export default StaffOrdersScreen;
