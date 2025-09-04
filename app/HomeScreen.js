import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  StatusBar,
  ActivityIndicator,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import axios from "../axiosConfig";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import BottomNavigation from "../components/BottomNavigation";
import Toast from "react-native-toast-message";

const HomeScreen = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [featuredRestaurants, setFeaturedRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userId, setUserId] = useState("");
  const [jwtToken, setJwtToken] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Get user data from storage
        const token = await AsyncStorage.getItem("userToken");
        const id = await AsyncStorage.getItem("userId");

        setJwtToken(token);
        setUserId(id);

        // Fetch restaurants data
        const response = await axios.get("/restaurants");
        setRestaurants(response.data);

        // Set featured restaurants (first 3)
        setFeaturedRestaurants(response.data.slice(0, 3));

        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to fetch data");
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  const renderRestaurant = ({ item, index }) => (
    <TouchableOpacity
      className="bg-white rounded-2xl mb-4 shadow-md border border-gray-100 flex-row p-4"
      onPress={() =>
        router.push(
          `/UserFoodItemsScreen?restaurantId=${item.restaurant_id}&userId=${userId}`
        )
      }
    >
      <Image
        source={{
          uri: item.restaurant_image || "https://via.placeholder.com/150",
        }}
        className="w-20 h-20 rounded-xl"
        resizeMode="cover"
      />
      <View className="flex-1 ml-4">
        <Text
          className="font-playfair-bold text-lg text-gray-800 mb-1"
          numberOfLines={2}
        >
          {item.restaurant_name}
        </Text>
        <View className="flex-row items-center mb-2">
          <View className="flex-row items-center mr-4">
            <MaterialCommunityIcons name="star" size={16} color="#FFD700" />
            <Text className="font-poppins-medium text-sm text-gray-700 ml-1">
              4.5
            </Text>
          </View>
          <View className="flex-row items-center flex-1">
            <MaterialCommunityIcons
              name="map-marker"
              size={16}
              color="#666666"
            />
            <Text
              className="font-poppins text-xs text-gray-600 ml-1 flex-1"
              numberOfLines={1}
            >
              {item.restaurant_location}
            </Text>
          </View>
        </View>
        <View className="flex-row">
          <View className="bg-orange-50 px-2 py-1 rounded-full mr-2">
            <Text className="font-poppins text-xs text-orange-600">
              Popular
            </Text>
          </View>
          <View className="bg-green-50 px-2 py-1 rounded-full">
            <Text className="font-poppins text-xs text-green-600">
              Fast Delivery
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderFeaturedRestaurant = ({ item, index }) => (
    <TouchableOpacity
      className="relative w-72 h-48 rounded-2xl overflow-hidden mr-4 shadow-lg"
      onPress={() =>
        router.push(
          `/UserFoodItemsScreen?restaurantId=${item.restaurant_id}&userId=${userId}`
        )
      }
    >
      <Image
        source={{
          uri: item.restaurant_image || "https://via.placeholder.com/300x200",
        }}
        className="w-full h-full"
        resizeMode="cover"
      />
      <View className="absolute inset-0 bg-black bg-opacity-30 justify-end p-4">
        <Text
          className="font-playfair-bold text-xl text-white mb-2"
          numberOfLines={1}
        >
          {item.restaurant_name}
        </Text>
        <View className="flex-row justify-between items-center">
          <View className="flex-row items-center bg-black bg-opacity-40 px-2 py-1 rounded-full">
            <MaterialCommunityIcons name="star" size={14} color="#FFD700" />
            <Text className="font-poppins-medium text-sm text-white ml-1">
              4.5
            </Text>
          </View>
          <View className="bg-orange-500 px-3 py-1 rounded-full">
            <Text className="font-poppins-bold text-xs text-white">
              Featured
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View className="flex-1 bg-white justify-center items-center">
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View className="items-center">
          <View className="w-20 h-20 bg-orange-50 rounded-full items-center justify-center mb-4">
            <MaterialCommunityIcons
              name="food-fork-drink"
              size={48}
              color="#FF6B00"
            />
          </View>
          <ActivityIndicator size="large" color="#FF6B00" />
          <Text className="font-poppins text-base text-gray-600 mt-4">
            Loading restaurants...
          </Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 bg-white justify-center items-center px-6">
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <MaterialCommunityIcons name="alert-circle" size={64} color="#FF6B00" />
        <Text className="font-poppins text-lg text-gray-800 text-center mt-4">
          {error}
        </Text>
        <TouchableOpacity
          className="bg-orange-500 px-6 py-3 rounded-xl mt-6"
          onPress={() => {
            setLoading(true);
            setError("");
            // Re-fetch data
          }}
        >
          <Text className="font-poppins-bold text-base text-white">Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View className="flex-row justify-between items-center px-5 py-4 bg-white border-b border-gray-100">
        <View>
          <Text className="font-playfair-bold text-2xl text-gray-800">
            Welcome back!
          </Text>
          <Text className="font-poppins text-sm text-gray-600">
            What would you like to eat?
          </Text>
        </View>
        <TouchableOpacity
          className="w-12 h-12 bg-orange-50 rounded-full items-center justify-center"
          onPress={() => router.push("/AccountScreen")}
        >
          <MaterialCommunityIcons
            name="account-circle"
            size={32}
            color="#FF6B00"
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {/* Featured Section */}
        {featuredRestaurants.length > 0 && (
          <View className="py-6">
            <Text className="font-playfair-bold text-xl text-gray-800 px-5 mb-4">
              Featured Restaurants
            </Text>
            <FlatList
              data={featuredRestaurants}
              renderItem={renderFeaturedRestaurant}
              keyExtractor={(item) => `featured-${item.restaurant_id}`}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingLeft: 20 }}
            />
          </View>
        )}

        {/* All Restaurants Section */}
        <View className="px-5 pb-6">
          <Text className="font-playfair-bold text-xl text-gray-800 mb-4">
            All Restaurants
          </Text>
          <FlatList
            data={restaurants}
            renderItem={renderRestaurant}
            keyExtractor={(item) => item.restaurant_id.toString()}
            scrollEnabled={false}
          />
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomNavigation userRole="user" />
      <Toast />
    </SafeAreaView>
  );
};

export default HomeScreen;
