import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const NotificationsScreen = () => {
  const [userRole, setUserRole] = useState("user");
  const router = useRouter();

  useEffect(() => {
    const getUserRole = async () => {
      try {
        const role = (await AsyncStorage.getItem("userRole")) || "user";
        setUserRole(role);
      } catch (error) {
        console.error("Error getting user role:", error);
      }
    };

    getUserRole();
  }, []);

  const handleGoBack = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f9fafb" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleGoBack}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#333333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Coming Soon Content */}
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons name="bell-ring" size={64} color="#F97316" />
        </View>

        <Text style={styles.title}>Coming Soon!</Text>

        <Text style={styles.subtitle}>
          We're working on bringing you real-time notifications for your orders,
          special offers, and restaurant updates.
        </Text>

        <View style={styles.featuresContainer}>
          <Text style={styles.featuresTitle}>What's Coming:</Text>

          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <MaterialCommunityIcons
                  name="check"
                  size={16}
                  color="#10B981"
                />
              </View>
              <Text style={styles.featureText}>Order status updates</Text>
            </View>

            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <MaterialCommunityIcons name="tag" size={16} color="#3B82F6" />
              </View>
              <Text style={styles.featureText}>Special offers & discounts</Text>
            </View>

            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <MaterialCommunityIcons
                  name="store-plus"
                  size={16}
                  color="#8B5CF6"
                />
              </View>
              <Text style={styles.featureText}>New restaurant alerts</Text>
            </View>

            <View style={styles.featureItem}>
              <View style={styles.featureIcon}>
                <MaterialCommunityIcons name="food" size={16} color="#F97316" />
              </View>
              <Text style={styles.featureText}>
                New menu item notifications
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity onPress={handleGoBack} style={styles.backButtonStyle}>
          <Text style={styles.backButtonText}>Back to Home</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    minHeight: 72,
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
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  iconContainer: {
    backgroundColor: "#FED7AA",
    borderRadius: 50,
    padding: 24,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontFamily: "Poppins-Bold",
    color: "#111827",
    textAlign: "center",
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: "Poppins-Regular",
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 24,
  },
  featuresContainer: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    width: "100%",
  },
  featuresTitle: {
    fontSize: 18,
    fontFamily: "Poppins-SemiBold",
    color: "#111827",
    marginBottom: 16,
  },
  featuresList: {
    gap: 12,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  featureIcon: {
    backgroundColor: "#F3F4F6",
    borderRadius: 50,
    padding: 8,
    marginRight: 12,
  },
  featureText: {
    fontSize: 14,
    fontFamily: "Poppins-Regular",
    color: "#374151",
    flex: 1,
  },
  backButtonStyle: {
    backgroundColor: "#F97316",
    borderRadius: 16,
    paddingHorizontal: 32,
    paddingVertical: 16,
    marginTop: 32,
    shadowColor: "#F97316",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  backButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Poppins-Bold",
    textAlign: "center",
  },
});

export default NotificationsScreen;
