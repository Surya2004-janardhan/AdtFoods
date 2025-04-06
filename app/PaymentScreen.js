// const paymentUrl = "https://rzp.io/rzp/E1m0hMJy"; // Your Razorpay Payment Page URL
// https://rzp.io/rzp/t4ZKL1Cb
import { useRouter } from "expo-router";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { WebView } from "react-native-webview";
import React, { useContext } from "react";
import CartContext from "../context/CartContext";

export default function PaymentScreen() {
  const { clearCart } = useContext(CartContext);
  const router = useRouter();

  const handleNavigationChange = (navState) => {
    const url = navState.url;

    // 🔍 Print to debug
    console.log("WebView URL:", url);

    // ✅ Detect Razorpay success confirmation URL pattern
    if (
      url.includes("thankyou") ||
      url.includes("paymentsuccess") ||
      url.includes("rzp.io/payment") // sometimes they redirect here
    ) {
      console.log("✅ Payment success detected");

      clearCart(); // Clear cart context
      router.replace("/OrdersScreen"); // Redirect to orders
    }

    // ❌ Optional: detect failure/cancel
    if (url.includes("payment_cancel") || url.includes("failed")) {
      console.log("❌ Payment failed or cancelled");
    }
  };

  return (
    <View style={styles.container}>
      <WebView
        source={{ uri: "https://rzp.io/rzp/t4ZKL1Cb" }} // Replace with your Razorpay link
        onNavigationStateChange={handleNavigationChange}
        startInLoadingState
        renderLoading={() => <ActivityIndicator size="large" color="#F37254" />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
