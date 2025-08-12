import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Image,
} from "react-native";
import CONFIG from "../config";
import Icon from "react-native-vector-icons/Ionicons";
import LottieView from "lottie-react-native";
import { theme } from "./modernTheme"; // Updated theme import

const AccountScreen = ({ route }) => {
  const { jwtToken } = route.params;
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Extract userId from JWT token using the same logic as other screens
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

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(`${CONFIG.API_BASE_URL}/users/${userId}`, {
          headers: {
            Authorization: `Bearer ${jwtToken}`,
          },
        });
        if (!response.ok) throw new Error("Failed to fetch user data");
        const data = await response.json();
        setUserData(data);
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };
    if (userId && jwtToken) fetchUserData();
  }, [userId, jwtToken]);
  const LoadingComponent = () => (
    <View style={styles.loaderContainer}>
      <View style={styles.loaderCircle}>
        <LottieView
          source={require("../assets/profile.json")}
          autoPlay
          loop
          style={{ width: 720, height: 440 }} // Adjust the Lottie size as needed
        />
      </View>
    </View>
  );
  if (loading) {
    return <LoadingComponent />;
  }

  if (!userData) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>Failed to load user data</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.profilePlaceholder}>
          <Image
            source={{
              uri: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQo_GRCBh9FjvL9md2AkMAFZ3_JpwCTs5ziVw&s",
            }}
            style={{
              width: "100%",
              height: "100%",
              borderRadius: 100, // assumes the parent is a square; otherwise adjust accordingly
            }}
            resizeMode="cover"
          />
        </View>

        <Text style={styles.title}>{userData.user_name}</Text>
      </View>

      <View style={styles.detailsContainer}>
        <View style={styles.detailRow}>
          <Icon name="person-outline" size={24} color="#2c3e50" />
          <View style={styles.detailTextContainer}>
            <Text style={styles.detailLabel}>User ID</Text>
            <Text style={styles.detailValue}>{userData.user_id}</Text>
          </View>
        </View>

        <View style={styles.detailRow}>
          <Icon name="mail-outline" size={24} color="#2c3e50" />
          <View style={styles.detailTextContainer}>
            <Text style={styles.detailLabel}>Email</Text>
            <Text style={styles.detailValue}>
              {userData.email || "Not set"}
            </Text>
          </View>
        </View>

        <View style={styles.detailRow}>
          <Icon name="call-outline" size={24} color="#2c3e50" />
          <View style={styles.detailTextContainer}>
            <Text style={styles.detailLabel}>Phone</Text>
            <Text style={styles.detailValue}>{userData.phone_number}</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  // Loading Components
  loaderContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
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
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  headerContainer: {
    alignItems: "center",
    backgroundColor: theme.colors.background,
    paddingVertical: theme.spacing.xxxl,
    paddingHorizontal: theme.spacing.lg,
  },
  profilePlaceholder: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: theme.colors.white,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: theme.spacing.lg,
    ...theme.shadows.xl,
  },
  title: {
    fontSize: theme.fonts.sizes.display,
    fontWeight: theme.fonts.weights.black,
    color: theme.colors.textPrimary,
    textAlign: "center",
    letterSpacing: -0.5,
  },

  // Details Section
  detailsContainer: {
    backgroundColor: theme.colors.white,
    margin: theme.spacing.lg,
    borderRadius: theme.borderRadius.xl,
    overflow: "hidden",
    ...theme.shadows.xl,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.gray100,
  },
  detailTextContainer: {
    flex: 1,
    marginLeft: theme.spacing.md,
  },
  detailLabel: {
    fontSize: theme.fonts.sizes.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
    fontWeight: theme.fonts.weights.medium,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  detailValue: {
    fontSize: theme.fonts.sizes.lg,
    color: theme.colors.textPrimary,
    fontWeight: theme.fonts.weights.semibold,
    lineHeight: theme.fonts.lineHeights.tight * theme.fonts.sizes.lg,
  },

  // Error State
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.background,
    paddingHorizontal: theme.spacing.xl,
  },
  error: {
    color: theme.colors.error,
    fontSize: theme.fonts.sizes.lg,
    textAlign: "center",
    fontWeight: theme.fonts.weights.medium,
  },
});

export default AccountScreen;
