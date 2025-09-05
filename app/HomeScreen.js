import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StatusBar,
  ActivityIndicator,
  ScrollView,
  SafeAreaView,
  RefreshControl,
  Dimensions,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import FoodContext from "../context/FoodContext";
import AuthContext from "../context/AuthContext";
import BottomNavigation from "../components/BottomNavigation";
import Toast from "react-native-toast-message";

const { width } = Dimensions.get("window");

const HomeScreen = () => {
  const { restaurants, loading, fetchRestaurants, getFoodItemsByRestaurant } =
    useContext(FoodContext);
  const { user } = useContext(AuthContext);
  const [error, setError] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [userRole, setUserRole] = useState("user");
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredRestaurants, setFilteredRestaurants] = useState([]);
  const [restaurantMenus, setRestaurantMenus] = useState({});
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const role = (await AsyncStorage.getItem("userRole")) || "user";
        setUserRole(role);

        // Fetch restaurants using context
        const result = await fetchRestaurants();

        if (!result.success && result.error) {
          setError(result.error);
          Toast.show({
            type: "error",
            text1: "Error",
            text2: result.error,
          });
        } else if (result.success) {
          // Fetch menu items for each restaurant
          await fetchMenusForRestaurants(result.data || restaurants);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load data");
      }
    };

    fetchInitialData();
  }, []);

  // Keyboard visibility handling
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      () => {
        setKeyboardVisible(true);
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        setKeyboardVisible(false);
      }
    );

    return () => {
      keyboardDidHideListener?.remove();
      keyboardDidShowListener?.remove();
    };
  }, []);

  // Filter restaurants based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredRestaurants(restaurants);
    } else {
      const filtered = restaurants.filter(
        (restaurant) =>
          restaurant.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          restaurant.cuisine
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          restaurant.location?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredRestaurants(filtered);
    }
  }, [searchQuery, restaurants]);

  // Fetch menu items for restaurants
  const fetchMenusForRestaurants = async (restaurantList) => {
    const menus = {};
    for (const restaurant of restaurantList) {
      try {
        const menuResult = await getFoodItemsByRestaurant(restaurant._id);
        if (menuResult.success) {
          menus[restaurant._id] = menuResult.data.slice(0, 1); // Only show first item
        }
      } catch (error) {
        console.error(`Error fetching menu for ${restaurant.name}:`, error);
      }
    }
    setRestaurantMenus(menus);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const result = await fetchRestaurants();
      if (!result.success && result.error) {
        Toast.show({
          type: "error",
          text1: "Refresh Failed",
          text2: result.error,
        });
      }
    } catch (err) {
      console.error("Refresh error:", err);
    } finally {
      setRefreshing(false);
    }
  };

  const handleBrowseMenu = (restaurant) => {
    router.push({
      pathname: "/UserFoodItemsScreen",
      params: {
        restaurantId: restaurant._id,
        restaurantName: restaurant.name,
      },
    });
  };

  const renderRestaurantCard = ({ item, index }) => (
    <View className="bg-white rounded-2xl mx-4 mb-6 overflow-hidden shadow-lg border border-gray-100">
      {/* Restaurant Header */}
      <View className="bg-gradient-to-r from-orange-400 to-red-500 px-6 py-8">
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text
              className="text-3xl font-bold text-white mb-2"
              style={{ fontFamily: "Poppins-Bold" }}
              numberOfLines={2}
            >
              {item.name}
            </Text>
            <View className="flex-row items-center">
              <MaterialCommunityIcons
                name="map-marker"
                size={16}
                color="rgba(255,255,255,0.9)"
              />
              <Text
                className="text-white/90 ml-2 text-base"
                style={{ fontFamily: "Poppins-Regular" }}
                numberOfLines={1}
              >
                {item.location || "Location not available"}
              </Text>
            </View>
          </View>
          <View className="bg-white/20 rounded-full p-4">
            <MaterialCommunityIcons name="store" size={32} color="white" />
          </View>
        </View>
      </View>

      {/* Restaurant Details */}
      <View className="p-6">
        {/* Stats Row */}
        <View className="flex-row justify-between items-center mb-6">
          <View className="flex-row items-center">
            <View className="bg-green-100 rounded-full p-2 mr-3">
              <MaterialCommunityIcons name="star" size={20} color="#10B981" />
            </View>
            <View>
              <Text
                className="text-gray-900 font-semibold text-lg"
                style={{ fontFamily: "Poppins-SemiBold" }}
              >
                {item.rating || "4.5"}
              </Text>
              <Text
                className="text-gray-500 text-xs"
                style={{ fontFamily: "Poppins-Regular" }}
              >
                Rating
              </Text>
            </View>
          </View>

          {/* <View className="flex-row items-center">
            <View className="bg-blue-100 rounded-full p-2 mr-3">
              <MaterialCommunityIcons
                name="clock-outline"
                size={20}
                color="#3B82F6"
              />
            </View>
            <View>
              <Text
                className="text-gray-900 font-semibold text-lg"
                style={{ fontFamily: "Poppins-SemiBold" }}
              >
                {item.deliveryTime || "30-45"}
              </Text>
              <Text
                className="text-gray-500 text-xs"
                style={{ fontFamily: "Poppins-Regular" }}
              >
                Minutes
              </Text>
            </View>
          </View> */}

          <View className="flex-row items-center">
            <View className="bg-orange-100 rounded-full p-2 mr-3">
              <MaterialCommunityIcons name="food" size={20} color="#F97316" />
            </View>
            <View>
              <Text
                className="text-gray-900 font-semibold text-lg"
                style={{ fontFamily: "Poppins-SemiBold" }}
              >
                {item.cuisine || "Multi"}
              </Text>
              <Text
                className="text-gray-500 text-xs"
                style={{ fontFamily: "Poppins-Regular" }}
              >
                Cuisine
              </Text>
            </View>
          </View>
        </View>

        {/* Description */}
        {item.description && (
          <Text
            className="text-gray-600 text-sm mb-6 leading-5"
            style={{ fontFamily: "Poppins-Regular" }}
            numberOfLines={2}
          >
            {item.description}
          </Text>
        )}

        {/* Menu Preview */}
        {restaurantMenus[item._id] && restaurantMenus[item._id].length > 0 && (
          <View className="mb-6">
            <Text
              className="text-gray-900 font-semibold text-xl mb-3"
              style={{ fontFamily: "Poppins-SemiBold" }}
            >
              Popular Items
            </Text>
            <View className="space-y-2">
              {restaurantMenus[item._id].map((menuItem, idx) => (
                <View
                  key={idx}
                  className="flex-row items-center justify-between bg-gray-50 rounded-lg p-3"
                >
                  <View className="flex-1">
                    <Text
                      className="text-gray-800 font-medium text-sm"
                      style={{ fontFamily: "Poppins-Medium" }}
                      numberOfLines={1}
                    >
                      {menuItem.name}
                    </Text>
                    <Text
                      className="text-gray-500 text-xs mt-1"
                      style={{ fontFamily: "Poppins-Regular" }}
                      numberOfLines={1}
                    >
                      {menuItem.description || "Delicious food item"}
                    </Text>
                  </View>
                  <Text
                    className="text-orange-600 font-bold text-sm ml-3"
                    style={{ fontFamily: "Poppins-Bold" }}
                  >
                    ₹{menuItem.price}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Browse Menu Button */}
        <TouchableOpacity
          onPress={() => handleBrowseMenu(item)}
          className="bg-orange-500 rounded-2xl py-3 px-4 flex-row items-center justify-center shadow-lg border-2 border-orange-400"
          activeOpacity={0.8}
          style={{
            shadowColor: "#F97316",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
          }}
        >
          <View className="bg-white/20 rounded-full p-2 mr-3">
            <MaterialCommunityIcons
              name="food-fork-drink"
              size={20}
              color="white"
            />
          </View>
          <Text
            className="text-white font-bold text-xl flex-1 text-center"
            style={{ fontFamily: "Poppins-Bold" }}
          >
            🍽️ Browse Menu
          </Text>
          <View className="bg-white/20 rounded-full p-2 ml-3">
            <MaterialCommunityIcons
              name="arrow-right"
              size={20}
              color="white"
            />
          </View>
        </TouchableOpacity>
      </View>

      {/* Floating Badge */}
      {index === 0 && (
        <View className="absolute top-4 left-4 bg-yellow-400 rounded-full px-3 py-1 flex-row items-center">
          <MaterialCommunityIcons name="crown" size={14} color="#92400E" />
          <Text
            className="text-yellow-900 font-bold text-xs ml-1"
            style={{ fontFamily: "Poppins-Bold" }}
          >
            FEATURED
          </Text>
        </View>
      )}
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <StatusBar barStyle="dark-content" backgroundColor="#f9fafb" />
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#F97316" />
          <Text
            className="mt-4 text-gray-600 text-base"
            style={{ fontFamily: "Poppins-Medium" }}
          >
            Loading restaurants...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <SafeAreaView className="flex-1 bg-gray-50">
        <StatusBar barStyle="dark-content" backgroundColor="#f9fafb" />

        {/* Header */}
        <View className="bg-white shadow-sm border-b border-gray-100">
          <View className="px-6 pt-4 pb-6">
            <View className="flex-row items-center justify-between mb-4">
              <View className="flex-1">
                <Text
                  className="text-gray-500 text-3xl mb-1"
                  style={{ fontFamily: "Poppins-Bold", color: "#FF6B00" }}
                >
                  Welcome back,
                </Text>
                <Text
                  className="text-2xl font-bold text-gray-900"
                  style={{ fontFamily: "Poppins-Bold" }}
                  numberOfLines={1}
                >
                  {user?.name || "Foodie"}
                </Text>
              </View>
            </View>

            <View className="flex-row items-center bg-gray-100 rounded-xl px-4 py-2">
              <MaterialCommunityIcons
                name="magnify"
                size={20}
                color="#9CA3AF"
              />
              <TextInput
                className="text-gray-900 ml-3 flex-1"
                style={{ fontFamily: "Poppins-Regular" }}
                placeholder="Search for restaurants..."
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>
        </View>

        {/* Content */}
        {error ? (
          <View className="flex-1 justify-center items-center px-6">
            <MaterialCommunityIcons
              name="alert-circle"
              size={64}
              color="#EF4444"
            />
            <Text
              className="text-xl font-bold text-gray-900 mt-4 text-center"
              style={{ fontFamily: "Poppins-Bold" }}
            >
              Oops! Something went wrong
            </Text>
            <Text
              className="text-gray-500 mt-2 text-center leading-6"
              style={{ fontFamily: "Poppins-Regular" }}
            >
              {error}
            </Text>
            <TouchableOpacity
              onPress={onRefresh}
              className="bg-orange-500 rounded-xl px-6 py-3 mt-6"
              activeOpacity={0.8}
            >
              <Text
                className="text-white font-bold"
                style={{ fontFamily: "Poppins-Bold" }}
              >
                Try Again
              </Text>
            </TouchableOpacity>
          </View>
        ) : filteredRestaurants.length === 0 ? (
          <View className="flex-1 justify-center items-center px-6">
            <MaterialCommunityIcons
              name="magnify-close"
              size={64}
              color="#9CA3AF"
            />
            <Text
              className="text-xl font-bold text-gray-900 mt-4 text-center"
              style={{ fontFamily: "Poppins-Bold" }}
            >
              No restaurants found
            </Text>
            <Text
              className="text-gray-500 mt-2 text-center leading-6"
              style={{ fontFamily: "Poppins-Regular" }}
            >
              {searchQuery.trim()
                ? `No restaurants match "${searchQuery}". Try a different search term.`
                : "No restaurants available in your area right now."}
            </Text>
            {searchQuery.trim() && (
              <TouchableOpacity
                onPress={() => setSearchQuery("")}
                className="bg-orange-500 rounded-xl px-6 py-3 mt-6"
                activeOpacity={0.8}
              >
                <Text
                  className="text-white font-bold"
                  style={{ fontFamily: "Poppins-Bold" }}
                >
                  Clear Search
                </Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <FlatList
            data={filteredRestaurants}
            renderItem={renderRestaurantCard}
            keyExtractor={(item) => item._id}
            contentContainerStyle={{
              paddingVertical: 20,
              paddingBottom: keyboardVisible ? 0 : 100,
            }}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={["#F97316"]}
                tintColor="#F97316"
              />
            }
          />
        )}

        {!keyboardVisible && <BottomNavigation userRole={userRole} />}
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

export default HomeScreen;
