import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  StatusBar,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import axios from "../axiosConfig";

const StaffFoodItemsScreen = () => {
  const router = useRouter();
  const [foodItems, setFoodItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFoodItems();
  }, []);

  const fetchFoodItems = () => {
    setLoading(true);
    axios
      .get("/food-items")
      .then((response) => {
        setFoodItems(response.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching food items:", error.message);
        Alert.alert("Error", "Failed to load food items. Please try again.");
        setLoading(false);
      });
  };

  const toggleAvailability = (id) => {
    const item = foodItems.find((item) => item.id === id);
    if (item) {
      axios
        .put(`/food-items/${id}`, { available: !item.available })
        .then((response) => {
          setFoodItems((prevItems) =>
            prevItems.map((item) =>
              item.id === id ? { ...item, available: !item.available } : item
            )
          );
        })
        .catch((error) => {
          console.error(
            "Error updating food item availability:",
            error.message
          );
          Alert.alert("Error", "Failed to update item availability.");
        });
    }
  };

  const handleLogout = () => {
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        onPress: () => {
          global.userProfile = null;
          router.replace("/AuthScreen");
        },
        style: "destructive",
      },
    ]);
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-accent-cream">
        <StatusBar barStyle="dark-content" backgroundColor="#FFF8EE" />
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
          <Text className="font-['PlayfairDisplay-Bold'] text-2xl text-white">
            Menu Management
          </Text>
          <TouchableOpacity onPress={fetchFoodItems} className="p-2">
            <Feather name="refresh-cw" size={20} color="white" />
          </TouchableOpacity>
        </View>
        <Text className="font-['Poppins'] text-sm text-accent-off mt-1">
          Staff Control Panel
        </Text>
      </View>

      <FlatList
        data={foodItems}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View className="mx-5 my-3 bg-white rounded-xl overflow-hidden shadow-md">
            <View className="p-4 flex-row">
              <Image
                source={{ uri: item.image_url || item.image }}
                className="w-24 h-24 rounded-lg"
                resizeMode="cover"
                defaultSource={require("../assets/1.png")}
              />

              <View className="flex-1 ml-4">
                <View className="flex-row justify-between">
                  <Text className="font-['PlayfairDisplay-Bold'] text-lg text-secondary flex-1 mr-2">
                    {item.name}
                  </Text>
                  <View className="bg-primary-light/20 rounded-full px-2 py-1">
                    <Text className="font-['Poppins-Bold'] text-sm text-primary">
                      ₹{parseFloat(item.price).toFixed(2)}
                    </Text>
                  </View>
                </View>

                <Text
                  className="font-['Poppins'] text-secondary-light text-xs mt-1"
                  numberOfLines={2}
                >
                  {item.description}
                </Text>

                <TouchableOpacity
                  onPress={() => toggleAvailability(item.id)}
                  className={`mt-3 py-2 px-3 rounded-lg ${
                    item.available ? "bg-green-100" : "bg-red-100"
                  }`}
                >
                  <View className="flex-row items-center">
                    <MaterialIcons
                      name={item.available ? "check-circle" : "cancel"}
                      size={16}
                      color={item.available ? "#22C55E" : "#EF4444"}
                    />
                    <Text
                      className={`font-['Poppins-Medium'] text-sm ml-1 ${
                        item.available ? "text-green-700" : "text-red-700"
                      }`}
                    >
                      {item.available ? "Available" : "Not Available"}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            <View className="flex-row border-t border-gray-100">
              <TouchableOpacity className="flex-1 py-2 border-r border-gray-100 items-center">
                <Text className="font-['Poppins'] text-primary text-sm">
                  Edit
                </Text>
              </TouchableOpacity>
              <TouchableOpacity className="flex-1 py-2 items-center">
                <Text className="font-['Poppins'] text-red-500 text-sm">
                  Delete
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListHeaderComponent={
          <View className="mx-5 my-3">
            <TouchableOpacity className="bg-primary py-3 rounded-xl flex-row justify-center items-center">
              <Feather
                name="plus-circle"
                size={18}
                color="white"
                className="mr-2"
              />
              <Text className="font-['Poppins-Bold'] text-white text-base">
                Add New Item
              </Text>
            </TouchableOpacity>
          </View>
        }
        contentContainerStyle={{ paddingBottom: 90, paddingTop: 10 }}
        ListEmptyComponent={
          <View className="items-center justify-center p-8 mt-10">
            <MaterialIcons name="restaurant-menu" size={64} color="#CCCCCC" />
            <Text className="font-['PlayfairDisplay-Bold'] text-xl text-secondary mt-4 text-center">
              No Menu Items
            </Text>
            <Text className="font-['Poppins'] text-secondary-light text-center mt-2">
              Add new items to your menu
            </Text>
          </View>
        }
      />

      {/* Bottom Navigation */}
      <View className="absolute bottom-0 left-0 right-0 bg-secondary rounded-t-2xl shadow-xl">
        <View className="flex-row justify-around items-center py-4">
          <TouchableOpacity className="items-center opacity-50">
            <View className="w-12 h-12 rounded-full bg-accent-off justify-center items-center mb-1">
              <Feather name="menu" size={24} color="#FF6B00" />
            </View>
            <Text className="text-accent text-xs font-['Poppins']">Menu</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="items-center"
            onPress={() => router.push("/StaffOrdersScreen")}
          >
            <View className="w-12 h-12 rounded-full bg-accent-off justify-center items-center mb-1">
              <Feather name="clipboard" size={24} color="#FF6B00" />
            </View>
            <Text className="text-accent text-xs font-['Poppins']">Orders</Text>
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

export default StaffFoodItemsScreen;
