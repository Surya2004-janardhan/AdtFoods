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
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import CartContext from "../context/CartContext";
import FoodContext from "../context/FoodContext";
import BottomNavigation from "../components/BottomNavigation";
import Toast from "react-native-toast-message";

const UserFoodItemsScreen = () => {
  const [foodItems, setFoodItems] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [restaurantInfo, setRestaurantInfo] = useState(null);
  const { getRestaurantById, getFoodItemsByRestaurant, loading } =
    useContext(FoodContext);
  const router = useRouter();
  const params = useLocalSearchParams();
  const { cartItems, addToCart } = useContext(CartContext);

  const restaurantId = params.restaurantId;
  const userId = params.userId;

  const fetchFoodItems = async () => {
    try {
      // Get restaurant info using context
      const restaurantResult = await getRestaurantById(restaurantId);
      if (restaurantResult.success) {
        setRestaurantInfo(restaurantResult.data);
      }

      // Get food items for this restaurant using context
      const foodResult = await getFoodItemsByRestaurant(restaurantId);
      if (foodResult.success) {
        const updatedItems = foodResult.data.map((item) => ({
          ...item,
          price: parseFloat(item.price),
          quantity: 0,
        }));
        setFoodItems(updatedItems);
      } else {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: foodResult.error,
        });
      }
    } catch (error) {
      console.error("Error fetching food items:", error.message);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to fetch menu items. Please try again.",
      });
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
export default UserFoodItemsScreen;
