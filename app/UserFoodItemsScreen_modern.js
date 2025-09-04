import React, { useState, useEffect, useContext, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
  ActivityIndicator,
  SafeAreaView,
  StyleSheet,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import axios from "../axiosConfig";
import CartContext from "../context/CartContext";
import BottomNavigation from "../components/BottomNavigation";
import Toast from "react-native-toast-message";

const UserFoodItemsScreen = () => {
  const [foodItems, setFoodItems] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [restaurantInfo, setRestaurantInfo] = useState(null);
  const router = useRouter();
  const params = useLocalSearchParams();
  const { cartItems, addToCart } = useContext(CartContext);

  const restaurantId = params.restaurantId;
  const userId = params.userId;

  const fetchFoodItems = async () => {
    try {
      setLoading(true);

      // Fetch restaurant info
      const restaurantResponse = await axios.get(
        `/restaurants/${restaurantId}`
      );
      setRestaurantInfo(restaurantResponse.data);

      // Fetch food items for this restaurant
      const response = await axios.get(
        `/food-items?restaurantId=${restaurantId}`
      );
      const availableItems = response.data.filter((item) => item.available);
      const updatedItems = availableItems.map((item) => ({
        ...item,
        price: parseFloat(item.price),
        quantity: 0,
      }));
      setFoodItems(updatedItems);
    } catch (error) {
      console.error("Error fetching food items:", error.message);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to fetch menu items. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFoodItems();
  }, [restaurantId]);

  useFocusEffect(
    useCallback(() => {
      setFoodItems((prevItems) =>
        prevItems.map((item) => {
          const cartItem = cartItems.find((ci) => ci.id === item._id);
          return { ...item, quantity: cartItem ? cartItem.quantity : 0 };
        })
      );
    }, [cartItems])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchFoodItems();
    setRefreshing(false);
  };

  const handleAddToCart = (item) => {
    addToCart({
      id: item._id,
      name: item.food_name,
      price: item.price,
      image: item.food_image,
      restaurantId: restaurantId,
    });

    Toast.show({
      type: "success",
      text1: "Added to Cart",
      text2: `${item.food_name} has been added to your cart`,
    });
  };

  const renderFoodItem = ({ item }) => {
    const cartQuantity =
      cartItems.find((ci) => ci.id === item._id)?.quantity || 0;

    return (
      <View style={styles.foodCard}>
        <Image
          source={{ uri: item.food_image || "https://via.placeholder.com/150" }}
          style={styles.foodImage}
        />
        <View style={styles.foodInfo}>
          <Text style={styles.foodName} numberOfLines={2}>
            {item.food_name}
          </Text>
          <Text style={styles.foodDescription} numberOfLines={2}>
            {item.food_description || "Delicious food item"}
          </Text>
          <View style={styles.foodMeta}>
            <View style={styles.priceContainer}>
              <Text style={styles.priceLabel}>Price</Text>
              <Text style={styles.price}>₹{item.price}</Text>
            </View>
            <View style={styles.ratingContainer}>
              <MaterialCommunityIcons name="star" size={16} color="#FFD700" />
              <Text style={styles.ratingText}>4.2</Text>
            </View>
          </View>
          <View style={styles.actionContainer}>
            <View style={styles.quantityContainer}>
              {cartQuantity > 0 && (
                <View style={styles.quantityBadge}>
                  <Text style={styles.quantityText}>
                    {cartQuantity} in cart
                  </Text>
                </View>
              )}
            </View>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => handleAddToCart(item)}
            >
              <MaterialCommunityIcons name="plus" size={20} color="#FFFFFF" />
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.loadingContent}>
          <View style={styles.loadingIcon}>
            <MaterialCommunityIcons
              name="silverware-fork-knife"
              size={48}
              color="#FF6B00"
            />
          </View>
          <ActivityIndicator size="large" color="#FF6B00" />
          <Text style={styles.loadingText}>Loading menu...</Text>
        </View>
      </View>
    );
  }

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
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>Menu</Text>
          {restaurantInfo && (
            <Text style={styles.headerSubtitle}>
              {restaurantInfo.restaurant_name}
            </Text>
          )}
        </View>
        <TouchableOpacity
          style={styles.cartButton}
          onPress={() => router.push("/UserCartScreen")}
        >
          <MaterialCommunityIcons name="cart" size={24} color="#FF6B00" />
          {cartItems.length > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>
                {cartItems.reduce((sum, item) => sum + item.quantity, 0)}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Restaurant Info Card */}
      {restaurantInfo && (
        <View style={styles.restaurantCard}>
          <Image
            source={{
              uri:
                restaurantInfo.restaurant_image ||
                "https://via.placeholder.com/400x200",
            }}
            style={styles.restaurantImage}
          />
          <View style={styles.restaurantOverlay}>
            <Text style={styles.restaurantName}>
              {restaurantInfo.restaurant_name}
            </Text>
            <View style={styles.restaurantMeta}>
              <View style={styles.restaurantRating}>
                <MaterialCommunityIcons name="star" size={16} color="#FFD700" />
                <Text style={styles.restaurantRatingText}>4.5</Text>
              </View>
              <View style={styles.restaurantLocation}>
                <MaterialCommunityIcons
                  name="map-marker"
                  size={16}
                  color="#FFFFFF"
                />
                <Text style={styles.restaurantLocationText}>
                  {restaurantInfo.restaurant_location}
                </Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* Food Items List */}
      <FlatList
        data={foodItems}
        renderItem={renderFoodItem}
        keyExtractor={(item) => item._id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#FF6B00"]}
            tintColor="#FF6B00"
          />
        }
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />

      {/* Bottom Navigation */}
      <BottomNavigation userRole="user" />
      <Toast />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContent: {
    alignItems: "center",
    gap: 16,
  },
  loadingIcon: {
    width: 80,
    height: 80,
    backgroundColor: "#FFF8F0",
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  loadingText: {
    fontFamily: "Poppins",
    fontSize: 16,
    color: "#666666",
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
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontFamily: "PlayfairDisplay-Bold",
    fontSize: 20,
    color: "#333333",
  },
  headerSubtitle: {
    fontFamily: "Poppins",
    fontSize: 14,
    color: "#666666",
    marginTop: 2,
  },
  cartButton: {
    position: "relative",
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFF8F0",
    justifyContent: "center",
    alignItems: "center",
  },
  cartBadge: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "#FF6B00",
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
  restaurantCard: {
    height: 120,
    marginHorizontal: 20,
    marginVertical: 16,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  restaurantImage: {
    width: "100%",
    height: "100%",
  },
  restaurantOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  restaurantName: {
    fontFamily: "Poppins-Bold",
    fontSize: 16,
    color: "#FFFFFF",
    marginBottom: 4,
  },
  restaurantMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  restaurantRating: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  restaurantRatingText: {
    fontFamily: "Poppins",
    fontSize: 12,
    color: "#FFFFFF",
  },
  restaurantLocation: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flex: 1,
  },
  restaurantLocationText: {
    fontFamily: "Poppins",
    fontSize: 12,
    color: "#FFFFFF",
    flex: 1,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 100, // Space for bottom navigation
    paddingTop: 8,
  },
  foodCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  foodImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: "#F0F0F0",
  },
  foodInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "space-between",
  },
  foodName: {
    fontFamily: "Poppins-Bold",
    fontSize: 16,
    color: "#333333",
    marginBottom: 4,
  },
  foodDescription: {
    fontFamily: "Poppins",
    fontSize: 12,
    color: "#666666",
    marginBottom: 8,
  },
  foodMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  priceLabel: {
    fontFamily: "Poppins",
    fontSize: 12,
    color: "#666666",
  },
  price: {
    fontFamily: "Poppins-Bold",
    fontSize: 16,
    color: "#FF6B00",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  ratingText: {
    fontFamily: "Poppins",
    fontSize: 12,
    color: "#666666",
  },
  actionContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  quantityContainer: {
    flex: 1,
  },
  quantityBadge: {
    backgroundColor: "#FFF8F0",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FF6B00",
    alignSelf: "flex-start",
  },
  quantityText: {
    fontFamily: "Poppins",
    fontSize: 10,
    color: "#FF6B00",
  },
  addButton: {
    flexDirection: "row",
    backgroundColor: "#FF6B00",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: "center",
    gap: 4,
    shadowColor: "#FF6B00",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  addButtonText: {
    color: "#FFFFFF",
    fontFamily: "Poppins-Bold",
    fontSize: 12,
  },
});

export default UserFoodItemsScreen;
