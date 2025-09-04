import React, { useContext, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  StatusBar,
  TouchableOpacity,
  Image,
} from "react-native";
import { WebView } from "react-native-webview";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import CartContext from "../context/CartContext";

export default function PaymentScreen() {
  const { clearCart } = useContext(CartContext);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [paymentError, setPaymentError] = useState(null);

  const handleNavigationChange = (navState) => {
    const url = navState.url;

    // Debug
    console.log("WebView URL:", url);

    // Detect success
    if (
      url.includes("thankyou") ||
      url.includes("paymentsuccess") ||
      url.includes("rzp.io/payment")
    ) {
      console.log("✅ Payment success detected");
      clearCart();
      router.replace("/PaymentSuccessScreen");
    }

    // Detect failure
    if (url.includes("payment_cancel") || url.includes("failed")) {
      console.log("❌ Payment failed or cancelled");
      setPaymentError("Payment was cancelled or failed. Please try again.");
    }
  };

  const goBack = () => {
    router.back();
  };

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
            Payment
          </Text>
          <View style={{ width: 24 }} /> {/* Empty view for spacing */}
        </View>
      </View>

      {/* Security Badge */}
      <View className="flex-row justify-center items-center bg-accent py-2 border-b border-gray-200">
        <Feather name="shield" size={16} color="#00C853" className="mr-1" />
        <Text className="font-['Poppins'] text-sm text-secondary-light">
          Secure Payment Gateway
        </Text>
      </View>

      {/* Payment Error */}
      {paymentError && (
        <View className="mx-4 mt-2 p-3 bg-red-50 border-l-4 border-red-500 rounded">
          <Text className="font-['Poppins'] text-red-700">{paymentError}</Text>
          <TouchableOpacity
            className="mt-2"
            onPress={() => setPaymentError(null)}
          >
            <Text className="font-['Poppins'] text-primary underline">
              Try Again
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Payment Gateway */}
      <View className="flex-1 mx-2 mt-2 mb-4 rounded-xl overflow-hidden">
        <WebView
          source={{ uri: "https://rzp.io/rzp/t4ZKL1Cb" }}
          onNavigationStateChange={handleNavigationChange}
          startInLoadingState={true}
          onLoadStart={() => setLoading(true)}
          onLoadEnd={() => setLoading(false)}
        />

        {loading && (
          <View className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center">
            <ActivityIndicator size="large" color="#FF6B00" />
            <Text className="mt-4 font-['Poppins'] text-secondary">
              Loading payment gateway...
            </Text>
          </View>
        )}
      </View>

      {/* Payment Methods */}
      <View className="px-5 py-3 bg-white border-t border-gray-200">
        <Text className="font-['Poppins-Medium'] text-secondary-light text-center mb-2">
          Accepted Payment Methods
        </Text>
        <View className="flex-row justify-center space-x-4">
          <Image
            source={{
              uri: "https://1000logos.net/wp-content/uploads/2021/11/VISA-logo.png",
            }}
            className="w-12 h-8"
            resizeMode="contain"
          />
          <Image
            source={{
              uri: "https://1000logos.net/wp-content/uploads/2017/03/Mastercard-Logo.png",
            }}
            className="w-12 h-8"
            resizeMode="contain"
          />
          <Image
            source={{
              uri: "https://1000logos.net/wp-content/uploads/2021/03/Paytm_Logo.jpg",
            }}
            className="w-12 h-8"
            resizeMode="contain"
          />
          <Image
            source={{
              uri: "https://1000logos.net/wp-content/uploads/2021/03/UPI_logo.png",
            }}
            className="w-12 h-8"
            resizeMode="contain"
          />
        </View>
      </View>
    </View>
  );
}
