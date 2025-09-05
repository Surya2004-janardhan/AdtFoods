import React, { useContext, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StatusBar,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CartContext } from "../context/CartContext";
import OrdersContext from "../context/OrdersContext";
import BottomNavigation from "../components/BottomNavigation";
import Toast from "react-native-toast-message";
import RazorpayCheckout from "react-native-razorpay";
import { API_CONFIG, RAZORPAY_CONFIG } from "../apiConfig";

export default function PaymentScreen() {
  const {
    getCartItems,
    clearRestaurantCart,
    calculateTotal,
    getCurrentRestaurantInfo,
    currentRestaurantId,
  } = useContext(CartContext);
  const { createOrder } = useContext(OrdersContext);
  const [processing, setProcessing] = useState(false);
  const router = useRouter();

  const cartItems = getCartItems();
  const restaurantInfo = getCurrentRestaurantInfo();

  const calculateSubtotal = () => {
    return calculateTotal();
  };

  const deliveryFee = restaurantInfo?.deliveryFee || 30;
  const tax = Math.round(calculateSubtotal() * 0.08);
  const total = calculateSubtotal() + deliveryFee + tax;

  // Get next order ID based on total order count
  const getNextOrderId = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const response = await fetch(`${API_CONFIG.BASE_URL}/api/orders/count`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        return (data.totalOrders || 0) + 1;
      }

      // Fallback to timestamp if API fails
      return Date.now() % 100000;
    } catch (error) {
      console.error("Error getting order count:", error);
      // Fallback to timestamp if API fails
      return Date.now() % 100000;
    }
  };

  // Main place order function with Razorpay
  const placeOrder = async () => {
    if (!currentRestaurantId || cartItems.length === 0) {
      Toast.show({
        type: "error",
        text1: "Invalid Order",
        text2: "Please add items to your cart",
      });
      return;
    }

    setProcessing(true);

    try {
      const userId = await AsyncStorage.getItem("userId");
      const userName = (await AsyncStorage.getItem("userName")) || "Customer";
      const token = await AsyncStorage.getItem("token");

      if (!userId || !token) {
        Toast.show({
          type: "error",
          text1: "Authentication Required",
          text2: "Please login to place order",
        });
        setProcessing(false);
        return;
      }

      // Get next order ID
      const orderId = await getNextOrderId();

      // Create Razorpay order
      const razorpayOrderResponse = await fetch(
        `${API_CONFIG.BASE_URL}/create-order`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount: total * 100, // Convert to paise
            currency: "INR",
            receipt: `order_${orderId}_${Date.now()}`,
          }),
        }
      );

      if (!razorpayOrderResponse.ok) {
        throw new Error("Failed to create payment order");
      }

      const razorpayOrderData = await razorpayOrderResponse.json();

      // Razorpay checkout options
      const options = {
        description: "Aditya Foods Order Payment",
        currency: "INR",
        key: RAZORPAY_CONFIG.KEY_ID,
        amount: razorpayOrderData.amount,
        order_id: razorpayOrderData.id,
        name: "Aditya Foods",
        prefill: {
          email: "customer@example.com",
          contact: "9876543210",
          name: userName,
        },
        theme: {
          color: "#FF6B00",
        },
        notes: {
          order_id: orderId,
          restaurant: restaurantInfo?.name || "Restaurant",
        },
      };

      // Open Razorpay payment gateway
      RazorpayCheckout.open(options)
        .then(async (paymentData) => {
          console.log("Razorpay payment success:", paymentData);

          // Create order in database after successful payment
          const orderData = {
            userId: userId,
            name: userName,
            restaurant: currentRestaurantId,
            items: cartItems.map((item) => ({
              food: String(item._id || item.id),
              quantity: parseInt(item.quantity) || 1,
              price: parseFloat(item.price) || 0,
            })),
            totalAmount: parseFloat(total),
            deliveryFee: parseFloat(deliveryFee),
            tax: parseFloat(tax),
            paymentMethod: "online",
            restaurantName: restaurantInfo?.name || "Restaurant",
            restaurantLocation: restaurantInfo?.location || "Unknown Location",
            razorpayOrderId: razorpayOrderData.id,
            razorpayPaymentId: paymentData.razorpay_payment_id,
            note: "Online Payment via Razorpay",
          };

          const result = await createOrder(orderData);

          if (result.success) {
            clearRestaurantCart();

            Toast.show({
              type: "success",
              text1: "Payment Successful",
              text2: `Order #${orderId} placed successfully!`,
            });

            // Navigate to orders screen
            router.dismissAll();
            router.replace("/OrdersScreen");
          } else {
            throw new Error(result.error || "Failed to create order");
          }
        })
        .catch((error) => {
          console.error("Razorpay payment error:", error);

          const isCancelled =
            error.code === 0 || error.description?.includes("cancelled");
          const errorMessage = isCancelled
            ? "You cancelled the payment. You can try again anytime."
            : error.description || "Payment failed. Please try again.";

          Toast.show({
            type: isCancelled ? "info" : "error",
            text1: isCancelled ? "Payment Cancelled" : "Payment Failed",
            text2: errorMessage,
          });
        });
    } catch (error) {
      console.error("Error processing payment:", error);
      Toast.show({
        type: "error",
        text1: "Order Error",
        text2: error.message || "Failed to process order",
      });
    } finally {
      setProcessing(false);
    }
  };

  const renderCartItem = ({ item }) => (
    <View style={styles.cartItem}>
      <View style={styles.itemDetails}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemPrice}>₹{item.price}</Text>
      </View>
      <View style={styles.quantityContainer}>
        <Text style={styles.quantityText}>×{item.quantity}</Text>
        <Text style={styles.itemTotal}>₹{item.price * item.quantity}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#FFFFFF" barStyle="dark-content" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Restaurant Info */}
        <View style={styles.restaurantInfo}>
          <Text style={styles.restaurantName}>{restaurantInfo?.name}</Text>
          <Text style={styles.restaurantLocation}>
            {restaurantInfo?.location}
          </Text>
        </View>

        {/* Order Items */}
        <View style={styles.orderSection}>
          <Text style={styles.sectionTitle}>Your Order</Text>
          <FlatList
            data={cartItems}
            renderItem={renderCartItem}
            keyExtractor={(item) => item._id || item.id}
            scrollEnabled={false}
          />
        </View>

        {/* Bill Summary */}
        <View style={styles.billSection}>
          <Text style={styles.sectionTitle}>Bill Summary</Text>
          <View style={styles.billRow}>
            <Text style={styles.billText}>Subtotal</Text>
            <Text style={styles.billAmount}>₹{calculateSubtotal()}</Text>
          </View>
          <View style={styles.billRow}>
            <Text style={styles.billText}>Delivery Fee</Text>
            <Text style={styles.billAmount}>₹{deliveryFee}</Text>
          </View>
          <View style={styles.billRow}>
            <Text style={styles.billText}>Tax (8%)</Text>
            <Text style={styles.billAmount}>₹{tax}</Text>
          </View>
          <View style={[styles.billRow, styles.totalRow]}>
            <Text style={styles.totalText}>Total</Text>
            <Text style={styles.totalAmount}>₹{total}</Text>
          </View>
        </View>

        {/* Payment Security Info */}
        <View style={styles.securitySection}>
          <MaterialCommunityIcons
            name="shield-check"
            size={16}
            color="#4CAF50"
          />
          <Text style={styles.secureText}>
            Your payment information is secure and encrypted
          </Text>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.placeOrderButton, processing && styles.disabledButton]}
          onPress={placeOrder}
          disabled={processing}
        >
          {processing ? (
            <View style={styles.processingContent}>
              <ActivityIndicator size="small" color="#FFFFFF" />
              <Text style={styles.buttonText}>Processing...</Text>
            </View>
          ) : (
            <View style={styles.buttonContent}>
              <MaterialCommunityIcons
                name="credit-card"
                size={20}
                color="#FFFFFF"
              />
              <Text style={styles.buttonText}>Place Order - ₹{total}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <BottomNavigation />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontFamily: "Poppins-Bold",
    fontSize: 18,
    color: "#333",
  },
  content: {
    flex: 1,
  },
  restaurantInfo: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  restaurantName: {
    fontFamily: "Poppins-Bold",
    fontSize: 16,
    color: "#333",
  },
  restaurantLocation: {
    fontFamily: "Poppins",
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  orderSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  sectionTitle: {
    fontFamily: "Poppins-Bold",
    fontSize: 16,
    color: "#333",
    marginBottom: 16,
  },
  cartItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontFamily: "Poppins-Medium",
    fontSize: 14,
    color: "#333",
  },
  itemPrice: {
    fontFamily: "Poppins",
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  quantityContainer: {
    alignItems: "flex-end",
  },
  quantityText: {
    fontFamily: "Poppins",
    fontSize: 12,
    color: "#666",
  },
  itemTotal: {
    fontFamily: "Poppins-Medium",
    fontSize: 14,
    color: "#FF6B00",
    marginTop: 2,
  },
  billSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  billRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  billText: {
    fontFamily: "Poppins",
    fontSize: 14,
    color: "#666",
  },
  billAmount: {
    fontFamily: "Poppins-Medium",
    fontSize: 14,
    color: "#333",
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    marginTop: 8,
    paddingTop: 16,
  },
  totalText: {
    fontFamily: "Poppins-Bold",
    fontSize: 16,
    color: "#333",
  },
  totalAmount: {
    fontFamily: "Poppins-Bold",
    fontSize: 16,
    color: "#FF6B00",
  },
  securitySection: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F8F0",
    padding: 16,
    margin: 20,
    borderRadius: 8,
    gap: 8,
  },
  secureText: {
    fontFamily: "Poppins",
    fontSize: 12,
    color: "#4CAF50",
    flex: 1,
  },
  footer: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  placeOrderButton: {
    backgroundColor: "#FF6B00",
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#FF6B00",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  disabledButton: {
    backgroundColor: "#CCCCCC",
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  processingContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  buttonText: {
    fontFamily: "Poppins-Bold",
    fontSize: 16,
    color: "#FFFFFF",
  },
});
