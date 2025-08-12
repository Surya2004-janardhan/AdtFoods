import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import CONFIG from "../config";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import LottieView from "lottie-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";
import { useCart } from "./CartContext";
import { theme } from "./modernTheme";

const HomeScreen = ({ route }) => {
  const { jwtToken } = route.params || {};
  const { totalCount } = useCart(); // Get cart count from context

  // Extract userId from JWT token
  const userId = React.useMemo(() => {
    if (jwtToken) {
      try {
        const payload = JSON.parse(atob(jwtToken.split(".")[1]));
        return payload.user_id;
      } catch (error) {
        console.error("Error decoding JWT:", error);
        return null;
      }
    }
    return null;
  }, [jwtToken]);
  const [restaurants, setRestaurants] = useState([]);
  const [featuredRestaurants, setFeaturedRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigation = useNavigation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollViewRef = React.useRef(null);
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  // console.log(userId,deviceToken)

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const response = await fetch(`${CONFIG.API_BASE_URL}/restaurants`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(jwtToken ? { Authorization: `Bearer ${jwtToken}` } : {}),
          },
        });
        if (!response.ok) {
          throw new Error("Failed to fetch restaurants");
        }
        let data = await response.json();
        // console.log(data);
        // Map backend fields to frontend expected fields
        data = data.map((item) => ({
          ...item,
          restaurant_name: item.restaurant_name || item.name,
          restaurant_image: item.restaurant_image || item.image,
          restaurant_location: item.restaurant_location || item.address,
        }));
        setRestaurants(data);
        setFeaturedRestaurants(data.slice(0, 5));
        const uniqueLocations = [
          ...new Set(data.map((restaurant) => restaurant.restaurant_location)),
        ];
        setLocations(uniqueLocations);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching restaurants:", error);
        console.log("JWT Token:", jwtToken ? "Present" : "Missing");
        console.log("API URL:", `${CONFIG.API_BASE_URL}/restaurants`);
        setError("Failed to fetch data");
        setLoading(false);
      }
    };
    fetchRestaurants();
  }, [jwtToken]);

  useEffect(() => {
    const autoScroll = setInterval(() => {
      if (featuredRestaurants.length > 0) {
        const nextIndex = (currentIndex + 1) % featuredRestaurants.length;
        setCurrentIndex(nextIndex);
        scrollViewRef.current?.scrollTo({
          x: nextIndex * 400, // Adjust this value based on your card width + margin
          animated: true,
        });
      }
    }, 3000); // Change slide every 3 seconds

    return () => clearInterval(autoScroll);
  }, [currentIndex, featuredRestaurants]);
  const LoadingComponent = () => (
    <View style={styles.loaderContainer}>
      <View style={styles.loaderCircle}>
        <LottieView
          source={require("../assets/rocket.json")}
          autoPlay
          loop
          style={{ width: 620, height: 420 }} // Adjust the Lottie size as needed
        />
      </View>
    </View>
  );
  const handleLogout = async () => {
    try {
      // Show toast first
      Toast.show({
        type: "success",
        text1: "Logged out Successfully",
        text2: "You have been logged out safely",
        position: "top",
        visibilityTime: 1000,
      });

      // Remove JWT from AsyncStorage
      await AsyncStorage.removeItem("jwtToken");

      // Small delay to show toast before navigation
      setTimeout(() => {
        navigation.reset({
          index: 0,
          routes: [{ name: "Login" }],
        });
      }, 800);
    } catch (error) {
      console.error("Logout error:", error);
      Toast.show({
        type: "error",
        text1: "Logout Failed",
        text2: "Please try again",
        position: "top",
      });
    }
  };

  if (loading) {
    return <LoadingComponent />;
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.mainContainer}>
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section with Orange Background */}
        <View style={styles.heroSection}>
          <Text style={styles.title}>AdityaFoods</Text>
          <Text style={styles.subtitle}>
            Delicious food delivered to your door
          </Text>
        </View>

        {/* Featured Restaurants Section */}
        <Text style={styles.sectionTitle}>Featured</Text>
        <ScrollView
          ref={scrollViewRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          pagingEnabled
          style={styles.featuredContainer}
          onMomentumScrollEnd={(event) => {
            const newIndex = Math.round(
              event.nativeEvent.contentOffset.x / 360
            );
            setCurrentIndex(newIndex);
          }}
        >
          {featuredRestaurants.map((item, index) => (
            <TouchableOpacity
              key={item._id?.toString() ?? index.toString()}
              style={styles.featuredCard}
              onPress={() =>
                navigation.navigate("UserFoodItemsScreen", {
                  restaurantId: item.restaurant_id,
                  userId: userId,
                  jwtToken,
                })
              }
            >
              <Image
                source={{ uri: item.restaurant_image }}
                style={styles.featuredImage}
              />
              <View style={styles.featuredContent}>
                <View style={styles.featuredDetails}>
                  <Text style={styles.featuredName} numberOfLines={2}>
                    {item.restaurant_name}
                  </Text>
                  <View style={styles.featuredFooter}>
                    <View style={styles.featuredRating}>
                      <Text style={styles.ratingText}>4.5</Text>
                      <Text style={styles.starIcon}>⭐</Text>
                    </View>
                    <View style={styles.featuredTag}>
                      <Text style={styles.tagText}>Featured</Text>
                    </View>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Pagination dots */}
        <View style={styles.paginationDots}>
          {featuredRestaurants.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                {
                  backgroundColor:
                    currentIndex === index
                      ? theme.colors.primary
                      : theme.colors.gray300,
                },
              ]}
            />
          ))}
        </View>

        {/* Location Section */}
        <Text style={styles.sectionTitle}>Locations</Text>
        <View style={styles.locationSection}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.locationScrollContent}
          >
            <TouchableOpacity
              style={[
                styles.locationCard,
                !selectedLocation && styles.selectedLocationCard,
              ]}
              onPress={() => setSelectedLocation(null)}
            >
              <Text style={styles.locationIcon}>🌎</Text>
              <Text style={styles.locationName}>All Locations</Text>
            </TouchableOpacity>
            {locations.map((location, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.locationCard,
                  selectedLocation === location && styles.selectedLocationCard,
                ]}
                onPress={() => setSelectedLocation(location)}
              >
                <Text style={styles.locationIcon}>📍</Text>
                <Text
                  style={[
                    styles.locationName,
                    selectedLocation === location &&
                      styles.selectedLocationName,
                  ]}
                >
                  {location}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <Text style={styles.sectionTitle}>Restaurants</Text>

        {/* Restaurant List - New Card Design */}
        <View style={styles.restaurantList}>
          {(selectedLocation
            ? restaurants.filter(
                (r) => r.restaurant_location === selectedLocation
              )
            : restaurants
          ).map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.card}
              onPress={() =>
                navigation.navigate("UserFoodItemsScreen", {
                  restaurantId: item.restaurant_id,
                  userId: userId,
                  jwtToken,
                })
              }
            >
              <Image
                source={{ uri: item.restaurant_image }}
                style={styles.image}
              />
              <View style={styles.cardContent}>
                <View style={styles.headerContainer}>
                  <Text style={styles.restaurantName}>
                    {item.restaurant_name}
                  </Text>
                  <View style={styles.ratingContainer}>
                    <Text style={styles.ratingText}>4.5</Text>
                    <Text style={styles.starIcon}>⭐</Text>
                  </View>
                </View>

                <View style={styles.infoContainer}>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoIcon}>📍</Text>
                    <Text style={styles.infoText}>
                      {item.restaurant_location}
                    </Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoIcon}>⏰</Text>
                    <Text style={styles.infoText}>30-40 min</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoIcon}>🕒</Text>
                    <Text style={styles.infoText}>Open 24/7</Text>
                  </View>
                </View>

                <View style={styles.tagContainer}>
                  <View style={styles.tag}>
                    <Text style={styles.tagText}>Popular</Text>
                  </View>
                  <View style={styles.tag}>
                    <Text style={styles.tagText}>Trending</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Add padding at bottom for navbar */}
        <View style={{ height: 80 }} />
      </ScrollView>

      {/* Navbar - Outside ScrollView to stay fixed */}
      <View style={styles.navbar}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate("Orders", { jwtToken })}
        >
          <View style={styles.icon}>
            <Text style={styles.iconText}>📝</Text>
          </View>
          <Text style={styles.navText}>Orders</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => {
            console.log("=== CART BUTTON PRESSED ===");
            console.log("Cart pressed, userId:", userId);
            console.log("jwtToken present:", jwtToken ? true : false);
            console.log("Navigation object:", navigation);
            console.log("About to navigate to Checkout with params:", {
              userId,
              jwtToken: jwtToken ? "present" : "missing",
              restaurantId: "all",
            });

            try {
              // First test if navigation works at all
              console.log("Testing navigation...");

              // Test navigation to Orders first (we know this works)
              // navigation.navigate("Orders", { jwtToken });
              // console.log("Orders navigation would work");

              // Now try Checkout
              navigation.navigate("Checkout", {
                userId,
                jwtToken,
                restaurantId: "all",
              });
              console.log("Navigation to Checkout successful");
            } catch (error) {
              console.error("Navigation error:", error);

              // Try alternative approach
              try {
                console.log("Trying alternative navigation...");
                navigation.push("Checkout", {
                  userId,
                  jwtToken,
                  restaurantId: "all",
                });
              } catch (altError) {
                console.error("Alternative navigation also failed:", altError);
              }
            }
          }}
        >
          <View style={styles.icon}>
            <Text style={styles.iconText}>🛒</Text>
            {totalCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{totalCount}</Text>
              </View>
            )}
          </View>
          <Text style={styles.navText}>Cart</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate("AccountScreen", { jwtToken })}
        >
          <View style={styles.icon}>
            <Text style={styles.iconText}>👤</Text>
          </View>
          <Text style={styles.navText}>Account</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={handleLogout}>
          <View style={styles.icon}>
            <Text style={styles.iconText}>🚪</Text>
          </View>
          <Text style={styles.navText}>Logout</Text>
        </TouchableOpacity>
      </View>
      <Toast />
    </View>
  );
};

