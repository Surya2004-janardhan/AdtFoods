import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, Image, StatusBar } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import Toast from "react-native-toast-message";
import { CartProvider } from "../context/CartContext";
import { OrdersProvider } from "../context/OrdersContext";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function IndexScreen() {
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check internet connectivity
    const unsubscribe = NetInfo.addEventListener((state) => {
      if (state.isConnected) {
        if (!isConnected) {
          Toast.show({
            type: "success",
            text1: "Connected to the Internet",
            visibilityTime: 3000,
            autoHide: true,
            topOffset: 40,
          });
        }
      } else {
        if (isConnected) {
          Toast.show({
            type: "error",
            text1: "No Internet Connection",
            text2: "Please check your connection",
            visibilityTime: 0,
            autoHide: false,
            topOffset: 40,
          });
        }
      }
      setIsConnected(state.isConnected);
    });

    return () => unsubscribe();
  }, [isConnected]);

  useEffect(() => {
    const checkLoginState = async () => {
      try {
        // Simulate a short delay for splash screen effect
        await new Promise((resolve) => setTimeout(resolve, 1500));
        const userToken = await AsyncStorage.getItem("userToken");

        if (userToken === "staff") {
          router.replace("/StaffFoodItemsScreen");
        } else if (userToken) {
          router.replace("/HomeScreen");
        } else {
          router.replace("/AuthScreen");
        }
      } catch (error) {
        console.error("Error checking login state:", error);
      } finally {
        setLoading(false);
      }
    };

    checkLoginState();
  }, []);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-accent-cream">
        <StatusBar barStyle="dark-content" backgroundColor="#FFF8EE" />

        <View className="items-center mb-8">
          <View className="w-24 h-24 bg-primary rounded-full items-center justify-center mb-5 shadow-xl">
            <MaterialCommunityIcons
              name="food-fork-drink"
              size={56}
              color="white"
            />
          </View>

          <Text className="font-['PlayfairDisplay-Bold'] text-3xl text-secondary text-center">
            ADITYA FOODS
          </Text>

          <Text className="font-['Poppins'] text-primary-dark text-base mt-2">
            Delicious meals at your fingertips
          </Text>
        </View>

        <ActivityIndicator size="large" color="#FF6B00" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-accent-cream">
      <CartProvider>
        <OrdersProvider>
          <Toast />
        </OrdersProvider>
      </CartProvider>
    </View>
  );
}
