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
} from "react-native";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import axios from "../axiosConfig";
import CartContext from "../context/CartContext";

const UserFoodItemsScreen = () => {
  const [foodItems, setFoodItems] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { cartItems, addToCart } = useContext(CartContext);

  const fetchFoodItems = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/food-items");
      const availableItems = response.data.filter((item) => item.available);
      const updatedItems = availableItems.map((item) => ({
        ...item,
        price: parseFloat(item.price),
        quantity: 0,
      }));
      setFoodItems(updatedItems);
    } catch (error) {
      console.error("Error fetching food items:", error.message);
      alert("Failed to fetch food items. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFoodItems();
  }, []);

  useFocusEffect(
    useCallback(() => {
      setFoodItems((prevItems) =>
        prevItems.map((item) => {
          const cartItem = cartItems.find((c) => c.id === item.id);
          return {
            ...item,
            quantity: cartItem ? cartItem.quantity : 0,
          };
        })
      );
    }, [cartItems])
  );

  const updateQuantity = (id, increment) => {
    setFoodItems((prevItems) => {
      const updatedItems = prevItems.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(0, item.quantity + increment) }
          : item
      );

      const updatedItem = updatedItems.find((item) => item.id === id);

      // Always call addToCart to reflect the latest quantity
      addToCart(updatedItem);

      return updatedItems;
    });
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchFoodItems().finally(() => setRefreshing(false));
  }, []);

  const cartQuantity = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const goBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-accent-cream">
        <ActivityIndicator size="large" color="#FF6B00" />
        <Text className="mt-4 text-secondary font-['Poppins'] text-lg">
          Loading menu items...
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-accent-cream">
      <StatusBar barStyle="dark-content" backgroundColor="#FFF8EE" />

      {/* Header */}
      <View className="px-6 pt-14 pb-4 bg-primary">
        <View className="flex-row justify-between items-center">
          <TouchableOpacity onPress={goBack} className="p-2">
            <Feather name="arrow-left" size={24} color="white" />
          </TouchableOpacity>
          <Text className="font-['PlayfairDisplay-Bold'] text-2xl text-white">
            Menu
          </Text>
          <View style={{ width: 24 }} /> {/* Empty view for spacing */}
        </View>
      </View>

      <FlatList
        data={foodItems}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View className="mx-5 my-3 bg-white rounded-xl overflow-hidden shadow-lg">
            <Image
              source={{ uri: item.image }}
              className="w-full h-48"
              resizeMode="cover"
            />

            <View className="p-5">
              <View className="flex-row justify-between items-start">
                <Text className="font-['PlayfairDisplay-Bold'] text-xl text-secondary flex-1 mr-2">
                  {item.name}
                </Text>
                <View className="bg-primary-light rounded-full px-3 py-1">
                  <Text className="font-['Poppins-Bold'] text-white">
                    ₹{item.price.toFixed(2)}
                  </Text>
                </View>
              </View>

              <Text className="font-['Poppins'] text-secondary-light text-sm mt-2 mb-4">
                {item.description}
              </Text>

              <View className="flex-row items-center justify-between mt-2">
                <View className="flex-row items-center border-2 border-primary rounded-lg overflow-hidden">
                  <TouchableOpacity
                    className="px-4 py-2 bg-primary"
                    onPress={() => updateQuantity(item.id, -1)}
                  >
                    <Feather name="minus" size={18} color="white" />
                  </TouchableOpacity>

                  <Text className="px-5 font-['Poppins-Medium'] text-lg">
                    {item.quantity}
                  </Text>

                  <TouchableOpacity
                    className="px-4 py-2 bg-primary"
                    onPress={() => updateQuantity(item.id, 1)}
                  >
                    <Feather name="plus" size={18} color="white" />
                  </TouchableOpacity>
                </View>

                {item.quantity > 0 && (
                  <Text className="font-['Poppins'] text-primary-dark">
                    Total: ₹{(item.price * item.quantity).toFixed(2)}
                  </Text>
                )}
              </View>
            </View>
          </View>
        )}
        contentContainerStyle={{ paddingBottom: 90, paddingTop: 10 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#FF6B00"]}
            tintColor="#FF6B00"
          />
        }
      />

      {/* Bottom Checkout Button */}
      {cartQuantity > 0 && (
        <TouchableOpacity
          className="absolute bottom-5 right-5 left-5 bg-secondary py-4 px-6 rounded-xl flex-row justify-between items-center shadow-lg"
          onPress={() => router.push("/UserCartScreen")}
        >
          <View className="flex-row items-center">
            <View className="bg-primary rounded-full w-8 h-8 items-center justify-center mr-3">
              <Text className="text-white font-['Poppins-Bold']">
                {cartQuantity}
              </Text>
            </View>
            <Text className="text-white font-['Poppins-Medium'] text-base">
              View Cart
            </Text>
          </View>

          <View className="flex-row items-center">
            <Text className="text-white font-['Poppins-Bold'] text-lg mr-2">
              Checkout
            </Text>
            <Feather name="arrow-right" size={20} color="white" />
          </View>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default UserFoodItemsScreen;
