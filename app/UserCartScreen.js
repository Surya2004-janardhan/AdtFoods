import React, { useContext, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StatusBar,
  SafeAreaView,
  StyleSheet,
  Alert,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { CartContext } from "../context/CartContext";
import BottomNavigation from "../components/BottomNavigation";
import Toast from "react-native-toast-message";

const UserCartScreen = () => {
  const {
    getCartItems,
    updateQuantity,
    removeFromCart,
    clearRestaurantCart,
    calculateTotal,
    getCurrentRestaurantInfo,
    currentRestaurantId,
    hasCartItems,
  } = useContext(CartContext);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const cartItems = getCartItems();
  const restaurantInfo = getCurrentRestaurantInfo();

  const getTotalPrice = () => {
    return calculateTotal();
  };

  const handleUpdateQuantity = (itemId, newQuantity) => {
    if (newQuantity === 0) {
      removeFromCart(itemId);
      Toast.show({
        type: "info",
        text1: "Item Removed",
        text2: "Item has been removed from your cart",
      });
    } else {
      updateQuantity(itemId, newQuantity);
    }
  };

  const handleClearCart = () => {
    Alert.alert(
      "Clear Cart",
      "Are you sure you want to remove all items from your cart?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Clear",
          style: "destructive",
          onPress: () => {
            clearRestaurantCart();
            Toast.show({
              type: "success",
              text1: "Cart Cleared",
              text2: "All items have been removed from your cart",
            });
          },
        },
      ]
    );
  };

  const handleCheckout = () => {
    if (!hasCartItems()) {
      Toast.show({
        type: "error",
        text1: "Empty Cart",
        text2: "Please add items to your cart before checkout",
      });
      return;
    }

    router.push("/PaymentScreen");
  };

  const renderCartItem = ({ item }) => (
    <View style={styles.cartItem}>
      <Image
        source={{ uri: item.image || "https://via.placeholder.com/80" }}
        style={styles.itemImage}
      />
      <View style={styles.itemInfo}>
        <Text style={styles.itemName} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.itemPrice}>₹{item.price}</Text>
        <View style={styles.quantityContainer}>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => handleUpdateQuantity(item._id, item.quantity - 1)}
          >
            <MaterialCommunityIcons name="minus" size={16} color="#FF6B00" />
          </TouchableOpacity>
          <Text style={styles.quantityText}>{item.quantity}</Text>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => handleUpdateQuantity(item._id, item.quantity + 1)}
          >
            <MaterialCommunityIcons name="plus" size={16} color="#FF6B00" />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.itemActions}>
        <Text style={styles.itemTotal}>
          ₹{(item.price * item.quantity).toFixed(2)}
        </Text>
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => handleUpdateQuantity(item._id, 0)}
        >
          <MaterialCommunityIcons name="delete" size={20} color="#FF4444" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const EmptyCart = () => (
    <View style={styles.emptyContainer}>
      <MaterialCommunityIcons name="cart-outline" size={80} color="#CCCCCC" />
      <Text style={styles.emptyTitle}>Your cart is empty</Text>
      <Text style={styles.emptyText}>
        Add some delicious items from our restaurants to get started!
      </Text>
      <TouchableOpacity
        style={styles.browseButton}
        onPress={() => router.push("/HomeScreen")}
      >
        <Text style={styles.browseButtonText}>Browse Restaurants</Text>
      </TouchableOpacity>
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
        <Text style={styles.headerTitle}>My Cart</Text>
        {cartItems.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={handleClearCart}
          >
            <MaterialCommunityIcons
              name="delete-sweep"
              size={24}
              color="#FF4444"
            />
          </TouchableOpacity>
        )}
      </View>

      {cartItems.length === 0 ? (
        <EmptyCart />
      ) : (
        <>
          {/* Restaurant Info */}
          {restaurantInfo && (
            <View className="bg-white mx-4 mt-4 rounded-xl p-4 shadow-sm border border-gray-100">
              <Text
                className="text-lg font-semibold text-gray-900"
                style={{ fontFamily: "Poppins-Bold" }}
              >
                Order from {restaurantInfo.name}
              </Text>
              <Text
                className="text-gray-600 text-sm"
                style={{ fontFamily: "Poppins-Regular" }}
              >
                {restaurantInfo.location}
              </Text>
            </View>
          )}

          {/* Cart Items List */}
          <FlatList
            data={cartItems}
            renderItem={renderCartItem}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />

          {/* Cart Summary */}
          <View style={styles.summaryContainer}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>
                ₹{getTotalPrice().toFixed(2)}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Delivery Fee</Text>
              <Text style={styles.summaryValue}>₹40.00</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Taxes</Text>
              <Text style={styles.summaryValue}>
                ₹{(getTotalPrice() * 0.18).toFixed(2)}
              </Text>
            </View>
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>
                ₹{(getTotalPrice() + 40 + getTotalPrice() * 0.18).toFixed(2)}
              </Text>
            </View>

            {/* Checkout Button */}
            <TouchableOpacity
              style={styles.checkoutButton}
              onPress={handleCheckout}
              disabled={loading}
            >
              <MaterialCommunityIcons
                name="credit-card"
                size={20}
                color="#FFFFFF"
              />
              <Text style={styles.checkoutButtonText}>
                {loading ? "Processing..." : "Proceed to Checkout"}
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* Bottom Navigation */}
      <BottomNavigation userRole="user" />
    </SafeAreaView>
  );
};

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
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F8F9FA",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  headerTitle: {
    flex: 1,
    fontFamily: "Poppins-Bold",
    fontSize: 20,
    color: "#333333",
  },
  clearButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFEBEE",
    justifyContent: "center",
    alignItems: "center",
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  cartItem: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  itemImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
    backgroundColor: "#F0F0F0",
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "space-between",
  },
  itemName: {
    fontFamily: "Poppins-Bold",
    fontSize: 14,
    color: "#333333",
    marginBottom: 4,
  },
  itemPrice: {
    fontFamily: "Poppins",
    fontSize: 12,
    color: "#666666",
    marginBottom: 8,
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    borderRadius: 20,
    paddingHorizontal: 4,
    alignSelf: "flex-start",
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    margin: 2,
  },
  quantityText: {
    fontFamily: "Poppins-Bold",
    fontSize: 14,
    color: "#333333",
    paddingHorizontal: 12,
  },
  itemActions: {
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  itemTotal: {
    fontFamily: "Poppins-Bold",
    fontSize: 16,
    color: "#FF6B00",
  },
  removeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#FFEBEE",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  summaryContainer: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    marginBottom: 80, // Space for bottom navigation
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  summaryLabel: {
    fontFamily: "Poppins",
    fontSize: 14,
    color: "#666666",
  },
  summaryValue: {
    fontFamily: "Poppins",
    fontSize: 14,
    color: "#333333",
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    marginTop: 8,
    paddingTop: 16,
  },
  totalLabel: {
    fontFamily: "Poppins-Bold",
    fontSize: 16,
    color: "#333333",
  },
  totalValue: {
    fontFamily: "Poppins-Bold",
    fontSize: 18,
    color: "#FF6B00",
  },
  checkoutButton: {
    flexDirection: "row",
    backgroundColor: "#FF6B00",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    gap: 8,
    shadowColor: "#FF6B00",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  checkoutButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Poppins-Bold",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
    paddingBottom: 100, // Space for bottom navigation
  },
  emptyTitle: {
    fontFamily: "Poppins-Bold",
    fontSize: 24,
    color: "#333333",
    textAlign: "center",
    marginTop: 24,
    marginBottom: 12,
  },
  emptyText: {
    fontFamily: "Poppins",
    fontSize: 14,
    color: "#666666",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 32,
  },
  browseButton: {
    backgroundColor: "#FF6B00",
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: "#FF6B00",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  browseButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontFamily: "Poppins-Bold",
  },
});

export default UserCartScreen;
