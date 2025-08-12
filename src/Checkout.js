import React, { useState, useEffect } from "react";
import Toast from "react-native-toast-message";
import RazorpayCheckout from "react-native-razorpay";
import { useCart } from "./CartContext";

import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  Animated,
} from "react-native";
import CONFIG from "../config";
// import * as Notifications from "expo-notifications";

import LottieView from "lottie-react-native";

const Checkout = ({ route, navigation }) => {
  const { userId, restaurantId, jwtToken } = route.params;
  const { cartItems, totalAmount, clearCart, getCartItemsForRestaurant } = useCart();
  const [loader, setLoader] = useState(false); // Only for place order loading

  // Get cart items - if restaurantId is "all", show all items, otherwise filter by restaurant
  const displayCartItems = restaurantId === "all" 
    ? cartItems 
    : getCartItemsForRestaurant(restaurantId);

  console.log("Checkout - All cart items:", cartItems);
  console.log("Checkout - Display cart items:", displayCartItems);
  console.log("Checkout - Total amount:", totalAmount);
  console.log("Checkout - Restaurant ID:", restaurantId);
  const { userId, restaurantId, jwtToken } = route.params || {};
  const { cartItems, totalAmount, clearCart, getCartItemsForRestaurant } =
    useCart();
  const [loading, setLoading] = useState(true);
  const [loader, setLoader] = useState(false);
  const [finalAmount, setFinalAmount] = useState(0);
  const fadeAnim = new Animated.Value(1);

  // Get cart items - if restaurantId is "all", show all items, otherwise filter by restaurant
  const displayCartItems =
    restaurantId === "all"
      ? cartItems
      : getCartItemsForRestaurant(restaurantId);

  useEffect(() => {
    // Calculate final amount (including any additional charges) whenever cart items change
    const calculatedAmount = totalAmount + 10; // Assuming a flat 10 INR charge for simplicity
    setFinalAmount(calculatedAmount);
  }, [totalAmount, cartItems]);

  const handlePlaceOrder = async () => {
    if (displayCartItems.length === 0) {
      Toast.show({
        type: "error",
        text1: "Empty Cart",
        text2: "Please add items to cart first",
        position: "top",
      });
      return;
    }

    setLoading(true);

    try {
      // 1. First save cart items to database
      await saveCartToDatabase(displayCartItems, userId, jwtToken);

      // 2. Proceed with Razorpay payment
      const options = {
        description: "Food Order Payment",
        image: "https://your-logo-url.com/logo.png",
        currency: "INR",
        key: "rzp_test_your_key_here",
        amount: Math.round(finalAmount * 100), // Amount in paise
        name: "AdityaFoods",
        order_id: "", // Replace with actual order ID from your backend if needed
        prefill: {
          email: "user@example.com",
          contact: "9876543210",
          name: "User Name",
        },
        theme: { color: "#ff8c00" },
      };

      const data = await RazorpayCheckout.open(options);

      // Payment successful - clear cart and navigate
      clearCart();

      Toast.show({
        type: "success",
        text1: "✅ Order placed!",
        text2: "Payment successful and order placed 🎉",
        position: "top",
        visibilityTime: 2000,
        onHide: () => {
          navigation.reset({
            index: 1,
            routes: [
              { name: "HomeScreen", params: { jwtToken } },
              { name: "Orders", params: { userId, jwtToken } },
            ],
          });
        },
      });
    } catch (error) {
      console.error("Order placement error:", error);
      Toast.show({
        type: "error",
        text1: "Payment Failed",
        text2: "Please try again",
        position: "top",
      });
    } finally {
      setLoading(false);
    }
  };

  // Function to save cart items to database when order is placed
  const saveCartToDatabase = async (items, userId, jwtToken) => {
    try {
      for (const item of items) {
        await fetch(`${CONFIG.API_BASE_URL}/usercart/add-item`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(jwtToken ? { Authorization: `Bearer ${jwtToken}` } : {}),
          },
          body: JSON.stringify({
            userId: userId,
            itemId: item._id,
            itemName: item.name,
            price: item.price,
            imageUrl: item.image,
            restaurantId: item.restaurantId,
            quantity: item.quantity,
          }),
        });
      }
      console.log("Cart items saved to database successfully");
    } catch (error) {
      console.error("Error saving cart to database:", error);
      throw error;
    }
  };

  const LoadingComponent = () => (
    <View style={styles.loaderContainer}>
      <View style={styles.loaderCircle}>
        <LottieView
          source={require("../assets/cart.json")}
          autoPlay
          loop
          style={{ width: 120, height: 220 }} // Adjust the Lottie size as needed
        />
      </View>
    </View>
  );
  const LoadingComponentplacedorder = () => (
    <View style={styles.loaderContainer}>
      <View style={styles.loaderCircle}>
        <LottieView
          source={require("../assets/orderplaced.json")}
          autoPlay
          loop
          style={{ width: 120, height: 220 }} // Adjust the Lottie size as needed
        />
      </View>
    </View>
  );
  if (loading) {
    return <LoadingComponent />;
  }

  const handleQuantityChange = async (itemId, action) => {
    try {
      const endpoint =
        action === "increase"
          ? "/usercart/increment-item"
          : "/usercart/decrement-item";
      const response = await fetch(`${CONFIG.API_BASE_URL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(jwtToken ? { Authorization: `Bearer ${jwtToken}` } : {}),
        },
        body: JSON.stringify({ userId, itemId, restaurantId }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to update item quantity");
      }

      // Re-fetch cart items to update the UI
      fetchCartItems();

      // Animate the change
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0.5,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();
    } catch (error) {
      Alert.alert("Error", error.message);
    }
  };

  const renderItem = ({ item }) => (
    <Animated.View style={[styles.cartItem, { opacity: fadeAnim }]}>
      <Image
        source={{ uri: item.imageUrl }}
        style={styles.itemImage}
        resizeMode="cover"
      />
      <View style={styles.itemDetails}>
        <Text style={styles.itemName}>{item.itemName}</Text>
        <Text style={styles.itemPrice}>₹{item.price}</Text>
        <View style={styles.quantityContainer}>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => handleQuantityChange(item.itemId, "decrease")}
          >
            <Text style={styles.quantityButtonText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.quantityText}>{item.quantity}</Text>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => handleQuantityChange(item.itemId, "increase")}
          >
            <Text style={styles.quantityButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>
      <Text style={styles.itemTotal}>
        ₹{(item.price * item.quantity).toFixed(2)}
      </Text>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Checkout</Text>
      {displayCartItems.length > 0 ? (
        <FlatList
          data={displayCartItems}
          renderItem={renderItem}
          keyExtractor={(item) => item.itemId}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
      ) : (
        <View style={styles.emptyCartContainer}>
          <Text style={styles.emptyCartText}>Your cart is empty</Text>
          <TouchableOpacity
            style={styles.continueShopping}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.continueShoppingText}>Continue Shopping</Text>
          </TouchableOpacity>
        </View>
      )}

      {displayCartItems.length > 0 && (
        <View style={styles.summaryContainer}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryText}>Subtotal:</Text>
            <Text style={styles.summaryAmount}>₹{totalAmount.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryText}>Platform Fee:</Text>
            <Text style={styles.summaryAmount}>₹10.00</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text style={styles.totalText}>Total:</Text>
            <Text style={styles.totalAmount}>
              ₹{(totalAmount + 10).toFixed(2)}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.placeOrderButton}
            onPress={handlePlaceOrder}
            disabled={loader}
          >
            {loader ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.placeOrderText}>Place Order</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      <Toast />
    </View>
  );
};

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    backgroundColor: "#ff8c00",
    justifyContent: "center",
    alignItems: "center",
    // borderRadius: "70%",
  },
  loaderCircle: {
    width: 200, // Adjust the size of the circle as needed
    height: 200, // Keep width and height the same to create a circle
    borderRadius: "50%", // Half of the width/height to make it circular
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden", // Ensures that Lottie stays within the circle
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5, // Android shadow
  },
  container: {
    flex: 1,
    backgroundColor: "#ff8c00",
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  listContainer: {
    paddingBottom: 20,
  },
  cartItem: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  itemDetails: {
    flex: 1,
    marginLeft: 12,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  itemPrice: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  quantityButton: {
    backgroundColor: "#ff8c00",
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  quantityButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  quantityText: {
    marginHorizontal: 12,
    fontSize: 16,
    fontWeight: "500",
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#ff8c00",
  },
  summaryContainer: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 16,
    color: "#666",
  },
  summaryAmount: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  divider: {
    height: 1,
    backgroundColor: "#e0e0e0",
    marginVertical: 8,
  },
  totalText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ff8c00",
  },
  placeOrderButton: {
    backgroundColor: "#ff8c00",
    borderRadius: 25,
    padding: 16,
    alignItems: "center",
    marginTop: 20,
  },
  placeOrderText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  emptyCartContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyCartText: {
    fontSize: 18,
    color: "#666",
    marginBottom: 16,
  },
  continueShopping: {
    backgroundColor: "#ff8c00",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  continueShoppingText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
});

export default Checkout;
