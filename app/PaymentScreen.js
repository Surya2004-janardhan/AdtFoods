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
import CustomNotification from "../components/CustomNotification";
import RazorpayCheckout from "react-native-razorpay";
import { API_CONFIG, RAZORPAY_CONFIG } from "../config/apiConfig";

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
  const [notification, setNotification] = useState({
    message: "",
    type: "",
    visible: false,
  });
  const router = useRouter();

  const cartItems = getCartItems();
  const restaurantInfo = getCurrentRestaurantInfo();

  const calculateSubtotal = () => {
    const subtotal = calculateTotal();
    console.log("💰 Subtotal calculation:", subtotal);
    return subtotal;
  };

  const deliveryFee = restaurantInfo?.deliveryFee || 30;
  const tax = Math.round(calculateSubtotal() * 0.08);
  const total = calculateSubtotal() + deliveryFee + tax;

  console.log("💵 Payment amounts:", {
    subtotal: calculateSubtotal(),
    deliveryFee,
    tax,
    total,
    razorpayAmount: "Backend will calculate (total * 100)",
  });

  // Get next order ID based on total order count
  const getNextOrderId = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken"); // Use correct token key
      console.log(
        "🔑 Token for order count:",
        token ? "Token exists" : "No token"
      );

      const response = await fetch(`${API_CONFIG.BASE_URL}/orders/count`, {
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

  // Helper function to show notifications
  const showNotification = (message, type = "info") => {
    setNotification({ message, type, visible: true });
    setTimeout(() => {
      setNotification((prev) => ({ ...prev, visible: false }));
    }, 3000);
  };

  // Main place order function with Razorpay
  const placeOrder = async () => {
    console.log("🚀 Place Order button pressed");
    console.log("Cart items:", cartItems);
    console.log("Restaurant ID:", currentRestaurantId);
    console.log("Total amount:", total);

    if (!currentRestaurantId || cartItems.length === 0) {
      showNotification("Please add items to your cart", "error");
      return;
    }

    setProcessing(true);

    try {
      const userId = await AsyncStorage.getItem("userId");
      const userName = (await AsyncStorage.getItem("userName")) || "Customer";
      const token = await AsyncStorage.getItem("authToken"); // Use correct token key

      console.log("📱 User data:", { userId, userName, tokenExists: !!token });

      if (!userId || !token) {
        showNotification("Please login to place order", "error");
        setProcessing(false);
        return;
      }

      // Get next order ID
      const orderId = await getNextOrderId();
      console.log("🔢 Generated Order ID:", orderId);

      // Create Razorpay order
      console.log("💳 Creating Razorpay order...");
      const razorpayOrderResponse = await fetch(
        `${API_CONFIG.BASE_URL}/create-order`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount: total, // Send raw amount, backend will convert to paise
            currency: "INR",
            receipt: `order_${orderId}_${Date.now()}`,
          }),
        }
      );

      console.log(
        "📞 Razorpay API Response Status:",
        razorpayOrderResponse.status
      );

      if (!razorpayOrderResponse.ok) {
        const errorText = await razorpayOrderResponse.text();
        console.error("❌ Razorpay order creation failed:", errorText);
        throw new Error("Failed to create payment order");
      }

      const razorpayOrderData = await razorpayOrderResponse.json();
      console.log("✅ Razorpay order created:", razorpayOrderData);

      // Razorpay checkout options
      const options = {
        description: "Aditya Foods Order Payment",
        currency: "INR",
        key: RAZORPAY_CONFIG.KEY_ID,
        amount: razorpayOrderData.amount,
        order_id: razorpayOrderData.orderId, // Backend returns 'orderId'
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
      console.log("🏪 Opening Razorpay checkout...");
      RazorpayCheckout.open(options)
        .then(async (paymentData) => {
          console.log("✅ Razorpay payment success:", paymentData);

          // Create order in database after successful payment
          const orderData = {
            userId: userId,
            name: userName,
            restaurant: String(currentRestaurantId), // Ensure it's a string
            items: cartItems.map((item) => ({
              food: String(item._id || item.id),
              quantity: parseInt(item.quantity) || 1,
              price: parseFloat(item.price) || 0,
            })),
            totalAmount: Math.round(parseFloat(total) * 100) / 100, // Round to 2 decimal places
            deliveryFee: Math.round(parseFloat(deliveryFee) * 100) / 100,
            tax: Math.round(parseFloat(tax) * 100) / 100,
            paymentMethod: "razorpay", // Use enum value from Order model
            restaurantName: restaurantInfo?.name || "Restaurant",
            restaurantLocation: restaurantInfo?.location || "Unknown Location",
            razorpayOrderId: razorpayOrderData.orderId,
            razorpayPaymentId: paymentData.razorpay_payment_id,
            note: "Online Payment via Razorpay",
          };

          console.log("📋 Creating order with data:", orderData);
          console.log("🔍 Restaurant ID validation:", {
            currentRestaurantId,
            isString: typeof currentRestaurantId,
            length: currentRestaurantId?.length,
          });
          const result = await createOrder(orderData);
          console.log("📝 Order creation result:", result);

          // Clear cart immediately after payment success
          clearRestaurantCart();
          console.log("🛒 Cart cleared successfully");

          // Navigate to orders screen immediately with proper stack management
          console.log("🚀 Navigating to: /OrdersScreen after payment success");

          // Use push to HomeScreen first, then push to OrdersScreen
          // This creates the proper navigation stack: HomeScreen -> OrdersScreen
          router.dismissAll();
          router.push("/HomeScreen");
          router.push("/OrdersScreen");

          // Navigation happens immediately - no need for status messages
          // The orders screen will show the updated orders
        })
        .catch((error) => {
          console.error("❌ Razorpay payment error:", error);

          const isCancelled =
            error.code === 0 || error.description?.includes("cancelled");
          const errorMessage = isCancelled
            ? "You cancelled the payment. You can try again anytime."
            : error.description || "Payment failed. Please try again.";

          showNotification(errorMessage, isCancelled ? "info" : "error");

          // Navigate back to cart page when payment fails/cancelled
          setTimeout(() => router.push("/UserCartScreen"), 1500);
        });
    } catch (error) {
      console.error("Error processing payment:", error);
      showNotification(error.message || "Failed to process order", "error");

      // Navigate back to cart on any error
      setTimeout(() => router.push("/UserCartScreen"), 1500);
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
          <MaterialCommunityIcons name="arrow-left" size={24} color="#333333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Payment</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Custom Notification */}
      <CustomNotification
        message={notification.message}
        type={notification.type}
        visible={notification.visible}
      />

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
  placeholder: {
    width: 40,
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
