import React, { useState, useEffect, useContext, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
  ActivityIndicator,
  SafeAreaView,
  Dimensions,
  Alert,
  StyleSheet,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { CartContext } from "../context/CartContext";
import FoodContext from "../context/FoodContext";
import Toast from "react-native-toast-message";

const { width } = Dimensions.get("window");

const UserFoodItemsScreen = () => {
  const [foodItems, setFoodItems] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [restaurantInfo, setRestaurantInfo] = useState(null);
  const { getRestaurantById, getFoodItemsByRestaurant, loading } =
    useContext(FoodContext);
  const {
    setCurrentRestaurant,
    addToCart,
    getItemQuantity,
    getCartCount,
    hasCartItems,
  } = useContext(CartContext);

  const router = useRouter();
  const params = useLocalSearchParams();
  const restaurantId = params.restaurantId;
  const restaurantName = params.restaurantName;

  const fetchFoodItems = async () => {
    try {
      // Get restaurant info using context
      const restaurantResult = await getRestaurantById(restaurantId);
      if (restaurantResult.success) {
        const restInfo = restaurantResult.data;
        setRestaurantInfo(restInfo);

        // Set as current restaurant for cart
        setCurrentRestaurant(restaurantId, restInfo);
      }

      // Get food items for this restaurant using context
      const foodResult = await getFoodItemsByRestaurant(restaurantId);
      if (foodResult.success) {
        const updatedItems = foodResult.data.map((item) => ({
          ...item,
          price: parseFloat(item.price) || 0,
        }));
        setFoodItems(updatedItems);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to load menu items",
      });
    }
  };

  useEffect(() => {
    if (restaurantId) {
      fetchFoodItems();
    }
  }, [restaurantId]);

  useFocusEffect(
    useCallback(() => {
      if (restaurantId) {
        fetchFoodItems();
      }
    }, [restaurantId])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchFoodItems();
    setRefreshing(false);
  };

  const handleAddToCart = (item) => {
    // Add item to cart (supports independent restaurant carts)
    const currentQuantity = getItemQuantity(item._id, restaurantId);
    const result = addToCart(
      {
        ...item,
        quantity: currentQuantity + 1,
        restaurant: restaurantInfo,
      },
      restaurantId
    );

    if (result.success) {
      // Toast.show({
      //   type: "success",
      //   text1: "Added to Cart",
      //   text2: `${item.name} added to your cart`,
      // });
      console.log("come ra hacker ga--");
    } else if (result.error) {
      Toast.show({
        type: "error",
        text1: "Cannot Add Item",
        text2: result.error,
      });
    }
  };

  const handleQuantityChange = (item, change) => {
    const currentQuantity = getItemQuantity(item._id, restaurantId);
    const newQuantity = Math.max(0, currentQuantity + change);

    const result = addToCart(
      {
        ...item,
        quantity: newQuantity,
        restaurant: restaurantInfo,
      },
      restaurantId
    );

    if (!result.success && result.error) {
      Toast.show({
        type: "error",
        text1: "Cannot Update Item",
        text2: result.error,
      });
    }
  };

  const navigateToCart = () => {
    if (hasCartItems(restaurantId)) {
      router.push({
        pathname: "/UserCartScreen",
        params: { restaurantId },
      });
    }
  };

  const renderFoodItem = ({ item }) => {
    const quantity = getItemQuantity(item._id, restaurantId);
    const isVeg = item.category?.toLowerCase().includes("veg") || item.isVeg;

    return (
      <View style={styles.foodItem}>
        <View style={styles.foodItemContent}>
          {/* Header Row */}
          <View style={styles.foodItemHeader}>
            <View style={styles.foodItemLeft}>
              <View style={styles.foodItemTitleRow}>
                <View
                  style={[
                    styles.vegIndicator,
                    isVeg ? styles.vegIndicatorVeg : styles.vegIndicatorNonVeg,
                  ]}
                >
                  <View
                    style={[
                      styles.vegIndicatorInner,
                      isVeg
                        ? styles.vegIndicatorInnerVeg
                        : styles.vegIndicatorInnerNonVeg,
                    ]}
                  />
                </View>
                <Text style={styles.foodItemName} numberOfLines={2}>
                  {item.name}
                </Text>
              </View>

              {item.description && (
                <Text style={styles.foodItemDescription} numberOfLines={2}>
                  {item.description}
                </Text>
              )}

              <View style={styles.foodItemBottom}>
                <Text style={styles.foodItemPrice}>₹{item.price}</Text>

                {item.category && (
                  <View style={styles.foodItemCategory}>
                    <Text style={styles.foodItemCategoryText}>
                      {item.category}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Availability Badge */}
            <View
              style={[
                styles.availabilityBadge,
                item.available
                  ? styles.availabilityBadgeAvailable
                  : styles.availabilityBadgeUnavailable,
              ]}
            >
              <Text
                style={[
                  styles.availabilityBadgeText,
                  item.available
                    ? styles.availabilityBadgeTextAvailable
                    : styles.availabilityBadgeTextUnavailable,
                ]}
              >
                {item.available ? "Available" : "Out of Stock"}
              </Text>
            </View>
          </View>

          {/* Add to Cart / Quantity Controls */}
          {item.available && (
            <View style={styles.controlsContainer}>
              {quantity === 0 ? (
                <TouchableOpacity
                  style={styles.addToCartButton}
                  onPress={() => handleAddToCart(item)}
                  activeOpacity={0.8}
                >
                  <MaterialCommunityIcons name="plus" size={18} color="white" />
                  <Text style={styles.addToCartButtonText}>Add to Cart</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.quantityControls}>
                  <TouchableOpacity
                    style={[styles.quantityButton, styles.quantityButtonMinus]}
                    onPress={() => handleQuantityChange(item, -1)}
                    activeOpacity={0.7}
                  >
                    <MaterialCommunityIcons
                      name="minus"
                      size={18}
                      color="#F97316"
                    />
                  </TouchableOpacity>

                  <View style={styles.quantityDisplay}>
                    <Text style={styles.quantityText}>{quantity}</Text>
                  </View>

                  <TouchableOpacity
                    style={[styles.quantityButton, styles.quantityButtonPlus]}
                    onPress={() => handleQuantityChange(item, 1)}
                    activeOpacity={0.7}
                  >
                    <MaterialCommunityIcons
                      name="plus"
                      size={18}
                      color="white"
                    />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}

          {!item.available && (
            <View style={styles.unavailableContainer}>
              <View style={styles.unavailableText}>
                <Text style={styles.unavailableText}>
                  Currently Unavailable
                </Text>
              </View>
            </View>
          )}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            gap: 16,
          }}
        >
          <View
            style={{
              width: 80,
              height: 80,
              backgroundColor: "#FFF8F0",
              borderRadius: 40,
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <MaterialCommunityIcons name="food" size={48} color="#FF6B00" />
          </View>
          <ActivityIndicator size="large" color="#FF6B00" />
          <Text
            style={{
              marginTop: 8,
              color: "#333333",
              fontSize: 16,
              fontFamily: "Poppins-Bold",
            }}
          >
            Loading menu...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" backgroundColor="#f9fafb" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#333333" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {restaurantInfo?.name || restaurantName || "Menu"}
          </Text>
          {restaurantInfo?.location && (
            <Text style={styles.headerSubtitle} numberOfLines={1}>
              {restaurantInfo.location}
            </Text>
          )}
        </View>
        <TouchableOpacity
          style={styles.cartButton}
          onPress={navigateToCart}
          disabled={!hasCartItems(restaurantId)}
        >
          <MaterialCommunityIcons
            name="cart"
            size={24}
            color={
              hasCartItems(restaurantId) ? "white" : "rgba(255,255,255,0.5)"
            }
          />
          {hasCartItems(restaurantId) && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>
                {getCartCount(restaurantId)}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Menu Items */}
      <FlatList
        data={foodItems}
        renderItem={renderFoodItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.menuContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#F97316"]}
            tintColor="#F97316"
          />
        }
        ListEmptyComponent={() => (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="food-off" size={64} color="#9CA3AF" />
            <Text style={styles.emptyTitle}>No Menu Items</Text>
            <Text style={styles.emptySubtitle}>
              This restaurant hasn't added any menu items yet.
            </Text>
          </View>
        )}
      />

      {/* Floating Cart Button (when has items) */}
      {hasCartItems(restaurantId) && (
        <View style={styles.floatingCartContainer}>
          <TouchableOpacity
            style={styles.floatingCartButton}
            onPress={navigateToCart}
            activeOpacity={0.9}
          >
            <View style={styles.floatingCartLeft}>
              <MaterialCommunityIcons name="cart" size={24} color="white" />
              <Text style={styles.floatingCartText}>View Cart</Text>
            </View>
            <View style={styles.floatingCartRight}>
              <Text style={styles.floatingCartCount}>
                {getCartCount(restaurantId)} items
              </Text>
              <MaterialCommunityIcons
                name="arrow-right"
                size={20}
                color="white"
              />
            </View>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
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
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontFamily: "Poppins-Bold",
    fontSize: 20,
    color: "#333333",
    textAlign: "center",
  },
  headerSubtitle: {
    fontFamily: "Poppins-Regular",
    fontSize: 14,
    color: "#666666",
    textAlign: "center",
    marginTop: 2,
  },
  cartButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F97316",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  cartBadge: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "#EF4444",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  cartBadgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontFamily: "Poppins-Bold",
  },
  menuContainer: {
    paddingVertical: 20,
    paddingBottom: 120,
  },
  foodItem: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  foodItemContent: {
    padding: 20,
  },
  foodItemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  foodItemLeft: {
    flex: 1,
    marginRight: 16,
  },
  foodItemTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  vegIndicator: {
    width: 16,
    height: 16,
    borderRadius: 2,
    borderWidth: 2,
    marginRight: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  vegIndicatorVeg: {
    backgroundColor: "#10B981",
    borderColor: "#10B981",
  },
  vegIndicatorNonVeg: {
    backgroundColor: "#EF4444",
    borderColor: "#EF4444",
  },
  vegIndicatorInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  vegIndicatorInnerVeg: {
    backgroundColor: "#059669",
  },
  vegIndicatorInnerNonVeg: {
    backgroundColor: "#DC2626",
  },
  foodItemName: {
    fontSize: 18,
    fontFamily: "Poppins-Bold",
    color: "#111827",
    flex: 1,
  },
  foodItemDescription: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: "#6B7280",
    marginBottom: 12,
    lineHeight: 20,
  },
  foodItemBottom: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  foodItemPrice: {
    fontSize: 24,
    fontFamily: "Poppins-Bold",
    color: "#F97316",
  },
  foodItemCategory: {
    backgroundColor: "#F3F4F6",
    borderRadius: 50,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  foodItemCategoryText: {
    fontSize: 12,
    fontFamily: "Poppins-Medium",
    color: "#374151",
  },
  availabilityBadge: {
    borderRadius: 50,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  availabilityBadgeAvailable: {
    backgroundColor: "#D1FAE5",
  },
  availabilityBadgeUnavailable: {
    backgroundColor: "#FEE2E2",
  },
  availabilityBadgeText: {
    fontSize: 12,
    fontFamily: "Poppins-Medium",
  },
  availabilityBadgeTextAvailable: {
    color: "#065F46",
  },
  availabilityBadgeTextUnavailable: {
    color: "#991B1B",
  },
  controlsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  addToCartButton: {
    flex: 1,
    backgroundColor: "#F97316",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  addToCartButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Poppins-Bold",
    marginLeft: 8,
  },
  quantityControls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flex: 1,
  },
  quantityButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  quantityButtonMinus: {
    backgroundColor: "#FED7AA",
  },
  quantityButtonPlus: {
    backgroundColor: "#F97316",
  },
  quantityDisplay: {
    backgroundColor: "#FFF7ED",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minWidth: 60,
    alignItems: "center",
  },
  quantityText: {
    fontSize: 18,
    fontFamily: "Poppins-Bold",
    color: "#F97316",
  },
  unavailableContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  unavailableText: {
    backgroundColor: "#F3F4F6",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    textAlign: "center",
    color: "#6B7280",
    fontSize: 16,
    fontFamily: "Poppins-Medium",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 80,
  },
  emptyIcon: {
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: "Poppins-Bold",
    color: "#111827",
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
  },
  floatingCartContainer: {
    position: "absolute",
    bottom: 24,
    left: 24,
    right: 24,
  },
  floatingCartButton: {
    backgroundColor: "#F97316",
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#F97316",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  floatingCartLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  floatingCartText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontFamily: "Poppins-Bold",
    marginLeft: 12,
  },
  floatingCartRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  floatingCartCount: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Poppins-Bold",
    marginRight: 8,
  },
});

export default UserFoodItemsScreen;
