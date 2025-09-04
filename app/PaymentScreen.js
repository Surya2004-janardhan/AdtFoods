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

export default function PaymentScreen() {
  const { cartItems, clearCart } = useContext(CartContext);
  const { createOrder } = useContext(OrdersContext);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("card");
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [processing, setProcessing] = useState(false);
  const router = useRouter();

  const calculateTotal = () => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  const deliveryFee = 30;
  const tax = Math.round(calculateTotal() * 0.08);
  const total = calculateTotal() + deliveryFee + tax;

  const processPayment = async () => {
    if (selectedPaymentMethod === "card") {
      if (!cardNumber || !expiryDate || !cvv) {
        Toast.show({
          type: "error",
          text1: "Incomplete Details",
          text2: "Please fill in all card details",
        });
        return;
      }
      if (cardNumber.length !== 16) {
        Toast.show({
          type: "error",
          text1: "Invalid Card",
          text2: "Card number must be 16 digits",
        });
        return;
      }
      if (cvv.length !== 3) {
        Toast.show({
          type: "error",
          text1: "Invalid CVV",
          text2: "CVV must be 3 digits",
        });
        return;
      }
    }

    setProcessing(true);

    try {
      const userId = await AsyncStorage.getItem("userId");
      const userName = (await AsyncStorage.getItem("userName")) || "Customer";

      // Create order data
      const orderData = {
        userId: userId,
        name: userName,
        items: cartItems.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
        total: total,
        paymentMethod: selectedPaymentMethod,
        note: "",
      };

      // Create order via context
      const result = await createOrder(orderData);

      if (result.success) {
        clearCart();

        Toast.show({
          type: "success",
          text1: "Order Placed",
          text2: "Your order has been placed successfully!",
        });

        router.push("/PaymentSuccessScreen");
      } else {
        throw new Error(result.error || "Failed to create order");
      }
    } catch (error) {
      console.error("Error creating order:", error);
      Toast.show({
        type: "error",
        text1: "Order Failed",
        text2: error.response?.data?.error || "Failed to place order",
      });
    } finally {
      setProcessing(false);
    }
  };

  const formatCardNumber = (text) => {
    const cleaned = text.replace(/\D/g, "");
    const formatted = cleaned.replace(/(.{4})/g, "$1 ").trim();
    return formatted;
  };

  const formatExpiryDate = (text) => {
    const cleaned = text.replace(/\D/g, "");
    if (cleaned.length >= 2) {
      return cleaned.substring(0, 2) + "/" + cleaned.substring(2, 4);
    }
    return cleaned;
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

  const PaymentMethodCard = ({ icon, title, method, description }) => (
    <TouchableOpacity
      style={[
        styles.paymentMethod,
        selectedPaymentMethod === method && styles.selectedPaymentMethod,
      ]}
      onPress={() => setSelectedPaymentMethod(method)}
    >
      <View style={styles.paymentMethodLeft}>
        <View
          style={[
            styles.paymentIcon,
            selectedPaymentMethod === method && styles.selectedPaymentIcon,
          ]}
        >
          <MaterialCommunityIcons
            name={icon}
            size={24}
            color={selectedPaymentMethod === method ? "#FFFFFF" : "#FF6B00"}
          />
        </View>
        <View>
          <Text
            style={[
              styles.paymentMethodTitle,
              selectedPaymentMethod === method &&
                styles.selectedPaymentMethodTitle,
            ]}
          >
            {title}
          </Text>
          {description && (
            <Text style={styles.paymentMethodDescription}>{description}</Text>
          )}
        </View>
      </View>
      <View
        style={[
          styles.radioButton,
          selectedPaymentMethod === method && styles.selectedRadioButton,
        ]}
      >
        {selectedPaymentMethod === method && (
          <MaterialCommunityIcons name="check" size={12} color="#FFFFFF" />
        )}
      </View>
    </TouchableOpacity>
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
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
          />

          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalText}>Subtotal</Text>
            <Text style={styles.totalAmount}>₹{calculateTotal()}</Text>
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

        {/* Payment Methods */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="wallet" size={20} color="#FF6B00" />
            <Text style={styles.sectionTitle}>Payment Method</Text>
          </View>

          <PaymentMethodCard
            icon="credit-card"
            title="Credit/Debit Card"
            method="card"
            description="Visa, Mastercard, Rupay"
          />

          <PaymentMethodCard
            icon="cellphone"
            title="UPI Payment"
            method="upi"
            description="Google Pay, PhonePe, Paytm"
          />

          <PaymentMethodCard
            icon="cash"
            title="Cash on Delivery"
            method="cash"
            description="Pay when order arrives"
          />
        </View>

        {/* Card Details */}
        {selectedPaymentMethod === "card" && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons
                name="credit-card-outline"
                size={20}
                color="#FF6B00"
              />
              <Text style={styles.sectionTitle}>Card Details</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Card Number</Text>
              <TextInput
                style={styles.input}
                placeholder="1234 5678 9012 3456"
                value={formatCardNumber(cardNumber)}
                onChangeText={(text) =>
                  setCardNumber(text.replace(/\s/g, "").replace(/\D/g, ""))
                }
                keyboardType="numeric"
                maxLength={19}
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, styles.halfInput]}>
                <Text style={styles.inputLabel}>Expiry Date</Text>
                <TextInput
                  style={styles.input}
                  placeholder="MM/YY"
                  value={expiryDate}
                  onChangeText={(text) => setExpiryDate(formatExpiryDate(text))}
                  maxLength={5}
                />
              </View>
              <View style={[styles.inputGroup, styles.halfInput]}>
                <Text style={styles.inputLabel}>CVV</Text>
                <TextInput
                  style={styles.input}
                  placeholder="123"
                  value={cvv}
                  onChangeText={(text) => setCvv(text.replace(/\D/g, ""))}
                  keyboardType="numeric"
                  maxLength={3}
                  secureTextEntry
                />
              </View>
            </View>

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
        )}

        {selectedPaymentMethod === "upi" && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="qrcode" size={20} color="#FF6B00" />
              <Text style={styles.sectionTitle}>UPI Payment</Text>
            </View>
            <View style={styles.upiInfo}>
              <MaterialCommunityIcons
                name="information"
                size={20}
                color="#2196F3"
              />
              <Text style={styles.upiText}>
                You will be redirected to your UPI app to complete the payment
              </Text>
            </View>
          </View>
        )}

        {selectedPaymentMethod === "cash" && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons
                name="hand-coin"
                size={20}
                color="#FF6B00"
              />
              <Text style={styles.sectionTitle}>Cash Payment</Text>
            </View>
            <View style={styles.cashInfo}>
              <MaterialCommunityIcons
                name="information"
                size={20}
                color="#FF9800"
              />
              <Text style={styles.cashText}>
                Please keep exact change ready. Our delivery partner will
                collect ₹{total}
              </Text>
            </View>
          </View>
        )}
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
              <Text style={styles.payButtonText}>
                {selectedPaymentMethod === "cash"
                  ? `Place Order ₹${total}`
                  : `Pay ₹${total}`}
              </Text>
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
    fontFamily: "PlayfairDisplay-Bold",
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
  paymentMethod: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#F0F0F0",
    borderRadius: 12,
    marginBottom: 12,
    backgroundColor: "#FAFAFA",
  },
  selectedPaymentMethod: {
    borderColor: "#FF6B00",
    backgroundColor: "#FFF8F0",
  },
  paymentMethodLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  paymentIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFF8F0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  selectedPaymentIcon: {
    backgroundColor: "#FF6B00",
  },
  paymentMethodTitle: {
    fontFamily: "Poppins-Medium",
    fontSize: 14,
    color: "#333333",
  },
  selectedPaymentMethodTitle: {
    color: "#FF6B00",
  },
  paymentMethodDescription: {
    fontFamily: "Poppins",
    fontSize: 12,
    color: "#666666",
    marginTop: 2,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#E0E0E0",
    justifyContent: "center",
    alignItems: "center",
  },
  selectedRadioButton: {
    borderColor: "#FF6B00",
    backgroundColor: "#FF6B00",
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontFamily: "Poppins-Medium",
    fontSize: 12,
    color: "#333333",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    padding: 16,
    fontSize: 14,
    fontFamily: "Poppins",
    color: "#333333",
    backgroundColor: "#FAFAFA",
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  halfInput: {
    flex: 1,
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
  upiInfo: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E3F2FD",
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  upiText: {
    fontFamily: "Poppins",
    fontSize: 14,
    color: "#1976D2",
    flex: 1,
  },
  cashInfo: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF3E0",
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  cashText: {
    fontFamily: "Poppins",
    fontSize: 14,
    color: "#F57C00",
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
