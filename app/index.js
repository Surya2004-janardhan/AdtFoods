import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, Image, StatusBar } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import { CartProvider } from "../context/CartContext";
import { OrdersProvider } from "../context/OrdersContext";
import * as SplashScreen from "expo-splash-screen";

export default function IndexScreen() {
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(true);
  const [splashFinished, setSplashFinished] = useState(false);
  const router = useRouter();

  // Keep the splash screen visible while we fetch resources
  SplashScreen.preventAutoHideAsync();

  useEffect(() => {
    // Check internet connectivity
    const unsubscribe = NetInfo.addEventListener((state) => {
      if (state.isConnected) {
        if (!isConnected) {
          console.log("📶 Connected to the Internet");
        }
      } else {
        if (isConnected) {
          console.log(
            "❌ No Internet Connection - Please check your connection"
          );
        }
      }
      setIsConnected(state.isConnected);
    });

    return () => unsubscribe();
  }, [isConnected]);

  useEffect(() => {
    console.log("🚀 App started - Beginning splash screen timer");

    // First effect: Start the splash screen timer
    const splashTimer = setTimeout(async () => {
      console.log("⏰ 3 seconds elapsed - Hiding native splash screen");
      await SplashScreen.hideAsync();
      setSplashFinished(true);
    }, 3000);

    return () => {
      clearTimeout(splashTimer);
    };
  }, []);

  useEffect(() => {
    // Second effect: Handle navigation after splash is finished
    if (!splashFinished) return;

    const handleNavigation = async () => {
      try {
        console.log("🔄 Splash finished, checking login state...");

        const userToken = await AsyncStorage.getItem("userToken");
        console.log("🔑 User token:", userToken ? "exists" : "not found");

        if (userToken === "staff") {
          console.log("👨‍💼 Navigating to Staff screen");
          router.replace("/StaffFoodItemsScreen");
        } else if (userToken) {
          console.log("👤 Navigating to Home screen");
          router.replace("/HomeScreen");
        } else {
          console.log("🔒 Navigating to Auth screen");
          router.replace("/AuthScreen");
        }
      } catch (error) {
        console.error("Error checking login state:", error);
      } finally {
        setLoading(false);
      }
    };

    handleNavigation();
  }, [splashFinished]);

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
          {/* Custom Logo Image */}
          <Image
            source={require("../assets/fonts/icon.png")}
            style={{
              width: 120,
              height: 120,
              marginBottom: 20,
              borderRadius: 60,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 10,
            }}
            resizeMode="contain"
          />

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
              fontFamily: "Poppins-Bold",
              color: "#666666",
              fontSize: 14,
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
        <OrdersProvider></OrdersProvider>
      </CartProvider>
    </View>
  );
}
