import React, { useEffect, useState } from "react";
import Toast from "react-native-toast-message";

import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
  Animated,
} from "react-native";
import CONFIG from "../config";
import LottieView from "lottie-react-native";
import { useCart } from "./CartContext";
import { theme } from "./modernTheme";

const UserFoodItemsScreen = ({ route, navigation }) => {
  const { userId: routeUserId, restaurantId, jwtToken } = route.params;
  const { addToCart, getItemQuantity, totalCount } = useCart();

  // Extract userId from route params or decode from JWT as fallback
  const userId = React.useMemo(() => {
    console.log("Route params:", route.params);
    console.log("routeUserId:", routeUserId);
    console.log("jwtToken present:", !!jwtToken);

    if (routeUserId) {
      console.log("Using routeUserId:", routeUserId);
      return routeUserId;
    }
    if (jwtToken) {
      try {
        const payload = JSON.parse(atob(jwtToken.split(".")[1]));
        console.log("Decoded JWT payload:", payload);
        return payload.user_id;
      } catch (error) {
        console.error("Error decoding JWT in UserFoodItemsScreen:", error);
        return null;
      }
    }
    console.log("No userId found");
    return null;
  }, [routeUserId, jwtToken]);

  console.log(
    "UserFoodItemsScreen - userId:",
    userId,
    "restaurantId:",
    restaurantId,
    "jwtToken:",
    jwtToken ? "Present" : "Missing"
  );
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // Remove old cart state since we're using context now
  const LoadingComponent = () => (
    <View style={styles.loaderContainer}>
      <View style={styles.loaderCircle}>
        <LottieView
          source={require("../assets/homepage.json")}
          autoPlay
          loop
          style={styles.lottie}
        />
      </View>
    </View>
  );
  // Animation value for card scaling
  const scaleValue = new Animated.Value(1);

  // Helper function to get price value safely
  const getPrice = (priceObj) => {
    if (!priceObj && priceObj !== 0) return "0";
    if (typeof priceObj === "number") return priceObj.toString();
    if (typeof priceObj === "string") return priceObj;
    if (priceObj.$numberDecimal) return priceObj.$numberDecimal;
    return "0";
  };

  useEffect(() => {
    const fetchItems = async () => {
      try {
        console.log("Fetching items for restaurantId:", restaurantId);
        console.log(
          "Using API URL:",
          `${CONFIG.API_BASE_URL}/food-items/${restaurantId}`
        );

        const response = await fetch(
          `${CONFIG.API_BASE_URL}/food-items/${restaurantId}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              ...(jwtToken ? { Authorization: `Bearer ${jwtToken}` } : {}),
            },
          }
        );

        console.log("Response status:", response.status);

        if (!response.ok) {
          throw new Error("Failed to fetch items");
        }
        const data = await response.json();
        console.log("Fetched food items:", data);
        console.log("Number of items:", data.length);
        setItems(data);
      } catch (err) {
        console.error("Error in fetchItems:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [restaurantId, userId]);
  // console.log(items, "items");
  const handleAddToCart = async (item) => {
    console.log("Adding to cart:", item.name);
    console.log("Item ID:", item._id);
    console.log("Restaurant ID:", restaurantId);

    if (!userId) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "User not logged in",
        position: "top",
      });
      return;
    }

    try {
      // Add item to context (local state)
      const cartItem = {
        _id: item._id,
        name: item.name,
        price: getPrice(item.price),
        image: item.image,
        restaurantId: restaurantId,
        userId: userId,
      };

      addToCart(cartItem);

      Toast.show({
        type: "success",
        text1: "Added to Cart",
        text2: `${item.name} added successfully`,
        position: "top",
      });
    } catch (error) {
      console.error("Error adding to cart:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to add item to cart",
        position: "top",
      });
    }
  };

  const renderFoodItem = ({ item }) => (
    <Animated.View
      style={[
        styles.card,
        {
          transform: [{ scale: scaleValue }],
        },
      ]}
    >
      <Image
        source={{ uri: item.image_url }}
        style={styles.foodImage}
        resizeMode="cover"
      />
      <View style={styles.cardContent}>
        <View style={styles.headerRow}>
          <Text style={styles.foodName}>{item.name}</Text>
          <View style={styles.priceTag}>
            <Text style={styles.price}>
              ₹{parseFloat(getPrice(item.price))}
            </Text>
          </View>
        </View>

        <Text style={styles.description} numberOfLines={2}>
          {item.description || "No description available"}
        </Text>

        <View style={styles.cardFooter}>
          <View style={styles.ratingContainer}>
            <Text style={styles.ratingText}>⭐ {item.rating || "4.5"}</Text>
          </View>

          <TouchableOpacity
            style={styles.addButton}
            onPress={() => handleAddToCart(item)}
          >
            <Text style={styles.addButtonText}>+ Add to Cart</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );

  if (loading) return <LoadingComponent />;

  // if (error)
  //   return (
  //     <View style={styles.errorContainer}>
  //       <Text style={styles.errorText}>{error}</Text>
  //     </View>
  // );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Menu</Text>
      <FlatList
        data={items}
        keyExtractor={(item) => item._id}
        renderItem={renderFoodItem}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />

      <View style={styles.bottomNavigation}>
        <TouchableOpacity
          onPress={() =>
            navigation.navigate("Checkout", {
              userId,
              restaurantId: "all", // Show all cart items, not just this restaurant
              jwtToken,
            })
          }
          style={styles.navButton}
        >
          <View style={styles.iconContainer}>
            <Text style={styles.navIcon}>🛒</Text>
            {totalCount > 0 && (
              <View style={styles.cartCountContainer}>
                <Text style={styles.cartCountText}>{totalCount}</Text>
              </View>
            )}
          </View>
          <Text style={styles.navText}>Checkout</Text>
        </TouchableOpacity>
      </View>
      <Toast />
    </View>
  );
};

const styles = StyleSheet.create({
  // Loading
  loaderContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: "center",
    alignItems: "center",
  },
  loaderCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: theme.colors.white,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    ...theme.shadows.xl,
  },
  lottie: { width: 290, height: 420, padding: theme.spacing.lg },

  // Main
  container: {
    flex: 1,
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.background,
  },
  listContainer: { paddingBottom: 120 },
  title: {
    fontSize: theme.fonts.sizes.hero,
    fontWeight: theme.fonts.weights.black,
    marginBottom: theme.spacing.lg,
    color: theme.colors.textPrimary,
    letterSpacing: -1,
  },

  // Cards
  card: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.xxl,
    marginBottom: theme.spacing.lg,
    overflow: "hidden",
    ...theme.shadows.lg,
  },
  foodImage: {
    width: "100%",
    height: 200,
    resizeMode: "cover",
  },
  cardContent: {
    padding: theme.spacing.lg,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: theme.spacing.sm,
  },
  foodName: {
    fontSize: theme.fonts.sizes.xl,
    fontWeight: theme.fonts.weights.bold,
    color: theme.colors.textPrimary,
    flex: 1,
  },
  priceTag: {
    backgroundColor: theme.colors.gray100,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
  },
  price: {
    fontSize: theme.fonts.sizes.md,
    fontWeight: theme.fonts.weights.bold,
    color: theme.colors.textPrimary,
  },
  description: {
    fontSize: theme.fonts.sizes.md,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
    lineHeight: theme.fonts.sizes.md * 1.6,
  },

  // Footer
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: theme.spacing.sm,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.black,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
  },
  ratingText: {
    fontSize: theme.fonts.sizes.sm,
    color: theme.colors.white,
    fontWeight: theme.fonts.weights.medium,
  },
  addButton: {
    backgroundColor: theme.colors.black,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    ...theme.shadows.md,
  },
  addButtonText: {
    color: theme.colors.white,
    fontWeight: theme.fonts.weights.bold,
    fontSize: theme.fonts.sizes.sm,
  },

  // Bottom Floating Checkout
  bottomNavigation: {
    flexDirection: "row",
    justifyContent: "center",
    paddingVertical: theme.spacing.md,
    backgroundColor: "transparent",
    position: "absolute",
    bottom: theme.spacing.lg,
    left: 0,
    right: 0,
  },
  navButton: {
    alignItems: "center",
  },
  iconContainer: {
    position: "relative",
    alignItems: "center",
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.black,
    justifyContent: "center",
    ...theme.shadows.xl,
  },
  navIcon: {
    fontSize: theme.fonts.sizes.xl,
    color: theme.colors.white,
  },
  cartCountContainer: {
    position: "absolute",
    top: -6,
    right: -6,
    backgroundColor: theme.colors.error,
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: theme.colors.white,
  },
  cartCountText: {
    color: theme.colors.white,
    fontWeight: theme.fonts.weights.bold,
    fontSize: theme.fonts.sizes.xs,
  },
  navText: {
    fontSize: theme.fonts.sizes.sm,
    color: theme.colors.textPrimary,
    fontWeight: theme.fonts.weights.medium,
    marginTop: theme.spacing.xs,
  },
});

export default UserFoodItemsScreen;

// IMPORTANT: Remove any calls to fetchCartItems(), setCartItemCount(), or old cart logic
// The app now uses CartContext for all cart operations

// If you see any errors about fetchCartItems or setCartItemCount,
// those functions have been removed in favor of the Cart Context
