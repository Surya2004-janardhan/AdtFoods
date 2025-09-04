import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import axios from "../axiosConfig";
import { useRouter } from "expo-router";
import { Feather, MaterialIcons } from "@expo/vector-icons";

const StaffOrdersScreen = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/orders");
      const sortedData = response.data.sort((a, b) =>
        a.status === "pending" ? -1 : 1
      );
      setOrders(sortedData);
      setFilteredOrders(sortedData);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOrderStatus = async (id, status) => {
    try {
      const response = await axios.patch(`/orders/${id}`, { status });
      if (response.status === 200) {
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order._id === id ? { ...order, status } : order
          )
        );
        setFilteredOrders((prevOrders) =>
          prevOrders.map((order) =>
            order._id === id ? { ...order, status } : order
          )
        );
      }
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  };

  const formatAmount = (amount) => {
    return isNaN(parseFloat(amount)) ? "0.00" : parseFloat(amount).toFixed(2);
  };

  const handleSearch = (text) => {
    setSearchTerm(text);
    const filtered = orders.filter(
      (order) =>
        order.user_email?.toLowerCase().includes(text.toLowerCase()) ||
        order.user_name?.toLowerCase().includes(text.toLowerCase()) ||
        order.user_phone?.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredOrders(filtered);
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchOrders().finally(() => setRefreshing(false));
  }, []);

  const goBack = () => {
    router.back();
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const getOrderStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "accepted":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getOrderStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return <MaterialIcons name="check-circle" size={18} color="#22C55E" />;
      case "accepted":
        return <MaterialIcons name="hourglass-top" size={18} color="#3B82F6" />;
      case "pending":
        return <MaterialIcons name="schedule" size={18} color="#EAB308" />;
      case "rejected":
        return <MaterialIcons name="cancel" size={18} color="#EF4444" />;
      default:
        return <MaterialIcons name="help" size={18} color="#9CA3AF" />;
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-accent-cream">
        <StatusBar barStyle="dark-content" backgroundColor="#FFF8EE" />
        <ActivityIndicator size="large" color="#FF6B00" />
        <Text className="mt-4 text-secondary font-['Poppins'] text-lg">
          Loading orders...
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-accent-cream">
      <StatusBar barStyle="dark-content" backgroundColor="#FFF8EE" />

      {/* Header */}
      <View className="px-6 pt-14 pb-4 bg-primary">
        <View className="flex-row justify-between items-center">
          <TouchableOpacity onPress={goBack} className="p-2">
            <Feather name="arrow-left" size={24} color="white" />
          </TouchableOpacity>
          <Text className="font-['PlayfairDisplay-Bold'] text-2xl text-white">
            Order Management
          </Text>
          <TouchableOpacity onPress={onRefresh} className="p-2">
            <Feather name="refresh-cw" size={20} color="white" />
          </TouchableOpacity>
        </View>
        <Text className="font-['Poppins'] text-sm text-accent-off mt-1">
          Staff Control Panel
        </Text>
      </View>

      {/* Search Bar */}
      <View className="px-5 py-3">
        <View className="flex-row items-center bg-white rounded-xl px-3 py-2 shadow-sm">
          <Feather name="search" size={20} color="#FF6B00" />
          <TextInput
            className="flex-1 ml-2 font-['Poppins'] text-secondary"
            placeholder="Search orders by name, email, phone..."
            placeholderTextColor="#9CA3AF"
            value={searchTerm}
            onChangeText={handleSearch}
          />
          {searchTerm.length > 0 && (
            <TouchableOpacity onPress={() => handleSearch("")}>
              <Feather name="x-circle" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <FlatList
        data={filteredOrders}
        keyExtractor={(item, index) =>
          item.id ? item.id.toString() : `order-${index}`
        }
        renderItem={({ item }) => (
          <View className="mx-5 my-2 bg-white rounded-xl overflow-hidden shadow-md">
            <View className="bg-primary-light px-4 py-3 flex-row justify-between items-center">
              <Text className="font-['Poppins-Bold'] text-white">
                Order #{item.order_id || "N/A"}
              </Text>
              <View className="flex-row items-center">
                {getOrderStatusIcon(item.status)}
                <Text className="font-['Poppins'] text-white ml-1">
                  {item.status || "Unknown"}
                </Text>
              </View>
            </View>

            <View className="p-4">
              <View className="border-l-4 border-primary pl-3 mb-4">
                <Text className="font-['PlayfairDisplay-Bold'] text-lg text-secondary">
                  Customer Details
                </Text>
                <Text className="font-['Poppins'] text-xs text-secondary-light">
                  {new Date(item.created_at).toLocaleString()}
                </Text>
              </View>

              <View className="flex-row items-center mb-3">
                <Feather
                  name="user"
                  size={16}
                  color="#FF6B00"
                  className="mr-2"
                />
                <Text className="font-['Poppins'] text-secondary-light mr-2">
                  Name:
                </Text>
                <Text className="font-['Poppins-Medium'] text-secondary">
                  {item.user_name || "N/A"}
                </Text>
              </View>

              <View className="flex-row items-center mb-3">
                <Feather
                  name="mail"
                  size={16}
                  color="#FF6B00"
                  className="mr-2"
                />
                <Text className="font-['Poppins'] text-secondary-light mr-2">
                  Email:
                </Text>
                <Text className="font-['Poppins-Medium'] text-secondary">
                  {item.user_email || "N/A"}
                </Text>
              </View>

              <View className="flex-row items-center mb-3">
                <Feather
                  name="phone"
                  size={16}
                  color="#FF6B00"
                  className="mr-2"
                />
                <Text className="font-['Poppins'] text-secondary-light mr-2">
                  Phone:
                </Text>
                <Text className="font-['Poppins-Medium'] text-secondary">
                  {item.user_phone || "N/A"}
                </Text>
              </View>

              <View className="mb-3">
                <View className="flex-row items-center mb-1">
                  <Feather
                    name="shopping-bag"
                    size={16}
                    color="#FF6B00"
                    className="mr-2"
                  />
                  <Text className="font-['Poppins'] text-secondary-light">
                    Items:
                  </Text>
                </View>
                <Text className="font-['Poppins'] text-secondary ml-6 mt-1">
                  {item.items || "No items"}
                </Text>
              </View>

              <View className="h-px bg-gray-100 my-3" />

              <View className="flex-row justify-between items-center">
                <Text className="font-['Poppins-Bold'] text-secondary">
                  Total:
                </Text>
                <Text className="font-['PlayfairDisplay-Bold'] text-xl text-primary">
                  ₹{formatAmount(item.total_amount)}
                </Text>
              </View>

              {item.status === "pending" && (
                <View className="flex-row mt-4 gap-3">
                  <TouchableOpacity
                    className="flex-1 bg-green-500 py-3 rounded-lg items-center"
                    onPress={() => handleOrderStatus(item._id, "accepted")}
                  >
                    <Text className="font-['Poppins-Bold'] text-white">
                      Accept
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    className="flex-1 bg-red-500 py-3 rounded-lg items-center"
                    onPress={() => handleOrderStatus(item._id, "rejected")}
                  >
                    <Text className="font-['Poppins-Bold'] text-white">
                      Reject
                    </Text>
                  </TouchableOpacity>
                </View>
              )}

              {item.status === "accepted" && (
                <TouchableOpacity
                  className="mt-4 bg-primary py-3 rounded-lg items-center"
                  onPress={() => handleOrderStatus(item._id, "completed")}
                >
                  <Text className="font-['Poppins-Bold'] text-white">
                    Mark as Completed
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#FF6B00"]}
            tintColor="#FF6B00"
          />
        }
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center p-8 mt-10">
            <MaterialIcons name="receipt-long" size={64} color="#CCCCCC" />
            <Text className="font-['PlayfairDisplay-Bold'] text-xl text-secondary mt-4">
              No Orders Yet
            </Text>
            <Text className="font-['Poppins'] text-secondary-light text-center mt-2">
              There are currently no orders in the system
            </Text>
          </View>
        }
        contentContainerStyle={{
          paddingVertical: 10,
          paddingBottom: 80,
          flexGrow: filteredOrders.length === 0 ? 1 : undefined,
        }}
      />

      {/* Bottom Navigation */}
      <View className="absolute bottom-0 left-0 right-0 bg-secondary rounded-t-2xl shadow-xl">
        <View className="flex-row justify-around items-center py-4">
          <TouchableOpacity
            className="items-center"
            onPress={() => router.push("/StaffFoodItemsScreen")}
          >
            <View className="w-12 h-12 rounded-full bg-accent-off justify-center items-center mb-1">
              <Feather name="menu" size={24} color="#FF6B00" />
            </View>
            <Text className="text-accent text-xs font-['Poppins']">Menu</Text>
          </TouchableOpacity>

          <TouchableOpacity className="items-center opacity-50">
            <View className="w-12 h-12 rounded-full bg-accent-off justify-center items-center mb-1">
              <Feather name="clipboard" size={24} color="#FF6B00" />
            </View>
            <Text className="text-accent text-xs font-['Poppins']">Orders</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="items-center"
            onPress={() => {
              global.userProfile = null;
              router.replace("/AuthScreen");
            }}
          >
            <View className="w-12 h-12 rounded-full bg-accent-off justify-center items-center mb-1">
              <MaterialIcons name="logout" size={24} color="#FF6B00" />
            </View>
            <Text className="text-accent text-xs font-['Poppins']">Logout</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default StaffOrdersScreen;
