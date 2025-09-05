import React, { useContext, useEffect } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { useRouter, useSegments } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AuthContext from "../context/AuthContext";

const AuthWrapper = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  const router = useRouter();
  const segments = useSegments();

  // Check if we're on an auth screen
  const isAuthScreen = segments[0] === "AuthScreen" || segments.length === 0;

  // Handle navigation logic - this hook must be called every render
  useEffect(() => {
    if (!loading) {
      if (user && isAuthScreen) {
        // User is logged in but on auth screen, redirect based on role
        const userRole = user.user_id === "1" ? "staff" : "user";
        if (userRole === "staff") {
          router.replace("/StaffFoodItemsScreen");
        } else {
          router.replace("/HomeScreen");
        }
      } else if (!user && !isAuthScreen) {
        // User is not logged in and not on auth screen, redirect to auth
        router.replace("/AuthScreen");
      }
    }
  }, [user, loading, segments, isAuthScreen, router]);

  // Show loading screen while checking authentication - after all hooks
  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#FFFFFF",
          gap: 16,
        }}
      >
        <View
          style={{
            width: 80,
            height: 80,
            backgroundColor: "#FFF8F0",
            borderRadius: 40,
            justifyContent: "center",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <MaterialCommunityIcons
            name="shield-account"
            size={48}
            color="#FF6B00"
          />
        </View>
        <ActivityIndicator size="large" color="#FF6B00" />
        <Text
          style={{
            marginTop: 8,
            color: "#333333",
            fontSize: 16,
            fontFamily: "Poppins-Bold",
          }}
        >
          Loading...
        </Text>
      </View>
    );
  }

  return <>{children}</>;
};

export default AuthWrapper;

// export default AuthWrapper;
