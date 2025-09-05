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
      <View className="bg-white rounded-2xl mx-4 mb-4 overflow-hidden shadow-sm border border-gray-100">
        <View className="p-5">
          {/* Header Row */}
          <View className="flex-row justify-between items-start mb-3">
            <View className="flex-1 mr-4">
              <View className="flex-row items-center mb-2">
                <View
                  className={`w-4 h-4 rounded-sm mr-2 border-2 ${
                    isVeg
                      ? "bg-green-500 border-green-500"
                      : "bg-red-500 border-red-500"
                  }`}
                >
                  <View
                    className={`w-2 h-2 rounded-full m-auto ${
                      isVeg ? "bg-green-600" : "bg-red-600"
                    }`}
                  />
                </View>
                <Text
                  className="text-lg font-bold text-gray-900"
                  style={{ fontFamily: "Poppins-Bold" }}
                  numberOfLines={2}
                >
                  {item.name}
                </Text>
              </View>

              {item.description && (
                <Text
                  className="text-gray-600 text-sm mb-3 leading-5"
                  style={{ fontFamily: "Poppins-Regular" }}
                  numberOfLines={2}
                >
                  {item.description}
                </Text>
              )}

              <View className="flex-row items-center justify-between">
                <Text
                  className="text-2xl font-bold text-orange-600"
                  style={{ fontFamily: "Poppins-Bold" }}
                >
                  ₹{item.price}
                </Text>

                {item.category && (
                  <View className="bg-gray-100 rounded-full px-3 py-1">
                    <Text
                      className="text-gray-700 text-xs font-medium"
                      style={{ fontFamily: "Poppins-Medium" }}
                    >
                      {item.category}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Availability Badge */}
            <View
              className={`rounded-full px-3 py-1 ${
                item.available ? "bg-green-100" : "bg-red-100"
              }`}
            >
              <Text
                className={`text-xs font-medium ${
                  item.available ? "text-green-800" : "text-red-800"
                }`}
                style={{ fontFamily: "Poppins-Medium" }}
              >
                {item.available ? "Available" : "Out of Stock"}
              </Text>
            </View>
          </View>

          {/* Add to Cart / Quantity Controls */}
          {item.available && (
            <View className="flex-row items-center justify-between mt-4 pt-4 border-t border-gray-100">
              {quantity === 0 ? (
                <TouchableOpacity
                  onPress={() => handleAddToCart(item)}
                  className="flex-1 bg-orange-500 rounded-xl py-3 px-4 flex-row items-center justify-center"
                  activeOpacity={0.8}
                >
                  <MaterialCommunityIcons name="plus" size={18} color="white" />
                  <Text
                    className="text-white font-bold ml-2"
                    style={{ fontFamily: "Poppins-Bold" }}
                  >
                    Add to Cart
                  </Text>
                </TouchableOpacity>
              ) : (
                <View className="flex-row items-center justify-between flex-1">
                  <TouchableOpacity
                    onPress={() => handleQuantityChange(item, -1)}
                    className="bg-orange-100 rounded-full p-2"
                    activeOpacity={0.7}
                  >
                    <MaterialCommunityIcons
                      name="minus"
                      size={18}
                      color="#F97316"
                    />
                  </TouchableOpacity>

                  <View className="bg-orange-50 rounded-xl px-4 py-2 min-w-[80px] items-center">
                    <Text
                      className="text-orange-600 font-bold text-lg"
                      style={{ fontFamily: "Poppins-Bold" }}
                    >
                      {quantity}
                    </Text>
                  </View>

                  <TouchableOpacity
                    onPress={() => handleQuantityChange(item, 1)}
                    className="bg-orange-500 rounded-full p-2"
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
            <View className="mt-4 pt-4 border-t border-gray-100">
              <View className="bg-gray-100 rounded-xl py-3 px-4 items-center">
                <Text
                  className="text-gray-500 font-medium"
                  style={{ fontFamily: "Poppins-Medium" }}
                >
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
      <View className="bg-white shadow-sm border-b border-gray-100">
        <View className="flex-row items-center justify-between px-6 py-4">
          <TouchableOpacity
            onPress={() => router.back()}
            className="bg-gray-100 rounded-full p-2"
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name="arrow-left"
              size={24}
              color="#374151"
            />
          </TouchableOpacity>

          <View className="flex-1 mx-4">
            <Text
              className="text-xl font-bold text-gray-900 text-center"
              style={{ fontFamily: "Poppins-Bold" }}
              numberOfLines={1}
            >
              {restaurantInfo?.name || restaurantName || "Menu"}
            </Text>
            {restaurantInfo?.location && (
              <Text
                className="text-gray-500 text-sm text-center mt-1"
                style={{ fontFamily: "Poppins-Regular" }}
                numberOfLines={1}
              >
                {restaurantInfo.location}
              </Text>
            )}
          </View>

          {/* Cart Icon */}
          <TouchableOpacity
            onPress={navigateToCart}
            className="bg-orange-500 rounded-full p-2 relative"
            activeOpacity={0.8}
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
              <View className="absolute -top-2 -right-2 bg-red-500 rounded-full min-w-[20px] h-5 items-center justify-center">
                <Text
                  className="text-white text-xs font-bold"
                  style={{ fontFamily: "Poppins-Bold" }}
                >
                  {getCartCount(restaurantId)}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Menu Items */}
      <FlatList
        data={foodItems}
        renderItem={renderFoodItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ paddingVertical: 20 }}
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
          <View className="flex-1 justify-center items-center px-6 py-20">
            <MaterialCommunityIcons name="food-off" size={64} color="#9CA3AF" />
            <Text
              className="text-xl font-bold text-gray-900 mt-4 text-center"
              style={{ fontFamily: "Poppins-Bold" }}
            >
              No Menu Items
            </Text>
            <Text
              className="text-gray-500 mt-2 text-center leading-6"
              style={{ fontFamily: "Poppins-Regular" }}
            >
              This restaurant hasn't added any menu items yet.
            </Text>
          </View>
        )}
      />

      {/* Floating Cart Button (when has items) */}
      {hasCartItems(restaurantId) && (
        <View className="absolute bottom-6 left-6 right-6">
          <TouchableOpacity
            onPress={navigateToCart}
            className="bg-orange-500 rounded-2xl py-4 px-6 flex-row items-center justify-between shadow-lg"
            activeOpacity={0.9}
          >
            <View className="flex-row items-center">
              <MaterialCommunityIcons name="cart" size={24} color="white" />
              <Text
                className="text-white font-bold text-lg ml-3"
                style={{ fontFamily: "Poppins-Bold" }}
              >
                View Cart
              </Text>
            </View>
            <View className="flex-row items-center">
              <Text
                className="text-white font-bold text-lg mr-2"
                style={{ fontFamily: "Poppins-Bold" }}
              >
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

export default UserFoodItemsScreen;
