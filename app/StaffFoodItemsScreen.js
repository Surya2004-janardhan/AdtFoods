import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  SafeAreaView,
  StyleSheet,
  Switch,
  Image,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import FoodContext from "../context/FoodContext";
import Toast from "react-native-toast-message";

const StaffFoodItemsScreen = () => {
  const { foodItems, loading, fetchFoodItems, updateFoodItemAvailability } =
    useContext(FoodContext);
  const router = useRouter();

  useEffect(() => {
    const loadFoodItems = async () => {
      const result = await fetchFoodItems();
      if (!result.success) {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: result.error,
        });
      }
    };

    loadFoodItems();
  }, []);

  const toggleAvailability = async (itemId) => {
    try {
      const item = foodItems.find((f) => f.id === itemId);
      const newAvailability = !item.available;

      const result = await updateFoodItemAvailability(itemId, newAvailability);

      if (result.success) {
        Toast.show({
          type: "success",
          text1: "Updated",
          text2: `Item ${
            newAvailability ? "enabled" : "disabled"
          } successfully`,
        });
      } else {
        Toast.show({
          type: "error",
          text1: "Error",
          text2: result.error,
        });
      }
    } catch (error) {
      console.error("Error updating availability:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Failed to update item availability",
      });
    }
  };

  const renderFoodItem = ({ item }) => (
    <View style={styles.foodCard}>
      <Image
        source={{ uri: item.food_image || "https://via.placeholder.com/100" }}
        style={styles.foodImage}
      />
      <View style={styles.foodInfo}>
        <View style={styles.foodHeader}>
          <Text style={styles.foodName} numberOfLines={2}>
            {item.food_name}
          </Text>
          <View style={styles.availabilityContainer}>
            <Text style={styles.availabilityLabel}>Available</Text>
            <Switch
              value={item.available}
              onValueChange={() => toggleAvailability(item.id)}
              trackColor={{ false: "#CCCCCC", true: "#FF6B00" }}
              thumbColor={item.available ? "#FFFFFF" : "#FFFFFF"}
            />
          </View>
        </View>

        <Text style={styles.foodCategory}>{item.category}</Text>
        <Text style={styles.foodDescription} numberOfLines={2}>
          {item.food_description}
        </Text>

        <View style={styles.foodFooter}>
          <Text style={styles.price}>₹{item.price}</Text>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => {
              Toast.show({
                type: "info",
                text1: "Edit Item",
                text2: "Edit functionality coming soon",
              });
            }}
          >
            <MaterialCommunityIcons name="pencil" size={16} color="#FF6B00" />
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.loadingContent}>
          <View style={styles.loadingIcon}>
            <MaterialCommunityIcons name="food" size={48} color="#FF6B00" />
          </View>
          <ActivityIndicator size="large" color="#FF6B00" />
          <Text style={styles.loadingText}>Loading menu items...</Text>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Menu Management</Text>
          <Text style={styles.headerSubtitle}>
            Manage food items and availability
          </Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            Toast.show({
              type: "info",
              text1: "Add Item",
              text2: "Add new item functionality coming soon",
            });
          }}
        >
          <MaterialCommunityIcons name="plus" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <MaterialCommunityIcons name="food" size={24} color="#FF6B00" />
          <Text style={styles.statValue}>{foodItems.length}</Text>
          <Text style={styles.statLabel}>Total Items</Text>
        </View>
        <View style={styles.statCard}>
          <MaterialCommunityIcons
            name="check-circle"
            size={24}
            color="#4CAF50"
          />
          <Text style={styles.statValue}>
            {foodItems.filter((item) => item.available).length}
          </Text>
          <Text style={styles.statLabel}>Available</Text>
        </View>
        <View style={styles.statCard}>
          <MaterialCommunityIcons
            name="close-circle"
            size={24}
            color="#FF4444"
          />
          <Text style={styles.statValue}>
            {foodItems.filter((item) => !item.available).length}
          </Text>
          <Text style={styles.statLabel}>Unavailable</Text>
        </View>
      </View>

      {/* Food Items List */}
      <FlatList
        data={foodItems}
        renderItem={renderFoodItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
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
    fontFamily: "Poppins-Bold",
    fontSize: 16,
    color: "#333333",
    marginTop: 8,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    minHeight: 72,
  },
  headerTitle: {
    fontFamily: "Poppins-Bold",
    fontSize: 20,
    color: "#333333",
  },
  headerSubtitle: {
    fontFamily: "Poppins",
    fontSize: 12,
    color: "#666666",
    marginTop: 2,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#FF6B00",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#FF6B00",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  statValue: {
    fontFamily: "Poppins-Bold",
    fontSize: 20,
    color: "#333333",
    marginTop: 8,
  },
  statLabel: {
    fontFamily: "Poppins",
    fontSize: 12,
    color: "#666666",
    marginTop: 4,
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 100, // Space for bottom navigation
  },
  foodCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
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
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: "#F0F0F0",
    marginRight: 16,
  },
  foodInfo: {
    flex: 1,
  },
  foodHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  foodName: {
    fontFamily: "Poppins-Bold",
    fontSize: 16,
    color: "#333333",
    flex: 1,
    marginRight: 12,
  },
  availabilityContainer: {
    alignItems: "center",
    gap: 4,
  },
  availabilityLabel: {
    fontFamily: "Poppins",
    fontSize: 10,
    color: "#666666",
  },
  foodCategory: {
    fontFamily: "Poppins",
    fontSize: 12,
    color: "#FF6B00",
    marginBottom: 4,
  },
  foodDescription: {
    fontFamily: "Poppins",
    fontSize: 12,
    color: "#666666",
    lineHeight: 16,
    marginBottom: 12,
  },
  foodFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  price: {
    fontFamily: "Poppins-Bold",
    fontSize: 16,
    color: "#333333",
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF8F0",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#FF6B00",
    gap: 4,
  },
  editButtonText: {
    fontFamily: "Poppins",
    fontSize: 12,
    color: "#FF6B00",
  },
});

export default StaffFoodItemsScreen;
