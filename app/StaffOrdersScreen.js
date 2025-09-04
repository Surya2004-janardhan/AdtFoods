import React, { useState, useEffect } from "react";
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
import BottomNavigation from "../components/BottomNavigation";
import Toast from "react-native-toast-message";

const StaffOrdersScreen = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, pending, in_progress, completed
  const router = useRouter();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);

        // Mock orders data - replace with actual API call
        const mockOrders = [
          {
            id: "1",
            orderNumber: "#ORD001",
            customerName: "John Doe",
            customerPhone: "+91 9999999999",
            items: ["Chicken Biryani x2", "Paneer Tikka x1"],
            total: 680,
            status: "pending",
            orderTime: "12:30 PM",
            estimatedTime: "45 mins",
            address: "123 Main Street, City",
          },
          {
            id: "2",
            orderNumber: "#ORD002",
            customerName: "Jane Smith",
            customerPhone: "+91 8888888888",
            items: ["Pizza Margherita x1", "Garlic Bread x2"],
            total: 520,
            status: "in_progress",
            orderTime: "12:15 PM",
            estimatedTime: "30 mins",
            address: "456 Oak Avenue, City",
          },
          {
            id: "3",
            orderNumber: "#ORD003",
            customerName: "Mike Johnson",
            customerPhone: "+91 7777777777",
            items: ["Burger Combo x1", "French Fries x1"],
            total: 350,
            status: "completed",
            orderTime: "11:45 AM",
            estimatedTime: "25 mins",
            address: "789 Pine Road, City",
          },
        ];

        setTimeout(() => {
          setOrders(mockOrders);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error("Error fetching orders:", error);
        setLoading(false);
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Failed to load orders",
        });
      }
    };

    fetchOrders();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "#FF6B00";
      case "in_progress":
        return "#2196F3";
      case "completed":
        return "#4CAF50";
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
      case "completed":
        return "Ready";
      default:
        return "Unknown";
    }
  };

  const updateOrderStatus = (orderId, newStatus) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );

    Toast.show({
      type: "success",
      text1: "Status Updated",
      text2: `Order status changed to ${getStatusText(newStatus)}`,
    });
  };

  const getFilteredOrders = () => {
    if (filter === "all") return orders;
    return orders.filter((order) => order.status === filter);
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

  const renderOrder = ({ item }) => (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <View>
          <Text style={styles.orderNumber}>{item.orderNumber}</Text>
          <Text style={styles.orderTime}>{item.orderTime}</Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.status) },
          ]}
        >
          <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
        </View>
      </View>

      <View style={styles.customerInfo}>
        <MaterialCommunityIcons name="account" size={16} color="#666666" />
        <Text style={styles.customerName}>{item.customerName}</Text>
        <TouchableOpacity
          style={styles.callButton}
          onPress={() => {
            Toast.show({
              type: "info",
              text1: "Call Customer",
              text2: item.customerPhone,
            });
          }}
        >
          <MaterialCommunityIcons name="phone" size={16} color="#FF6B00" />
        </TouchableOpacity>
      </View>

      <View style={styles.itemsList}>
        {item.items.map((foodItem, index) => (
          <Text key={index} style={styles.itemText}>
            • {foodItem}
          </Text>
        ))}
      </View>

      <View style={styles.orderFooter}>
        <View>
          <Text style={styles.estimatedTime}>Est. {item.estimatedTime}</Text>
          <Text style={styles.orderTotal}>₹{item.total}</Text>
        </View>

        {item.status !== "completed" && (
          <View style={styles.actionButtons}>
            {item.status === "pending" && (
              <TouchableOpacity
                style={[styles.actionButton, styles.acceptButton]}
                onPress={() => updateOrderStatus(item.id, "in_progress")}
              >
                <MaterialCommunityIcons
                  name="check"
                  size={16}
                  color="#FFFFFF"
                />
                <Text style={styles.actionButtonText}>Accept</Text>
              </TouchableOpacity>
            )}
            {item.status === "in_progress" && (
              <TouchableOpacity
                style={[styles.actionButton, styles.readyButton]}
                onPress={() => updateOrderStatus(item.id, "completed")}
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

      {/* Bottom Navigation */}
      <BottomNavigation userRole="staff" />
      <Toast />
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
    fontFamily: "Poppins",
    fontSize: 16,
    color: "#666666",
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
  },
  headerTitle: {
    fontFamily: "PlayfairDisplay-Bold",
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
