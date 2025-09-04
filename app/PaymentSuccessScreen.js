import React, { useEffect } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { router } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";
import LottieView from "lottie-react-native";

export default function PaymentSuccessScreen() {
  useEffect(() => {
    // Auto-redirect to Orders screen after 3 seconds
    const timer = setTimeout(() => {
      router.replace("/OrdersScreen");
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const viewOrders = () => {
    router.replace("/OrdersScreen");
  };

  const goHome = () => {
    router.replace("/HomeScreen");
  };

  return (
    <View className="flex-1 bg-accent-cream">
      <StatusBar barStyle="dark-content" backgroundColor="#FFF8EE" />

      <View className="flex-1 items-center justify-center px-6">
        {/* Success Animation */}
        <View className="w-32 h-32 bg-primary-light rounded-full items-center justify-center mb-8">
          <MaterialIcons name="check-circle" size={80} color="#FFFFFF" />
        </View>

        <Text className="font-['PlayfairDisplay-Bold'] text-3xl text-secondary text-center mb-3">
          Payment Successful!
        </Text>

        <Text className="font-['Poppins'] text-base text-secondary-light text-center mb-8">
          Your order has been placed successfully. You will be redirected to
          your orders shortly.
        </Text>

        <ActivityIndicator size="small" color="#FF6B00" className="mb-10" />

        <View className="flex-row space-x-4">
          <TouchableOpacity
            className="px-6 py-3 border-2 border-primary rounded-lg"
            onPress={goHome}
          >
            <Text className="font-['Poppins-Medium'] text-primary">
              Go to Home
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="px-6 py-3 bg-primary rounded-lg"
            onPress={viewOrders}
          >
            <Text className="font-['Poppins-Medium'] text-white">
              View Orders
            </Text>
          </TouchableOpacity>
        </View>

        {/* Order Confirmation */}
        <View className="w-full bg-white rounded-xl p-5 mt-10 shadow-sm">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="font-['Poppins-Bold'] text-secondary">
              Order Confirmation
            </Text>
            <MaterialIcons name="local-dining" size={24} color="#FF6B00" />
          </View>

          <View className="border-t border-gray-200 pt-2">
            <Text className="font-['Poppins'] text-secondary-light mb-1">
              Your order will be ready soon. You can track its status in the
              Orders section.
            </Text>
            <Text className="font-['Poppins-Medium'] text-primary">
              Thank you for choosing Aditya Foods!
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
