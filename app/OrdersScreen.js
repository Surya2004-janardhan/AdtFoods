import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import axios from "../axiosConfig";

const OrdersScreen = () => {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const profileData = await AsyncStorage.getItem("userProfile");
        if (profileData) {
          setUserProfile(JSON.parse(profileData));
        }
      } catch (error) {
        console.error("Error retrieving user profile:", error);
      }
    };

    fetchUserProfile();
  }, []);

  useEffect(() => {
    if (userProfile) {
      fetchOrders();
    }
  }, [userProfile]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/orders");
      if (userProfile) {
        const userOrders = response.data.filter(
          (order) => order.user_email === userProfile.email
        );
        setOrders(userOrders);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const invalidOrders = orders.filter((order) => !order?.id);
    if (invalidOrders.length) {
      console.warn("Some orders have no ID:", invalidOrders);
    }
  }, [orders]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchOrders().finally(() => setRefreshing(false));
  }, [userProfile]);

  const goBack = () => {
    router.back();
  };

  const getOrderStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getOrderStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return <MaterialIcons name="check-circle" size={18} color="#22C55E" />;
      case "processing":
        return <MaterialIcons name="hourglass-top" size={18} color="#3B82F6" />;
      case "pending":
        return <MaterialIcons name="schedule" size={18} color="#EAB308" />;
      case "cancelled":
        return <MaterialIcons name="cancel" size={18} color="#EF4444" />;
      default:
        return <MaterialIcons name="help" size={18} color="#9CA3AF" />;
    }
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-accent-cream">
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
            Your Orders
          </Text>
          <TouchableOpacity onPress={onRefresh} className="p-2">
            <Feather name="refresh-cw" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={orders}
        keyExtractor={(item, index) => {
          return item?.id ? item.id.toString() : `${index}-${item.user_email}`;
        }}
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
                  Order Details
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
                  {item.user_name}
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
                  {item.user_phone}
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
                  {item.items}
                </Text>
              </View>

              <View className="h-px bg-gray-100 my-3" />

              <View className="flex-row justify-between items-center">
                <Text className="font-['Poppins-Bold'] text-secondary">
                  Total:
                </Text>
                <Text className="font-['PlayfairDisplay-Bold'] text-xl text-primary">
                  ₹{parseFloat(item.total_amount).toFixed(2)}
                </Text>
              </View>
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
              Your order history will appear here once you place an order
            </Text>
            <TouchableOpacity
              className="mt-6 bg-primary px-6 py-3 rounded-lg"
              onPress={() => router.replace("/UserFoodItemsScreen")}
            >
              <Text className="font-['Poppins-Medium'] text-white">
                Order Now
              </Text>
            </TouchableOpacity>
          </View>
        }
        contentContainerStyle={{
          paddingVertical: 10,
          paddingBottom: 20,
          flexGrow: orders.length === 0 ? 1 : undefined,
        }}
      />
    </View>
  );
};

export default OrdersScreen;
