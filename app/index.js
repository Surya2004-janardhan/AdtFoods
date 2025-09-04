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
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#FFFFFF",
        }}
      >
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

        <View style={{ alignItems: "center", marginBottom: 32 }}>
          <View
            style={{
              width: 96,
              height: 96,
              backgroundColor: "#FF6B00",
              borderRadius: 48,
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 20,
              shadowColor: "#FF6B00",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 10,
            }}
          >
            <MaterialCommunityIcons
              name="food-fork-drink"
              size={56}
              color="white"
            />
          </View>

          <Text
            style={{
              fontFamily: "PlayfairDisplay-Bold",
              fontSize: 32,
              color: "#333333",
              textAlign: "center",
              marginBottom: 8,
            }}
          >
            ADITYA FOODS
          </Text>

          <Text
            style={{
              fontFamily: "Poppins",
              color: "#666666",
              fontSize: 16,
              textAlign: "center",
            }}
          >
            Delicious meals at your fingertips
          </Text>
        </View>

        <View
          style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            borderWidth: 3,
            borderColor: "#FF6B00",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#FFFFFF",
          }}
        >
          <ActivityIndicator size="large" color="#FF6B00" />
        </View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <CartProvider>
        <OrdersProvider>
          <Toast />
        </OrdersProvider>
      </CartProvider>
    </View>
  );
}
