import React, { useEffect } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { router } from "expo-router";

export default function SuccessScreen() {
  useEffect(() => {
    // Auto-redirect to Orders screen after 2 seconds
    const timer = setTimeout(() => {
      router.replace("/OrdersScreen");
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 10 }}>
        🎉 Payment Successful!
      </Text>
      <Text>Redirecting to Orders...</Text>
      <ActivityIndicator
        size="large"
        color="#F37254"
        style={{ marginTop: 10 }}
      />
    </View>
  );
}
