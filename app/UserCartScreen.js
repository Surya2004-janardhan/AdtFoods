import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Alert,
  Image,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import CartContext from "../context/CartContext";
import OrdersContext from "../context/OrdersContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "../axiosConfig";

const UserCartScreen = () => {
  const {
    cartItems,
    updateQuantity,
    calculateTotal,
    clearCart,
    removeFromCart,
  } = useContext(CartContext);
  const { addOrder } = useContext(OrdersContext);
  const [userProfile, setUserProfile] = useState({});
  const [userToken, setUserToken] = useState("");
  const [foodItems, setFoodItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const profileData = await AsyncStorage.getItem("userProfile");
        if (profileData) {
          const parsedProfile = JSON.parse(profileData);
          setUserProfile({
            userId: parsedProfile.id || null,
            name: parsedProfile.name || "Anonymous",
            email: parsedProfile.email || "user@example.com",
            phone: parsedProfile.phone || "0000000000",
          });
        }
      } catch (error) {
        console.error("Error retrieving user profile:", error);
      }
    };

    const fetchUserToken = async () => {
      try {
        const response = await axios.get("/get-token", {
          params: { user_id: 1 },
        });
        if (response.data.success) {
          setUserToken(response.data.token);
        } else {
          Alert.alert(
            "Failed to Retrieve Token",
            response.data.message || "Please try again later."
          );
        }
      } catch (error) {
        console.error(
          "Error fetching user token:",
          error.response || error.message
        );
        Alert.alert(
          "Error",
          "There was an issue retrieving your token. Please try again."
        );
      }
    };

    const fetchFoodItems = async () => {
      setLoading(true);
      try {
        const response = await axios.get("/food-items");
        const availableItems = response.data.filter(
          (item) => item.available === 1
        );
        const updatedItems = availableItems;

        setFoodItems(updatedItems);

        // Check cart items against available items
        cartItems.forEach((cartItem) => {
          if (!updatedItems.some((item) => item.id === cartItem.id)) {
            removeFromCart(cartItem.id); // Remove unavailable items from the cart
          }
        });
      } catch (error) {
        console.error("Error fetching food items:", error.message);
        Alert.alert(
          "Error",
          "Failed to fetch food items. Please try again later."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
    if (userProfile.userId) fetchUserToken();
    fetchFoodItems();
  }, [userProfile.userId]);

  const increaseQuantity = (itemId) => {
    updateQuantity(
      itemId,
      cartItems.find((item) => item.id === itemId).quantity + 1
    );
  };

  const decreaseQuantity = (itemId) => {
    const item = cartItems.find((item) => item.id === itemId);
    if (item.quantity > 1) {
      updateQuantity(itemId, item.quantity - 1);
    } else {
      removeFromCart(itemId);
    }
  };

  const placeOrder = async () => {
    const newOrder = {
      userEmail: userProfile.email,
      userName: userProfile.name,
      userPhone: userProfile.phone,
      items: cartItems
        .map((item) => `${item.name} x ${item.quantity}`)
        .join(", "),
      totalAmount: calculateTotal(),
      status: "pending",
      userToken: userToken,
      userId: userProfile.userId,
    };

    try {
      const response = await axios.post("/place-order", newOrder);
      if (response.data.success) {
        addOrder({ ...newOrder, id: response.data.orderId });
        Alert.alert("Order Placed", "Thank you for your order!");
        clearCart();
        router.replace("/PaymentScreen");
      } else {
        Alert.alert("Failed to Place Order", "Please try again later.");
      }
    } catch (error) {
      console.error("Error placing order:", error.response || error.message);
      Alert.alert(
        "Error",
        "There was an issue placing your order. Please try again."
      );
    }
  };

  const goBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-accent-cream">
        <ActivityIndicator size="large" color="#FF6B00" />
        <Text className="mt-4 text-secondary font-display text-lg">
          Loading cart...
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
          <Text className="font-serif text-2xl text-white">Your Cart</Text>
          <View style={{ width: 24 }} /> {/* Empty view for spacing */}
        </View>
      </View>

      {cartItems.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <MaterialCommunityIcons
            name="cart-outline"
            size={80}
            color="#FF6B00"
          />
          <Text className="font-serif text-2xl text-secondary mt-6">
            Your cart is empty
          </Text>
          <Text className="font-sans text-secondary-light text-base text-center mt-2 mb-8">
            Add items from the menu to get started
          </Text>
          <TouchableOpacity
            className="bg-primary px-8 py-3 rounded-lg"
            onPress={() => router.replace("/UserFoodItemsScreen")}
          >
            <Text className="font-sans font-bold text-white text-base">
              Browse Menu
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={cartItems}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <View className="mx-5 my-2 bg-white rounded-xl overflow-hidden shadow-md">
                <View className="p-4 flex-row">
                  {item.image && (
                    <Image
                      source={{ uri: item.image }}
                      className="w-20 h-20 rounded-lg"
                      resizeMode="cover"
                    />
                  )}

                  <View className="flex-1 ml-3">
                    <View className="flex-row justify-between items-start">
                      <Text className="font-serif text-lg text-secondary">
                        {item.name}
                      </Text>
                      <TouchableOpacity
                        className="p-1"
                        onPress={() => removeFromCart(item.id)}
                      >
                        <Feather name="x" size={18} color="#FF6B00" />
                      </TouchableOpacity>
                    </View>

                    <Text
                      className="font-sans text-secondary-light text-xs mt-1"
                      numberOfLines={1}
                    >
                      {item.description}
                    </Text>

                    <View className="flex-row justify-between items-center mt-2">
                      <Text className="font-sans font-bold text-primary">
                        ?{item.price.toFixed(2)}
                      </Text>

                      <View className="flex-row items-center border border-gray-200 rounded-lg overflow-hidden">
                        <TouchableOpacity
                          className="px-3 py-1"
                          onPress={() => decreaseQuantity(item.id)}
                        >
                          <Feather name="minus" size={14} color="#FF6B00" />
                        </TouchableOpacity>

                        <Text className="px-3 font-sans font-medium">
                          {item.quantity}
                        </Text>

                        <TouchableOpacity
                          className="px-3 py-1"
                          onPress={() => increaseQuantity(item.id)}
                        >
                          <Feather name="plus" size={14} color="#FF6B00" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </View>

                <View className="bg-primary-light px-4 py-2 items-end">
                  <Text className="font-sans text-white">
                    Subtotal: ?{(item.price * item.quantity).toFixed(2)}
                  </Text>
                </View>
              </View>
            )}
            contentContainerStyle={{ paddingVertical: 10, paddingBottom: 200 }}
          />

          {/* Order Summary */}
          <View className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-xl py-6 px-5">
            <Text className="font-serif text-xl text-secondary mb-4">
              Order Summary
            </Text>

            <View className="flex-row justify-between mb-2">
              <Text className="font-sans text-secondary-light">Subtotal</Text>
              <Text className="font-sans font-medium text-secondary">
                ?{calculateTotal().toFixed(2)}
              </Text>
            </View>

            <View className="flex-row justify-between mb-2">
              <Text className="font-sans text-secondary-light">
                Delivery Fee
              </Text>
              <Text className="font-sans font-medium text-secondary">
                ?30.00
              </Text>
            </View>

            <View className="flex-row justify-between mb-4">
              <Text className="font-sans text-secondary-light">Taxes</Text>
              <Text className="font-sans font-medium text-secondary">
                ?{(calculateTotal() * 0.05).toFixed(2)}
              </Text>
            </View>

            <View className="h-0.5 bg-gray-100 mb-4" />

            <View className="flex-row justify-between mb-6">
              <Text className="font-sans font-bold text-lg text-secondary">
                Total
              </Text>
              <Text className="font-serif text-lg text-primary">
                ?{(calculateTotal() + 30 + calculateTotal() * 0.05).toFixed(2)}
              </Text>
            </View>

            <TouchableOpacity
              className="bg-primary py-4 rounded-xl items-center"
              onPress={placeOrder}
            >
              <Text className="font-sans font-bold text-white text-lg">
                Proceed to Payment
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
};

export default UserCartScreen;
