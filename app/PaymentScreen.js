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
  TextInput,
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
  const router = useRouter();

  const cartItems = getCartItems();
  const restaurantInfo = getCurrentRestaurantInfo();

  const calculateSubtotal = () => {
    return calculateTotal();
  };

  const deliveryFee = restaurantInfo?.deliveryFee || 30;
  const tax = Math.round(calculateSubtotal() * 0.08);
  const total = calculateSubtotal() + deliveryFee + tax;

  const processPayment = async () => {
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

      // Create Razorpay order first
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PAYMENT.CREATE_ORDER}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            amount: total,
            currency: RAZORPAY_CONFIG.CURRENCY,
          }),
        }
      );

      const razorpayOrderData = await response.json();

      if (!razorpayOrderData.success) {
        throw new Error("Failed to create payment order");
      }

      // Configure Razorpay options
      const options = {
        description: `Order from ${restaurantInfo?.name || "Restaurant"}`,
        image: RAZORPAY_CONFIG.COMPANY_LOGO,
        currency: RAZORPAY_CONFIG.CURRENCY,
        key: RAZORPAY_CONFIG.KEY_ID,
        amount: razorpayOrderData.amount,
        order_id: razorpayOrderData.orderId,
        name: RAZORPAY_CONFIG.COMPANY_NAME,
        prefill: {
          email: "customer@example.com",
          contact: "9999999999",
          name: userName,
        },
        theme: {
          color: RAZORPAY_CONFIG.THEME_COLOR,
        },
      };

      // Open Razorpay payment gateway
      RazorpayCheckout.open(options)
        .then(async (data) => {
          // Payment successful - verify payment
          const verifyResponse = await fetch(
            `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PAYMENT.VERIFY_PAYMENT}`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                razorpay_order_id: data.razorpay_order_id,
                razorpay_payment_id: data.razorpay_payment_id,
                razorpay_signature: data.razorpay_signature,
              }),
            }
          );

          const verifyResult = await verifyResponse.json();

          if (verifyResult.success) {
            // Create order in database after successful payment
            const orderData = {
              userId: userId,
              name: userName,
              restaurant: currentRestaurantId,
              items: cartItems.map((item) => ({
                food: item._id,
                quantity: item.quantity,
                price: item.price,
              })),
              totalAmount: total,
              deliveryFee: deliveryFee,
              tax: tax,
              paymentMethod: "razorpay",
              restaurantName: restaurantInfo?.name || "Restaurant",
              restaurantLocation:
                restaurantInfo?.location || "Unknown Location",
              razorpayOrderId: data.razorpay_order_id,
              razorpayPaymentId: data.razorpay_payment_id,
              note: "",
            };

            const result = await createOrder(orderData);

            if (result.success) {
              clearRestaurantCart();

              Toast.show({
                type: "success",
                text1: "Payment Successful",
                text2: "Your order has been placed successfully!",
              });

              // Navigate to orders page instead of payment success
              router.replace("/OrdersScreen");
            } else {
              throw new Error(result.error || "Failed to create order");
            }
          } else {
            throw new Error("Payment verification failed");
          }
        })
        .catch((error) => {
          // Payment failed or cancelled
          console.log("Payment error:", error);
          Toast.show({
            type: "error",
            text1: "Payment Failed",
            text2: error.description || "Payment was cancelled or failed",
          });
        });
    } catch (error) {
      console.error("Error processing payment:", error);
      Toast.show({
        type: "error",
        text1: "Payment Error",
        text2: error.message || "Failed to process payment",
      });
    } finally {
      setProcessing(false);
    }
  };

  const renderCartItem = ({ item }) => (
    <View style={styles.cartItem}>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemQuantity}>
          {item.quantity} × ₹{item.price}
        </Text>
      </View>
      <Text style={styles.itemPrice}>₹{item.price * item.quantity}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#333333" />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>Payment</Text>
          <Text style={styles.headerSubtitle}>Complete your order</Text>
        </View>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Order Summary */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="receipt" size={20} color="#FF6B00" />
            <Text style={styles.sectionTitle}>Order Summary</Text>
          </View>

          <FlatList
            data={cartItems}
            renderItem={renderCartItem}
            keyExtractor={(item) => item._id}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
          />

          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalText}>Subtotal</Text>
            <Text style={styles.totalAmount}>₹{calculateSubtotal()}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalText}>Delivery Fee</Text>
            <Text style={styles.totalAmount}>₹{deliveryFee}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalText}>Taxes & Fees</Text>
            <Text style={styles.totalAmount}>₹{tax}</Text>
          </View>

          <View style={[styles.totalRow, styles.grandTotal]}>
            <Text style={styles.grandTotalText}>Total Amount</Text>
            <Text style={styles.grandTotalAmount}>₹{total}</Text>
          </View>
        </View>

        {/* Secure Information */}
        <View style={styles.section}>
          <View style={styles.secureInfo}>
            <MaterialCommunityIcons
              name="shield-check"
              size={16}
              color="#4CAF50"
            />
            <Text style={styles.secureText}>
              Your payment information is secure and encrypted
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.payButton, processing && styles.disabledButton]}
          onPress={processPayment}
          disabled={processing}
        >
          {processing ? (
            <View style={styles.processingContent}>
              <ActivityIndicator size="small" color="#FFFFFF" />
              <Text style={styles.payButtonText}>Processing...</Text>
            </View>
          ) : (
            <View style={styles.payButtonContent}>
              <MaterialCommunityIcons
                name="shield-check"
                size={20}
                color="#FFFFFF"
              />
              <Text style={styles.payButtonText}>Place Order ₹{total}</Text>
              <MaterialCommunityIcons
                name="arrow-right"
                size={20}
                color="#FFFFFF"
              />
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Bottom Navigation */}
      <BottomNavigation />
      <Toast />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FA",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F8F9FA",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  headerTitle: {
    fontFamily: "Poppins-Bold",
    fontSize: 20,
    color: "#333333",
  },
  headerSubtitle: {
    fontFamily: "Poppins",
    fontSize: 12,
    color: "#666666",
    marginTop: 2,
  },
  placeholder: {
    width: 44,
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    marginVertical: 8,
    padding: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    fontFamily: "Poppins-Bold",
    fontSize: 16,
    color: "#333333",
  },
  cartItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontFamily: "Poppins-Medium",
    fontSize: 14,
    color: "#333333",
  },
  itemQuantity: {
    fontFamily: "Poppins",
    fontSize: 12,
    color: "#666666",
    marginTop: 2,
  },
  itemPrice: {
    fontFamily: "Poppins-Bold",
    fontSize: 14,
    color: "#FF6B00",
  },
  itemSeparator: {
    height: 1,
    backgroundColor: "#F0F0F0",
    marginVertical: 4,
  },
  divider: {
    height: 1,
    backgroundColor: "#F0F0F0",
    marginVertical: 16,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
  },
  totalText: {
    fontFamily: "Poppins",
    fontSize: 14,
    color: "#666666",
  },
  totalAmount: {
    fontFamily: "Poppins-Medium",
    fontSize: 14,
    color: "#333333",
  },
  grandTotal: {
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    paddingTop: 16,
    marginTop: 8,
  },
  grandTotalText: {
    fontFamily: "Poppins-Bold",
    fontSize: 16,
    color: "#333333",
  },
  grandTotalAmount: {
    fontFamily: "Poppins-Bold",
    fontSize: 18,
    color: "#FF6B00",
  },
  secureInfo: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F8F0",
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
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
  payButton: {
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
  payButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  processingContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  payButtonText: {
    fontFamily: "Poppins-Bold",
    fontSize: 16,
    color: "#FFFFFF",
  },
});
