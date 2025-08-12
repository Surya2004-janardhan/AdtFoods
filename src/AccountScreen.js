import React, { useEffect, useState } from "react";
import jwt_decode from "jwt-decode";
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

const AccountScreen = ({ route }) => {
  const { jwtToken } = route.params;
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    if (!jwtToken) return;
    // Decode userId from JWT
    const decoded = jwt_decode(jwtToken);
    setUserId(decoded.user_id);
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
  loaderContainer: {
    flex: 1,
    backgroundColor: "#ff8c00",
    justifyContent: "center",
    alignItems: "center",
    // borderRadius: "70%",
  },
  loaderCircle: {
    width: 200, // Adjust the size of the circle as needed
    height: 200, // Keep width and height the same to create a circle
    borderRadius: 100, // Half of the width/height to make it circular
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden", // Ensures that Lottie stays within the circle
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5, // Android shadow
  },
  container: {
    flex: 1,
    backgroundColor: "#ff8c00",
  },
  headerContainer: {
    alignItems: "center",
    backgroundColor: "#ff8c00",
    paddingVertical: 30,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  profilePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#a0a0a0",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginTop: 10,
  },
  detailsContainer: {
    backgroundColor: "#fff",
    margin: 15,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  detailTextContainer: {
    flex: 1,
    marginLeft: 15,
  },
  detailLabel: {
    fontSize: 14,
    color: "#7f8c8d",
  },
  detailValue: {
    fontSize: 16,
    color: "#2c3e50",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  error: {
    color: "red",
    fontSize: 18,
  },
});

export default AccountScreen;
