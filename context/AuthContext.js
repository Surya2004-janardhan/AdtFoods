import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "../axiosConfig";

// Create the authentication context
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state from storage
  useEffect(() => {
    const loadAuthState = async () => {
      try {
        const [storedUser, storedToken] = await Promise.all([
          AsyncStorage.getItem("userProfile"),
          AsyncStorage.getItem("authToken"),
        ]);

        if (storedUser && storedToken) {
          console.log("Found stored auth data, verifying token...");

          // Set the token in axios headers for verification
          axios.defaults.headers.common[
            "Authorization"
          ] = `Bearer ${storedToken}`;

          // Verify token with backend
          try {
            const response = await axios.get("/verify");

            if (response.data.success) {
              console.log("Token verified successfully");
              // Update user data from backend response
              setUser(response.data.user);
              setToken(storedToken);

              // Store updated user data
              await AsyncStorage.setItem(
                "userProfile",
                JSON.stringify(response.data.user)
              );
              await AsyncStorage.setItem(
                "userRole",
                response.data.isStaff ? "staff" : "user"
              );
              await AsyncStorage.setItem("userId", response.data.user.user_id);
            } else {
              console.log("Token verification failed, clearing auth data");
              await clearAuthData();
            }
          } catch (error) {
            console.log(
              "Token verification failed:",
              error.response?.data || error.message
            );
            await clearAuthData();
          }
        } else {
          console.log("No stored auth data found");
        }
      } catch (error) {
        console.error("Error loading authentication state:", error);
        await clearAuthData();
      } finally {
        setLoading(false);
      }
    };

    loadAuthState();
  }, []);

  // Helper function to clear auth data
  const clearAuthData = async () => {
    try {
      await AsyncStorage.multiRemove([
        "userProfile",
        "authToken",
        "userId",
        "userRole",
      ]);
      setUser(null);
      setToken(null);
      delete axios.defaults.headers.common["Authorization"];
    } catch (error) {
      console.error("Error clearing auth data:", error);
    }
  };

  // Login function
  const login = async (userId, password) => {
    try {
      console.log("AuthContext login called with:", {
        userId,
        password: "***",
      });

      const loginData = {
        user_id: userId.toString(),
        password: password.toString(),
      };

      console.log("Sending login request with data:", {
        ...loginData,
        password: "***",
      });

      const response = await axios.post("/login", loginData);

      console.log("Login response received:", response.data);

      if (response.data.success && response.data.token) {
        const userData = response.data.user;
        const authToken = response.data.token;

        // Store user data and token
        await AsyncStorage.setItem("userProfile", JSON.stringify(userData));
        await AsyncStorage.setItem("authToken", authToken);
        await AsyncStorage.setItem("userId", userData.user_id);
        await AsyncStorage.setItem(
          "userRole",
          userData.user_id === "1" ? "staff" : "user"
        );

        // Update state
        setUser(userData);
        setToken(authToken);

        // Set authorization header for future requests
        axios.defaults.headers.common["Authorization"] = `Bearer ${authToken}`;

        console.log("Login successful, user data stored");
        return {
          success: true,
          isStaff: userData.user_id === "1",
          user: userData,
        };
      }
      console.log("Login failed: Invalid credentials or missing token");
      return { success: false, error: "Invalid credentials" };
    } catch (error) {
      console.error("Login error:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);
      return {
        success: false,
        error:
          error.response?.data?.error || "Unable to login. Please try again.",
      };
    }
  };

  // Sign up function
  const signup = async (userData) => {
    try {
      console.log("AuthContext signup called with:", {
        ...userData,
        password: "***",
      });

      const response = await axios.post("/signup", userData);
      console.log("Signup response received:", response.data);

      if (response.data.success) {
        // No token is returned during signup, user needs to login separately
        return {
          success: true,
          message:
            response.data.message ||
            "Registration successful. Please login to continue.",
        };
      }
      console.log("Signup failed: No success in response");
      return { success: false, error: "Registration failed" };
    } catch (error) {
      console.error("Signup error:", error);
      console.error("Signup error response:", error.response?.data);
      console.error("Signup error status:", error.response?.status);
      return {
        success: false,
        error:
          error.response?.data?.error ||
          "Unable to complete registration. Please try again.",
      };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      console.log("Logging out user...");
      await clearAuthData();
      return { success: true };
    } catch (error) {
      console.error("Logout error:", error);
      return { success: false, error: "Logout failed" };
    }
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    return !!token;
  };

  // Check if user is staff
  const isStaff = () => {
    return user?.user_id === "1"; // Assuming user ID 1 is staff
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        signup,
        logout,
        isAuthenticated,
        isStaff,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
