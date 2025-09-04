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
  StyleSheet,
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
      style={styles.restaurantCard}
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
        style={styles.restaurantImage}
      />
      <View style={styles.restaurantInfo}>
        <Text style={styles.restaurantName} numberOfLines={2}>
          {item.restaurant_name}
        </Text>
        <View style={styles.restaurantMeta}>
          <View style={styles.ratingContainer}>
            <MaterialCommunityIcons name="star" size={16} color="#FFD700" />
            <Text style={styles.ratingText}>4.5</Text>
          </View>
          <View style={styles.locationContainer}>
            <MaterialCommunityIcons
              name="map-marker"
              size={16}
              color="#666666"
            />
            <Text style={styles.locationText} numberOfLines={1}>
              {item.restaurant_location}
            </Text>
          </View>
        </View>
        <View style={styles.tagsContainer}>
          <View style={styles.tag}>
            <Text style={styles.tagText}>Popular</Text>
          </View>
          <View style={styles.tag}>
            <Text style={styles.tagText}>Fast Delivery</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderFeaturedRestaurant = ({ item, index }) => (
    <TouchableOpacity
      style={styles.featuredCard}
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
        style={styles.featuredImage}
      />
      <View style={styles.featuredOverlay}>
        <Text style={styles.featuredName} numberOfLines={1}>
          {item.restaurant_name}
        </Text>
        <View style={styles.featuredMeta}>
          <View style={styles.featuredRating}>
            <MaterialCommunityIcons name="star" size={14} color="#FFD700" />
            <Text style={styles.featuredRatingText}>4.5</Text>
          </View>
          <Text style={styles.featuredTag}>Featured</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.loadingContent}>
          <View style={styles.loadingIcon}>
            <MaterialCommunityIcons
              name="food-fork-drink"
              size={48}
              color="#FF6B00"
            />
          </View>
          <ActivityIndicator size="large" color="#FF6B00" />
          <Text style={styles.loadingText}>Loading restaurants...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <MaterialCommunityIcons name="alert-circle" size={64} color="#FF6B00" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => {
            setLoading(true);
            setError("");
            // Re-fetch data
          }}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Welcome back!</Text>
          <Text style={styles.subtitleText}>What would you like to eat?</Text>
        </View>
        <TouchableOpacity
          style={styles.profileButton}
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
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Featured Section */}
        {featuredRestaurants.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Featured Restaurants</Text>
            <FlatList
              data={featuredRestaurants}
              renderItem={renderFeaturedRestaurant}
              keyExtractor={(item) => `featured-${item.restaurant_id}`}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.featuredList}
            />
          </View>
        )}

        {/* All Restaurants Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>All Restaurants</Text>
          <FlatList
            data={restaurants}
            renderItem={renderRestaurant}
            keyExtractor={(item) => item.restaurant_id.toString()}
            scrollEnabled={false}
            contentContainerStyle={styles.restaurantsList}
          />
        </View>

        {/* Add padding for bottom navigation */}
        <View style={styles.bottomPadding} />
      </ScrollView>

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
  errorContainer: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  errorText: {
    fontFamily: "Poppins",
    fontSize: 16,
    color: "#666666",
    textAlign: "center",
    marginVertical: 16,
  },
  retryButton: {
    backgroundColor: "#FF6B00",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#FFFFFF",
    fontFamily: "Poppins-Bold",
    fontSize: 14,
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
  },
  welcomeText: {
    fontFamily: "PlayfairDisplay-Bold",
    fontSize: 24,
    color: "#333333",
  },
  subtitleText: {
    fontFamily: "Poppins",
    fontSize: 14,
    color: "#666666",
    marginTop: 4,
  },
  profileButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFF8F0",
    justifyContent: "center",
    alignItems: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100, // Space for bottom navigation
  },
  section: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontFamily: "Poppins-Bold",
    fontSize: 18,
    color: "#333333",
    marginBottom: 12,
    marginHorizontal: 20,
  },
  featuredList: {
    paddingHorizontal: 20,
    gap: 16,
  },
  featuredCard: {
    width: 280,
    height: 180,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  featuredImage: {
    width: "100%",
    height: "100%",
  },
  featuredOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  featuredName: {
    fontFamily: "Poppins-Bold",
    fontSize: 16,
    color: "#FFFFFF",
    marginBottom: 4,
  },
  featuredMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  featuredRating: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  featuredRatingText: {
    fontFamily: "Poppins",
    fontSize: 12,
    color: "#FFFFFF",
  },
  featuredTag: {
    backgroundColor: "#FF6B00",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    fontFamily: "Poppins",
    fontSize: 10,
    color: "#FFFFFF",
  },
  restaurantsList: {
    paddingHorizontal: 20,
    gap: 16,
  },
  restaurantCard: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  restaurantImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: "#F0F0F0",
  },
  restaurantInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "space-between",
  },
  restaurantName: {
    fontFamily: "Poppins-Bold",
    fontSize: 16,
    color: "#333333",
    marginBottom: 4,
  },
  restaurantMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 8,
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
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flex: 1,
  },
  locationText: {
    fontFamily: "Poppins",
    fontSize: 12,
    color: "#666666",
    flex: 1,
  },
  tagsContainer: {
    flexDirection: "row",
    gap: 8,
  },
  tag: {
    backgroundColor: "#FFF8F0",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FF6B00",
  },
  tagText: {
    fontFamily: "Poppins",
    fontSize: 10,
    color: "#FF6B00",
  },
  bottomPadding: {
    height: 20,
  },
});

export default HomeScreen;
