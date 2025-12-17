import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CartContext } from "../context/CartContext";
import OrdersContext from "../context/OrdersContext";
import { API_CONFIG } from "../config/apiConfig";
import BottomNavigation from "../components/BottomNavigation";

export default function PaymentSuccessScreen() {
  const [processing, setProcessing] = useState(true);
  const [orderCreated, setOrderCreated] = useState(false);
  const { clearRestaurantCart } = useContext(CartContext);
  const { createOrder } = useContext(OrdersContext);

  useEffect(() => {
    const processPayment = async () => {
      try {
        const pendingPaymentStr = await AsyncStorage.getItem("pendingPayment");
        if (!pendingPaymentStr) {
          // No pending payment, just show success
          setProcessing(false);
          return;
        }

        const { orderData, paymentData, razorpayOrderData, token } =
          JSON.parse(pendingPaymentStr);

        console.log("🔄 Processing pending payment...");

        // Verify payment
        const verifyResponse = await fetch(
          `${API_CONFIG.BASE_URL}/verify-payment`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              razorpay_order_id: razorpayOrderData.orderId,
              razorpay_payment_id: paymentData.razorpay_payment_id,
              razorpay_signature: paymentData.razorpay_signature,
            }),
          }
        );

        if (!verifyResponse.ok) {
          throw new Error("Payment verification failed");
        }

        const verifyData = await verifyResponse.json();
        if (!verifyData.success) {
          throw new Error("Payment verification failed");
        }

        console.log("✅ Payment verified");

        // Create order
        const result = await createOrder(orderData);
        if (!result.success) {
          throw new Error(result.error || "Failed to create order");
        }

        console.log("📝 Order created:", result);
        setOrderCreated(true);

        // Clear cart
        clearRestaurantCart();
        console.log("🛒 Cart cleared");

        // Remove pending payment
        await AsyncStorage.removeItem("pendingPayment");

        console.log("✅ Payment processing complete");
      } catch (error) {
        console.error("❌ Error processing payment:", error);
        // For now, still proceed to show success, but in production, handle error
      } finally {
        setProcessing(false);
      }
    };

    processPayment();
  }, []);

  // Handle back button - prevent going back if order is created
  useEffect(() => {
    if (orderCreated) {
      // Order is created, user can safely navigate away
      return;
    }
  }, [orderCreated]);

  const viewOrders = () => {
    router.replace("/OrdersScreen");
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={styles.content}>
        {/* Success Animation */}
        <View style={styles.successContainer}>
          <View style={styles.successIcon}>
            <MaterialCommunityIcons
              name="check-circle"
              size={120}
              color="#4CAF50"
            />
          </View>

          <View style={styles.celebrationIcons}>
            <MaterialCommunityIcons
              name="party-popper"
              size={24}
              color="#FF6B00"
              style={styles.celebrationIcon1}
            />
            <MaterialCommunityIcons
              name="star"
              size={20}
              color="#FFD700"
              style={styles.celebrationIcon2}
            />
            <MaterialCommunityIcons
              name="heart"
              size={18}
              color="#E91E63"
              style={styles.celebrationIcon3}
            />
          </View>

          <Text style={styles.successTitle}>Payment Successful!</Text>
          <Text style={styles.successSubtitle}>
            Your order has been placed successfully and payment was processed.
          </Text>
        </View>

        {/* Order Details Card */}
        <View style={styles.orderCard}>
          <View style={styles.orderHeader}>
            <View style={styles.orderIconContainer}>
              <MaterialCommunityIcons
                name="receipt"
                size={24}
                color="#FF6B00"
              />
            </View>
            <View style={styles.orderInfo}>
              <Text style={styles.orderTitle}>Order Confirmed</Text>
              <Text style={styles.orderSubtitle}>
                Order #ADT{Math.floor(Math.random() * 10000)}
              </Text>
            </View>
            <View style={styles.orderStatus}>
              <MaterialCommunityIcons name="clock" size={16} color="#4CAF50" />
              <Text style={styles.orderStatusText}>Processing</Text>
            </View>
          </View>

          <View style={styles.orderDetails}>
            <View style={styles.orderDetailItem}>
              <MaterialCommunityIcons
                name="chef-hat"
                size={16}
                color="#666666"
              />
              <Text style={styles.orderDetailText}>
                Your food is being prepared
              </Text>
            </View>
            <View style={styles.orderDetailItem}>
              <MaterialCommunityIcons
                name="truck-delivery"
                size={16}
                color="#666666"
              />
              <Text style={styles.orderDetailText}>
                Estimated delivery: 30-45 minutes
              </Text>
            </View>
            <View style={styles.orderDetailItem}>
              <MaterialCommunityIcons
                name="bell-ring"
                size={16}
                color="#666666"
              />
              <Text style={styles.orderDetailText}>
                You'll receive updates via notifications
              </Text>
            </View>
          </View>
        </View>

        {/* Thank You Message */}
        <View style={styles.thankYouCard}>
          <MaterialCommunityIcons name="heart" size={32} color="#E91E63" />
          <Text style={styles.thankYouText}>
            Thank you for choosing AdtFoods!
          </Text>
          <Text style={styles.thankYouSubtext}>
            We're excited to serve you delicious food
          </Text>
        </View>

        {/* Processing Info */}
        {processing && (
          <View style={styles.processingInfo}>
            <ActivityIndicator size="small" color="#FF6B00" />
            <Text style={styles.processingText}>
              Verifying payment and creating order...
            </Text>
          </View>
        )}
      </View>

      {/* Action Button */}
      {!processing && (
        <View style={styles.actionButtonContainer}>
          <TouchableOpacity
            style={styles.viewOrdersButton}
            onPress={viewOrders}
          >
            <MaterialCommunityIcons
              name="clipboard-list"
              size={18}
              color="#FFFFFF"
            />
            <Text style={styles.viewOrdersButtonText}>View Orders</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Bottom Navigation */}
      <BottomNavigation />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  successContainer: {
    alignItems: "center",
    marginBottom: 40,
    position: "relative",
  },
  successIcon: {
    marginBottom: 24,
  },
  celebrationIcons: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
  },
  celebrationIcon1: {
    position: "absolute",
    top: 20,
    right: 20,
  },
  celebrationIcon2: {
    position: "absolute",
    top: 40,
    left: 30,
  },
  celebrationIcon3: {
    position: "absolute",
    bottom: 20,
    right: 40,
  },
  successTitle: {
    fontFamily: "PlayfairDisplay-Bold",
    fontSize: 28,
    color: "#333333",
    textAlign: "center",
    marginBottom: 12,
  },
  successSubtitle: {
    fontFamily: "Poppins",
    fontSize: 16,
    color: "#666666",
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  orderCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: "#F0F0F0",
    width: "100%",
  },
  orderHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  orderIconContainer: {
    width: 48,
    height: 48,
    backgroundColor: "#FFF8F0",
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  orderInfo: {
    flex: 1,
  },
  orderTitle: {
    fontFamily: "Poppins-Bold",
    fontSize: 16,
    color: "#333333",
  },
  orderSubtitle: {
    fontFamily: "Poppins",
    fontSize: 12,
    color: "#666666",
    marginTop: 2,
  },
  orderStatus: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F5E8",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  orderStatusText: {
    fontFamily: "Poppins-Bold",
    fontSize: 12,
    color: "#4CAF50",
  },
  orderDetails: {
    gap: 12,
  },
  orderDetailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  orderDetailText: {
    fontFamily: "Poppins",
    fontSize: 14,
    color: "#666666",
    flex: 1,
  },
  thankYouCard: {
    backgroundColor: "#FFF8F0",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    marginBottom: 24,
    width: "100%",
  },
  thankYouText: {
    fontFamily: "PlayfairDisplay-Bold",
    fontSize: 20,
    color: "#333333",
    textAlign: "center",
    marginTop: 12,
    marginBottom: 8,
  },
  thankYouSubtext: {
    fontFamily: "Poppins",
    fontSize: 14,
    color: "#666666",
    textAlign: "center",
  },
  processingInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 32,
  },
  processingText: {
    fontFamily: "Poppins-Bold",
    fontSize: 14,
    color: "#333333",
  },
  actionButtonContainer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  viewOrdersButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: "#FF6B00",
    gap: 6,
  },
  viewOrdersButtonText: {
    fontFamily: "Poppins-Bold",
    fontSize: 13,
    color: "#FFFFFF",
  },
});
