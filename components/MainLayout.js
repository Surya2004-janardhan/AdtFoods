import React, { useState, useEffect } from "react";
import { View, StyleSheet, Keyboard } from "react-native";
import { usePathname } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";
import BottomNavigation from "./BottomNavigation";

const MainLayout = ({ children }) => {
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [userRole, setUserRole] = useState("user");
  const pathname = usePathname();

  // Routes that should show the bottom navigation
  const bottomNavRoutes = [
    "/HomeScreen",
    "/OrdersScreen",
    "/NotificationsScreen",
    "/AccountScreen",
    "/StaffFoodItemsScreen",
    "/StaffOrdersScreen",
  ];

  // Check if current route should show bottom navigation
  const shouldShowBottomNav = bottomNavRoutes.includes(pathname);

  useEffect(() => {
    // Get user role
    const getUserRole = async () => {
      try {
        const role = await AsyncStorage.getItem("userRole");
        const token = await AsyncStorage.getItem("userToken");
        if (token === "staff" || role === "staff") {
          setUserRole("staff");
        } else {
          setUserRole("user");
        }
      } catch (error) {
        console.error("Error getting user role:", error);
        setUserRole("user");
      }
    };

    getUserRole();
  }, []);

  useEffect(() => {
    // Keyboard listeners
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

  return (
    <View style={styles.container}>
      <View style={styles.content}>{children}</View>
      {shouldShowBottomNav && !keyboardVisible && (
        <BottomNavigation userRole={userRole} />
      )}
      <Toast />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  content: {
    flex: 1,
  },
});

export default MainLayout;
