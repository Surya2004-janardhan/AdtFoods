import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  Alert,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import AuthContext from "../context/AuthContext";

const AccountScreen = () => {
  const [userProfile, setUserProfile] = useState({});
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { logout } = useContext(AuthContext);

  useEffect(() => {
    const getUserProfile = async () => {
      try {
        setLoading(true);
        const profileData = await AsyncStorage.getItem("userProfile");
        if (profileData) {
          setUserProfile(JSON.parse(profileData));
        }
      } catch (error) {
        console.error("Error retrieving user profile:", error);
      } finally {
        setLoading(false);
      }
    };

    getUserProfile();
  }, []);

  const handleLogout = async () => {
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Log Out",
        onPress: async () => {
          try {
            await logout();
            router.replace("/AuthScreen");
          } catch (error) {
            console.error("Error during logout:", error);
          }
        },
        style: "destructive",
      },
    ]);
  };

  const goBack = () => {
    router.back();
  };

  const navigateToOrders = () => {
    router.push("/OrdersScreen");
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-accent-cream">
        <ActivityIndicator size="large" color="#FF6B00" />
        <Text className="mt-4 text-secondary font-['Poppins'] text-lg">
          Loading profile...
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
            Profile
          </Text>
          <TouchableOpacity onPress={handleLogout} className="p-2">
            <Feather name="log-out" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Profile Header */}
      <View className="items-center mt-8 mb-6">
        <View className="w-24 h-24 rounded-full bg-primary-light items-center justify-center">
          <Text className="font-['PlayfairDisplay-Bold'] text-4xl text-white">
            {userProfile.name?.charAt(0) || "U"}
          </Text>
        </View>
        <Text className="font-['PlayfairDisplay-Bold'] text-2xl text-secondary mt-3">
          {userProfile.name || "User"}
        </Text>
      </View>

      {/* Profile Details */}
      <View className="mx-5 bg-white rounded-xl shadow-md overflow-hidden">
        <View className="px-5 py-3 bg-primary-light">
          <Text className="font-['Poppins-Bold'] text-white">
            Account Information
          </Text>
        </View>

        <View className="p-5">
          <View className="flex-row items-center mb-4">
            <View className="w-10 h-10 rounded-full bg-primary-light/20 items-center justify-center mr-4">
              <Feather name="hash" size={18} color="#FF6B00" />
            </View>
            <View>
              <Text className="font-['Poppins'] text-xs text-secondary-light">
                User ID
              </Text>
              <Text className="font-['Poppins-Medium'] text-secondary">
                {userProfile.id || "N/A"}
              </Text>
            </View>
          </View>

          <View className="flex-row items-center mb-4">
            <View className="w-10 h-10 rounded-full bg-primary-light/20 items-center justify-center mr-4">
              <Feather name="mail" size={18} color="#FF6B00" />
            </View>
            <View>
              <Text className="font-['Poppins'] text-xs text-secondary-light">
                Email
              </Text>
              <Text className="font-['Poppins-Medium'] text-secondary">
                {userProfile.email || "N/A"}
              </Text>
            </View>
          </View>

          <View className="flex-row items-center">
            <View className="w-10 h-10 rounded-full bg-primary-light/20 items-center justify-center mr-4">
              <Feather name="phone" size={18} color="#FF6B00" />
            </View>
            <View>
              <Text className="font-['Poppins'] text-xs text-secondary-light">
                Phone
              </Text>
              <Text className="font-['Poppins-Medium'] text-secondary">
                {userProfile.phone || "N/A"}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View className="mx-5 mt-6">
        <Text className="font-['PlayfairDisplay-Bold'] text-lg text-secondary mb-3">
          Quick Actions
        </Text>

        <TouchableOpacity
          className="flex-row items-center bg-white p-4 rounded-xl shadow-sm mb-3"
          onPress={navigateToOrders}
        >
          <View className="w-10 h-10 rounded-full bg-primary-light/20 items-center justify-center mr-4">
            <MaterialIcons name="receipt-long" size={18} color="#FF6B00" />
          </View>
          <Text className="font-['Poppins-Medium'] text-secondary flex-1">
            Your Orders
          </Text>
          <Feather name="chevron-right" size={18} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity className="flex-row items-center bg-white p-4 rounded-xl shadow-sm mb-3">
          <View className="w-10 h-10 rounded-full bg-primary-light/20 items-center justify-center mr-4">
            <MaterialIcons name="favorite-border" size={18} color="#FF6B00" />
          </View>
          <Text className="font-['Poppins-Medium'] text-secondary flex-1">
            Favorite Dishes
          </Text>
          <Feather name="chevron-right" size={18} color="#999" />
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-row items-center bg-white p-4 rounded-xl shadow-sm"
          onPress={handleLogout}
        >
          <View className="w-10 h-10 rounded-full bg-red-100 items-center justify-center mr-4">
            <Feather name="log-out" size={18} color="#FF3B30" />
          </View>
          <Text className="font-['Poppins-Medium'] text-red-500 flex-1">
            Log Out
          </Text>
          <Feather name="chevron-right" size={18} color="#999" />
        </TouchableOpacity>
      </View>

      <View className="items-center mt-8">
        <Text className="font-['Poppins'] text-xs text-secondary-light">
          App Version: 1.0.0
        </Text>
      </View>
    </View>
  );
};

export default AccountScreen;
