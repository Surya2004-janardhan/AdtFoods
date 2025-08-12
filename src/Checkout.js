import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
} from "react-native";
import Toast from "react-native-toast-message";
import { useCart } from "./CartContext";

const Checkout = ({ route, navigation }) => {
  const { userId, restaurantId, jwtToken } = route.params;
  const { cartItems, totalAmount, clearCart, updateQuantity, removeFromCart } =
    useCart();
  const [loading, setLoading] = useState(false);

  console.log("=== CHECKOUT DEBUG ===");
  console.log("Route params:", route.params);
  console.log("All cart items:", cartItems);
  console.log("Total amount:", totalAmount);
  console.log("Restaurant ID:", restaurantId);

  // Get items to display - show ALL items regardless of restaurant for unified cart
  const displayCartItems = cartItems; // Always show all cart items

  console.log("Items to display:", displayCartItems);

  const handleIncrement = (itemId, restaurantId, currentQuantity) => {
    updateQuantity(itemId, restaurantId, currentQuantity + 1);
  };

  const handleDecrement = (itemId, restaurantId, currentQuantity) => {
    if (currentQuantity > 1) {
      updateQuantity(itemId, restaurantId, currentQuantity - 1);
    } else {
      removeFromCart(itemId, restaurantId);
    }
  };

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
      // Simulate order placement
      await new Promise((resolve) => setTimeout(resolve, 2000));

      clearCart();

      Toast.show({
        type: "success",
        text1: "Order Placed!",
        text2: "Your order has been placed successfully",
        position: "top",
      });

      setTimeout(() => {
        navigation.reset({
          index: 0,
          routes: [{ name: "HomeScreen", params: { jwtToken } }],
        });
      }, 1000);
    } catch (error) {
      console.error("Order placement error:", error);
      Toast.show({
        type: "error",
        text1: "Order Failed",
        text2: "Please try again",
        position: "top",
      });
    } finally {
      setLoading(false);
    }
  };

  const renderCartItem = ({ item }) => (
    <View style={styles.cartItem}>
      <Image
        source={{ uri: item.image }}
        style={styles.itemImage}
        defaultSource={{ uri: "https://via.placeholder.com/60" }}
      />
      <View style={styles.itemDetails}>
        <Text style={styles.itemName}>{item.name}</Text>
        <Text style={styles.itemPrice}>₹{item.price}</Text>

        {/* Quantity Controls */}
        <View style={styles.quantityContainer}>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() =>
              handleDecrement(item._id, item.restaurantId, item.quantity || 1)
            }
          >
            <Text style={styles.quantityButtonText}>-</Text>
          </TouchableOpacity>

          <View style={styles.quantityDisplay}>
            <Text style={styles.quantityText}>{item.quantity || 1}</Text>
          </View>

          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() =>
              handleIncrement(item._id, item.restaurantId, item.quantity || 1)
            }
          >
            <Text style={styles.quantityButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Remove Button */}
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => removeFromCart(item._id, item.restaurantId)}
      >
        <Text style={styles.removeButtonText}>🗑️</Text>
      </TouchableOpacity>
    </View>
  );

  if (displayCartItems.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Your Cart</Text>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Your cart is empty</Text>
          <TouchableOpacity
            style={styles.continueButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.continueButtonText}>Continue Shopping</Text>
          </TouchableOpacity>
        </View>
        <Toast />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Cart</Text>

      <FlatList
        data={displayCartItems}
        renderItem={renderCartItem}
        keyExtractor={(item, index) => `${item._id}-${index}`}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />

      <View style={styles.summaryContainer}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryText}>Total Items:</Text>
          <Text style={styles.summaryValue}>{displayCartItems.length}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryText}>Subtotal:</Text>
          <Text style={styles.summaryValue}>₹{totalAmount.toFixed(2)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryText}>Delivery Fee:</Text>
          <Text style={styles.summaryValue}>₹10.00</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.summaryRow}>
          <Text style={styles.totalText}>Total:</Text>
          <Text style={styles.totalValue}>
            ₹{(totalAmount + 10).toFixed(2)}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.placeOrderButton}
          onPress={handlePlaceOrder}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.placeOrderText}>Place Order</Text>
          )}
        </TouchableOpacity>
      </View>

      <Toast />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ff8c00", // Orange background to match app theme
    padding: 16,
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#fff", // White text on orange background
  },
  listContainer: {
    paddingBottom: 20,
  },
  cartItem: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 15,
  },
  itemDetails: {
    flex: 1,
    justifyContent: "center",
  },
  itemName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  itemPrice: {
    fontSize: 14,
    color: "#ff8c00",
    fontWeight: "bold",
    marginBottom: 3,
  },
  itemQuantity: {
    fontSize: 12,
    color: "#666",
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  quantityButton: {
    backgroundColor: "#ff8c00",
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 5,
  },
  quantityButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  quantityDisplay: {
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 15,
    marginHorizontal: 5,
  },
  quantityText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  removeButton: {
    backgroundColor: "#ff4444",
    width: 35,
    height: 35,
    borderRadius: 17.5,
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
  },
  removeButtonText: {
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 18,
    color: "#666",
    marginBottom: 20,
  },
  continueButton: {
    backgroundColor: "#ff8c00",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  continueButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  summaryContainer: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    marginTop: 10,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  summaryText: {
    fontSize: 16,
    color: "#333",
  },
  summaryValue: {
    fontSize: 16,
    color: "#333",
    fontWeight: "bold",
  },
  divider: {
    height: 1,
    backgroundColor: "#ddd",
    marginVertical: 10,
  },
  totalText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ff8c00",
  },
  placeOrderButton: {
    backgroundColor: "#ff8c00",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 15,
  },
  placeOrderText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default Checkout;
