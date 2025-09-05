import React, { useContext } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { useRouter, useSegments } from "expo-router";
import AuthContext from "../context/AuthContext";

const AuthWrapper = ({ children }) => {
  const { user, loading } = useContext(AuthContext);
  const router = useRouter();
  const segments = useSegments();

  // Show loading screen while checking authentication
  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text
          className="mt-4 text-gray-600"
          style={{ fontFamily: "Poppins-Regular" }}
        >
          Loading...
        </Text>
      </View>
    );
  }

  // Check if we're on an auth screen
  const isAuthScreen = segments[0] === "AuthScreen" || segments.length === 0;

  React.useEffect(() => {
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
  }, [user, loading, segments]);

  return <>{children}</>;
};

export default AuthWrapper;
