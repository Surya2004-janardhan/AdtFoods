import React, { useEffect, useState, useContext } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  StyleSheet,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AuthContext from "../context/AuthContext";
import BottomNavigation from "../components/BottomNavigation";
import Toast from "react-native-toast-message";

const AccountScreen = () => {
  const [userProfile, setUserProfile] = useState({});
  const [userRole, setUserRole] = useState("user");
  const [loading, setLoading] = useState(true);
  const { user, logout } = useContext(AuthContext);
  const router = useRouter();

  useEffect(() => {
    const getUserProfile = async () => {
      try {
        setLoading(true);
        const profileData = await AsyncStorage.getItem("userProfile");
        const role = (await AsyncStorage.getItem("userRole")) || "user";
        const userId = await AsyncStorage.getItem("userId");

        setUserRole(role);

        if (profileData) {
          setUserProfile(JSON.parse(profileData));
        } else {
          // Set basic profile data if not available
          setUserProfile({
            user_id: userId,
            user_name: "User",
            email: "user@example.com",
            phone_number: "+91 9999999999",
          });
        }
      } catch (error) {
        console.error("Error retrieving user profile:", error);
        Toast.show({
          type: "error",
          text1: "Error",
          text2: "Failed to load profile data",
        });
      } finally {
        setLoading(false);
      }
    };

    getUserProfile();
  }, []);

  const handleLogout = async () => {
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Log Out",
        style: "destructive",
        onPress: async () => {
          try {
            console.log("Logging out user...");
            const result = await logout();

            if (result.success) {
              Toast.show({
                type: "success",
                text1: "Logged Out",
                text2: "You have been successfully logged out",
              });
              router.replace("/AuthScreen");
            } else {
              throw new Error(result.error);
            }
          } catch (error) {
            console.error("Logout error:", error);
            Toast.show({
              type: "error",
              text1: "Error",
              text2: "Failed to log out. Please try again.",
            });
          }
        },
      },
    ]);
  };

  const ProfileItem = ({ icon, label, value, onPress }) => (
    <TouchableOpacity style={styles.profileItem} onPress={onPress}>
      <View style={styles.profileItemLeft}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons name={icon} size={24} color="#FF6B00" />
        </View>
        <View style={styles.profileItemText}>
          <Text style={styles.profileItemLabel}>{label}</Text>
          <Text style={styles.profileItemValue}>{value}</Text>
        </View>
      </View>
      {onPress && (
        <MaterialCommunityIcons
          name="chevron-right"
          size={24}
          color="#CCCCCC"
        />
      )}
    </TouchableOpacity>
  );

  const MenuButton = ({ icon, title, subtitle, onPress, danger = false }) => (
    <TouchableOpacity
      style={[styles.menuButton, danger && styles.dangerButton]}
      onPress={onPress}
    >
      <View
        style={[styles.menuIconContainer, danger && styles.dangerIconContainer]}
      >
        <MaterialCommunityIcons
          name={icon}
          size={24}
          color={danger ? "#FF4444" : "#FF6B00"}
        />
      </View>
      <View style={styles.menuButtonText}>
        <Text style={[styles.menuButtonTitle, danger && styles.dangerText]}>
          {title}
        </Text>
        {subtitle && <Text style={styles.menuButtonSubtitle}>{subtitle}</Text>}
      </View>
      <MaterialCommunityIcons name="chevron-right" size={24} color="#CCCCCC" />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <View style={styles.loadingContent}>
          <View style={styles.loadingIcon}>
            <MaterialCommunityIcons name="account" size={48} color="#FF6B00" />
          </View>
          <ActivityIndicator size="large" color="#FF6B00" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="#333333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Account</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Profile Card
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <MaterialCommunityIcons
              name="account-circle"
              size={80}
              color="#FF6B00"
            />
          </View>
          <Text style={styles.profileName}>
            {userProfile.user_name || "User"}
          </Text>
          <Text style={styles.profileRole}>
            {userRole === "staff" ? "Staff Member" : "Customer"}
          </Text>
        </View> */}

        {/* Profile Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile Information</Text>
          <View style={styles.sectionContent}>
            <ProfileItem
              icon="account"
              label="User ID"
              value={userProfile.user_id || "N/A"}
            />
            <ProfileItem
              icon="email"
              label="Email"
              value={userProfile.email || "Not provided"}
            />
            <ProfileItem
              icon="phone"
              label="Phone"
              value={userProfile.phone_number || "Not provided"}
            />
          </View>
        </View>

        {/* Menu Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          <View style={styles.sectionContent}>
            <MenuButton
              icon="heart"
              title="Favorites"
              subtitle="Your favorite restaurants"
              onPress={() => {
                Toast.show({
                  type: "info",
                  text1: "Coming Soon",
                  text2: "This feature will be available soon",
                });
              }}
            />
            <MenuButton
              icon="history"
              title="Order History"
              subtitle="View your past orders"
              onPress={() => router.push("/OrdersScreen")}
            />
            <MenuButton
              icon="help-circle"
              title="Help & Support"
              subtitle="Get help and contact support"
              onPress={() => {
                Toast.show({
                  type: "info",
                  text1: "Coming Soon",
                  text2: "Support feature will be available soon",
                });
              }}
            />
            <MenuButton
              icon="information"
              title="About"
              subtitle="App version and info"
              onPress={() => {
                Toast.show({
                  type: "info",
                  text1: "Aditya Foods",
                  text2: "Version 1.0.0",
                });
              }}
            />
          </View>
        </View>

        {/* Logout */}
        <View style={styles.section}>
          <View style={styles.sectionContent}>
            <MenuButton
              icon="logout"
              title="Log Out"
              subtitle="Sign out of your account"
              onPress={handleLogout}
              danger
            />
          </View>
        </View>

        {/* Add padding for bottom navigation */}
        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Bottom Navigation */}
      <BottomNavigation userRole={userRole} />
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
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F8F9FA",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontFamily: "Poppins-Bold",
    fontSize: 20,
    color: "#333333",
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100, // Space for bottom navigation
  },
  profileCard: {
    alignItems: "center",
    paddingVertical: 32,
    paddingHorizontal: 20,
    backgroundColor: "#FFFFFF",
  },
  avatarContainer: {
    marginBottom: 16,
  },
  profileName: {
    fontFamily: "PlayfairDisplay-Bold",
    fontSize: 24,
    color: "#333333",
    marginBottom: 4,
  },
  profileRole: {
    fontFamily: "Poppins",
    fontSize: 14,
    color: "#FF6B00",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  section: {
    marginBottom: 24,
    marginTop: 19,
  },
  sectionTitle: {
    fontFamily: "Poppins-Bold",
    fontSize: 16,
    color: "#333333",
    marginBottom: 12,
    marginHorizontal: 20,
  },
  sectionContent: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  profileItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  profileItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFF8F0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  profileItemText: {
    flex: 1,
  },
  profileItemLabel: {
    fontFamily: "Poppins-Medium",
    fontSize: 16,
    fontWeight: 800,
    color: "#666666",
    marginBottom: 2,
  },
  profileItemValue: {
    fontFamily: "Poppins",
    fontSize: 14,
    color: "#333333",
  },
  menuButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  dangerButton: {
    // Special styling for danger buttons
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FFF8F0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  dangerIconContainer: {
    backgroundColor: "#FFEBEE",
  },
  menuButtonText: {
    flex: 1,
  },
  menuButtonTitle: {
    fontFamily: "Poppins-Medium",
    fontSize: 14,
    color: "#333333",
    marginBottom: 2,
  },
  dangerText: {
    color: "#FF4444",
  },
  menuButtonSubtitle: {
    fontFamily: "Poppins",
    fontSize: 12,
    color: "#666666",
  },
  bottomPadding: {
    height: 20,
  },
});

export default AccountScreen;
