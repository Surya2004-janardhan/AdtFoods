import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import BottomNavigation from "../components/BottomNavigation";

const NotificationsScreen = () => {
  const [userRole, setUserRole] = useState("user");
  const router = useRouter();

  useEffect(() => {
    const getUserRole = async () => {
      try {
        const role = (await AsyncStorage.getItem("userRole")) || "user";
        setUserRole(role);
      } catch (error) {
        console.error("Error getting user role:", error);
      }
    };

    getUserRole();
  }, []);

  const handleGoBack = () => {
    router.back();
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" backgroundColor="#f9fafb" />

      {/* Header */}
      <View className="bg-white shadow-sm border-b border-gray-100">
        <View className="flex-row items-center px-6 py-4">
          <TouchableOpacity
            onPress={handleGoBack}
            className="mr-4 p-2 rounded-full"
            activeOpacity={0.8}
          >
            <MaterialCommunityIcons
              name="arrow-left"
              size={24}
              color="#374151"
            />
          </TouchableOpacity>

          <Text
            className="text-xl font-bold text-gray-900 flex-1"
            style={{ fontFamily: "Poppins-Bold" }}
          >
            Notifications
          </Text>

          <MaterialCommunityIcons name="bell" size={24} color="#F97316" />
        </View>
      </View>

      {/* Coming Soon Content */}
      <View className="flex-1 justify-center items-center px-8">
        <View className="bg-orange-100 rounded-full p-6 mb-6">
          <MaterialCommunityIcons name="bell-ring" size={64} color="#F97316" />
        </View>

        <Text
          className="text-3xl font-bold text-gray-900 text-center mb-4"
          style={{ fontFamily: "Poppins-Bold" }}
        >
          Coming Soon!
        </Text>

        <Text
          className="text-lg text-gray-600 text-center mb-8 leading-6"
          style={{ fontFamily: "Poppins-Regular" }}
        >
          We're working on bringing you real-time notifications for your orders,
          special offers, and restaurant updates.
        </Text>

        <View className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 w-full">
          <Text
            className="text-lg font-semibold text-gray-900 mb-3"
            style={{ fontFamily: "Poppins-SemiBold" }}
          >
            What's Coming:
          </Text>

          <View className="space-y-3">
            <View className="flex-row items-center">
              <View className="bg-green-100 rounded-full p-2 mr-3">
                <MaterialCommunityIcons
                  name="check"
                  size={16}
                  color="#10B981"
                />
              </View>
              <Text
                className="text-gray-700 flex-1"
                style={{ fontFamily: "Poppins-Regular" }}
              >
                Order status updates
              </Text>
            </View>

            <View className="flex-row items-center">
              <View className="bg-blue-100 rounded-full p-2 mr-3">
                <MaterialCommunityIcons name="tag" size={16} color="#3B82F6" />
              </View>
              <Text
                className="text-gray-700 flex-1"
                style={{ fontFamily: "Poppins-Regular" }}
              >
                Special offers & discounts
              </Text>
            </View>

            <View className="flex-row items-center">
              <View className="bg-purple-100 rounded-full p-2 mr-3">
                <MaterialCommunityIcons
                  name="store-plus"
                  size={16}
                  color="#8B5CF6"
                />
              </View>
              <Text
                className="text-gray-700 flex-1"
                style={{ fontFamily: "Poppins-Regular" }}
              >
                New restaurant alerts
              </Text>
            </View>

            <View className="flex-row items-center">
              <View className="bg-orange-100 rounded-full p-2 mr-3">
                <MaterialCommunityIcons name="food" size={16} color="#F97316" />
              </View>
              <Text
                className="text-gray-700 flex-1"
                style={{ fontFamily: "Poppins-Regular" }}
              >
                New menu item notifications
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          onPress={handleGoBack}
          className="bg-orange-500 rounded-2xl py-4 px-8 mt-8 shadow-lg"
          activeOpacity={0.8}
          style={{
            shadowColor: "#F97316",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
          }}
        >
          <Text
            className="text-white font-bold text-lg"
            style={{ fontFamily: "Poppins-Bold" }}
          >
            Back to Home
          </Text>
        </TouchableOpacity>
      </View>

      <BottomNavigation userRole={userRole} />
    </SafeAreaView>
  );
};

export default NotificationsScreen;
