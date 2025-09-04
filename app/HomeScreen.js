import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  FlatList,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import axios from "../axiosConfig";
import { useRouter } from "expo-router";

const HomeScreen = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const response = await axios.get("/restaurants");
        setRestaurants(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching restaurants:", error);
        setError("Failed to fetch data");
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  const handleNavigate = (screen) => {
    router.push(`/${screen}`);
  };

  const handleLogout = () => {
    global.userProfile = null;
    router.push("/AuthScreen");
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-accent-cream">
        <ActivityIndicator size="large" color="#FF6B00" />
        <Text className="mt-4 text-secondary font-['Poppins'] text-lg">
          Loading restaurants...
        </Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-accent-cream p-5">
        <MaterialIcons name="error-outline" size={64} color="#FF6B00" />
        <Text className="text-secondary font-['Poppins-Bold'] text-lg mt-4">
          {error}
        </Text>
        <TouchableOpacity
          className="mt-6 bg-primary rounded-full py-3 px-8"
          onPress={() => fetchRestaurants()}
        >
          <Text className="text-white font-['Poppins'] text-base">
            Try Again
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-accent-cream">
      <StatusBar barStyle="dark-content" backgroundColor="#FFF8EE" />

      {/* Header */}
      <View className="px-6 pt-14 pb-4 bg-primary">
        <Text className="font-['PlayfairDisplay-Bold'] text-3xl text-white text-center">
          ADITYA FOODS
        </Text>
        <Text className="font-['Poppins'] text-base text-accent-off text-center mt-1">
          Discover the best restaurants near you
        </Text>
      </View>

      <FlatList
        data={restaurants}
        keyExtractor={(item) => item._id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            className="mx-5 my-3 bg-white rounded-xl overflow-hidden shadow-lg"
            onPress={() => handleNavigate("UserFoodItemsScreen")}
            activeOpacity={0.7}
          >
            <Image
              source={{ uri: item.image }}
              className="w-full h-40"
              resizeMode="cover"
            />
            <View className="p-4 border-l-4 border-primary">
              <Text className="font-['PlayfairDisplay-Bold'] text-xl text-secondary">
                {item.name}
              </Text>
              <View className="flex-row items-center mt-2">
                <Feather name="map-pin" size={16} color="#FF6B00" />
                <Text className="font-['Poppins'] text-secondary-light ml-2">
                  {item.address}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={{ paddingBottom: 90, paddingTop: 10 }}
      />

      {/* <FlatList
        data={restaurants}
        // keyExtractor={(item) => item.id.toString()}
        keyExtractor={(item, index) =>
          item._id?.toString?.() ?? index.toString()
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => handleNavigate("UserFoodItemsScreen")} // ✅ Match file name in `/app`
          >
            <Image source={{ uri: item.image_url }} style={styles.image} />
            <View style={styles.cardContent}>
              <Text style={styles.restaurantName}>{item.restaurant_name}</Text>
              <Text style={styles.location}>{item.location}</Text>
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.listContainer}
      /> */}
      {/* Bottom Navigation */}
      <View className="absolute bottom-0 left-0 right-0 bg-secondary rounded-t-2xl shadow-xl">
        <View className="flex-row justify-around items-center py-4">
          <TouchableOpacity
            className="items-center"
            onPress={() => handleNavigate("OrdersScreen")}
          >
            <View className="w-12 h-12 rounded-full bg-accent-off justify-center items-center mb-1">
              <Feather name="file-text" size={24} color="#FF6B00" />
            </View>
            <Text className="text-accent text-xs font-['Poppins']">Orders</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="items-center"
            onPress={() => handleNavigate("AccountScreen")}
          >
            <View className="w-12 h-12 rounded-full bg-accent-off justify-center items-center mb-1">
              <Feather name="user" size={24} color="#FF6B00" />
            </View>
            <Text className="text-accent text-xs font-['Poppins']">
              Account
            </Text>
          </TouchableOpacity>

          <TouchableOpacity className="items-center" onPress={handleLogout}>
            <View className="w-12 h-12 rounded-full bg-accent-off justify-center items-center mb-1">
              <MaterialIcons name="logout" size={24} color="#FF6B00" />
            </View>
            <Text className="text-accent text-xs font-['Poppins']">Logout</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default HomeScreen;
