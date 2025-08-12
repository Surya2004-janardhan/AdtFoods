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
import { theme } from "./modernTheme";

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
  // Main Layout
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
  },
  title: {
    fontSize: theme.fonts.sizes.display,
    fontWeight: theme.fonts.weights.black,
    marginBottom: theme.spacing.lg,
    color: theme.colors.textPrimary,
    letterSpacing: -0.5,
  },

  // Cart Items
  listContainer: {
    paddingBottom: theme.spacing.lg,
  },
  cartItem: {
    flexDirection: "row",
    backgroundColor: theme.colors.white,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderRadius: theme.borderRadius.xl,
    alignItems: "center",
    ...theme.shadows.lg,
  },
  itemImage: {
    width: 70,
    height: 70,
    borderRadius: theme.borderRadius.lg,
    marginRight: theme.spacing.md,
  },
  itemDetails: {
    flex: 1,
    paddingRight: theme.spacing.sm,
  },
  itemName: {
    fontSize: theme.fonts.sizes.lg,
    fontWeight: theme.fonts.weights.bold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.xs,
    lineHeight: theme.fonts.lineHeights.tight * theme.fonts.sizes.lg,
  },
  itemPrice: {
    fontSize: theme.fonts.sizes.md,
    color: theme.colors.textPrimary,
    fontWeight: theme.fonts.weights.bold,
    marginBottom: theme.spacing.xs,
  },

  // Quantity Controls
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: theme.spacing.xs,
  },
  quantityButton: {
    backgroundColor: theme.colors.black,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: theme.spacing.xs,
    ...theme.shadows.sm,
  },
  quantityButtonText: {
    color: theme.colors.white,
    fontSize: theme.fonts.sizes.lg,
    fontWeight: theme.fonts.weights.bold,
  },
  quantityDisplay: {
    backgroundColor: theme.colors.gray100,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    marginHorizontal: theme.spacing.xs,
  },
  quantityText: {
    fontSize: theme.fonts.sizes.md,
    fontWeight: theme.fonts.weights.bold,
    color: theme.colors.textPrimary,
  },
  removeButton: {
    backgroundColor: theme.colors.error,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    ...theme.shadows.md,
  },
  removeButtonText: {
    fontSize: theme.fonts.sizes.md,
  },

  // Empty Cart State
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: theme.spacing.xl,
  },
  emptyText: {
    fontSize: theme.fonts.sizes.xl,
    color: theme.colors.white,
    marginBottom: theme.spacing.xl,
    textAlign: "center",
    fontWeight: theme.fonts.weights.medium,
  },
  continueButton: {
    backgroundColor: theme.colors.black,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.lg,
  },
  continueButtonText: {
    color: theme.colors.white,
    fontWeight: theme.fonts.weights.bold,
    fontSize: theme.fonts.sizes.md,
  },

  // Summary Section
  summaryContainer: {
    backgroundColor: theme.colors.white,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.xl,
    marginTop: theme.spacing.md,
    ...theme.shadows.xl,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: theme.spacing.md,
    alignItems: "center",
  },
  summaryText: {
    fontSize: theme.fonts.sizes.md,
    color: theme.colors.textSecondary,
    fontWeight: theme.fonts.weights.medium,
  },
  summaryValue: {
    fontSize: theme.fonts.sizes.md,
    color: theme.colors.textPrimary,
    fontWeight: theme.fonts.weights.bold,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.gray200,
    marginVertical: theme.spacing.md,
  },
  totalText: {
    fontSize: theme.fonts.sizes.lg,
    fontWeight: theme.fonts.weights.bold,
    color: theme.colors.textPrimary,
  },
  totalValue: {
    fontSize: theme.fonts.sizes.lg,
    fontWeight: theme.fonts.weights.bold,
    color: theme.colors.textPrimary,
  },

  // Place Order Button
  placeOrderButton: {
    backgroundColor: theme.colors.black,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    alignItems: "center",
    marginTop: theme.spacing.lg,
    ...theme.shadows.lg,
  },
  placeOrderText: {
    color: theme.colors.white,
    fontSize: theme.fonts.sizes.lg,
    fontWeight: theme.fonts.weights.bold,
  },
});

export default Checkout;