// Styles - Black & White centric
const styles = StyleSheet.create({
  // Loading Components
  loaderContainer: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  loaderCircle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: theme.colors.white,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    ...theme.shadows.xl,
  },

  // Main Layout
  mainContainer: { flex: 1, backgroundColor: theme.colors.background },
  scrollContainer: { flex: 1 },
  scrollContentContainer: {
    paddingBottom: 100,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
  },

  // Header
  title: {
    fontSize: theme.fonts.sizes.hero,
    fontWeight: theme.fonts.weights.black,
    color: theme.colors.textPrimary,
    letterSpacing: -1,
    marginBottom: theme.spacing.xl,
  },

  // Featured horizontal cards
  featuredContainer: { height: 280, marginBottom: theme.spacing.xl },
  featuredCard: {
    width: 260,
    height: 260,
    marginRight: theme.spacing.lg,
    borderRadius: theme.borderRadius.xxxl,
    backgroundColor: theme.colors.white,
    overflow: "hidden",
    ...theme.shadows.lg,
  },
  featuredImage: { width: "100%", height: 160 },
  featuredContent: { padding: theme.spacing.lg },
  featuredName: {
    fontSize: theme.fonts.sizes.xl,
    fontWeight: theme.fonts.weights.bold,
    color: theme.colors.textPrimary,
  },
  featuredFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: theme.spacing.md,
  },
  featuredRating: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.black,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
  },
  ratingText: {
    color: theme.colors.white,
    fontWeight: theme.fonts.weights.bold,
  },
  starIcon: { color: theme.colors.white },
  featuredTag: {
    backgroundColor: theme.colors.textPrimary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
  },
  tagText: { color: theme.colors.white, fontWeight: theme.fonts.weights.bold },

  // Locations as pills
  locationSection: { marginBottom: theme.spacing.xl },
  locationScrollContent: { paddingVertical: theme.spacing.md },
  locationCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.gray100,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.full,
    marginRight: theme.spacing.md,
  },
  selectedLocationCard: { backgroundColor: theme.colors.black },
  locationIcon: {
    fontSize: theme.fonts.sizes.lg,
    marginRight: theme.spacing.sm,
  },
  locationName: {
    fontSize: theme.fonts.sizes.md,
    fontWeight: theme.fonts.weights.semibold,
    color: theme.colors.textPrimary,
  },
  selectedLocationName: { color: theme.colors.white },

  // Restaurant cards
  restaurantList: { marginTop: theme.spacing.lg },
  card: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.xxl,
    marginBottom: theme.spacing.lg,
    overflow: "hidden",
    ...theme.shadows.md,
  },
  image: { width: "100%", height: 190 },
  cardContent: { padding: theme.spacing.lg },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: theme.spacing.md,
  },
  restaurantName: {
    fontSize: theme.fonts.sizes.xl,
    fontWeight: theme.fonts.weights.bold,
    color: theme.colors.textPrimary,
    flex: 1,
    marginRight: theme.spacing.md,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.black,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
  },
  infoContainer: { marginBottom: theme.spacing.md },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.sm,
  },
  infoIcon: {
    fontSize: theme.fonts.sizes.md,
    marginRight: theme.spacing.sm,
  },
  infoText: {
    fontSize: theme.fonts.sizes.md,
    color: theme.colors.textSecondary,
    fontWeight: theme.fonts.weights.medium,
  },
  tagContainer: { flexDirection: "row", gap: theme.spacing.sm },
  tag: {
    backgroundColor: theme.colors.textPrimary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
  },

  // Navbar (floating white)
  navbar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: theme.colors.white,
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.xxl,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    ...theme.shadows.xl,
  },
  navItem: { alignItems: "center", padding: theme.spacing.sm },
  icon: {
    width: 48,
    height: 48,
    backgroundColor: theme.colors.gray100,
    borderRadius: theme.borderRadius.xl,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: theme.spacing.xs,
  },
  iconText: {
    fontSize: theme.fonts.sizes.xl,
    color: theme.colors.textSecondary,
  },
  navText: {
    color: theme.colors.textSecondary,
    fontSize: theme.fonts.sizes.xs,
    fontWeight: theme.fonts.weights.medium,
  },
  cartBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: theme.colors.error,
    borderRadius: theme.borderRadius.full,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: theme.colors.white,
  },
  cartBadgeText: {
    color: theme.colors.white,
    fontSize: theme.fonts.sizes.xs,
    fontWeight: theme.fonts.weights.bold,
  },

  // Error
  container: {
    flex: 1,
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.background,
    justifyContent: "center",
    alignItems: "center",
  },
  error: {
    color: theme.colors.error,
    fontSize: theme.fonts.sizes.lg,
    textAlign: "center",
    fontWeight: theme.fonts.weights.medium,
  },
});
export default HomeScreen;
