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
          setUser(JSON.parse(storedUser));
          setToken(storedToken);

          // Set the token in axios headers for all future requests
          axios.defaults.headers.common[
            "Authorization"
          ] = `Bearer ${storedToken}`;
        }
      } catch (error) {
        console.error("Error loading authentication state:", error);
      } finally {
        setLoading(false);
      }
    };

    loadAuthState();
  }, []);

  // Login function
  const login = async (userId, password) => {
    try {
      const response = await axios.post("/login", {
        user_id: userId.toString(),
        password: password.toString(),
      });

      if (response.data.success) {
        const userData = response.data.user;
        const authToken = response.data.token;

        // Store user data and token
        await AsyncStorage.setItem("userProfile", JSON.stringify(userData));
        await AsyncStorage.setItem("authToken", authToken);

        // Update state
        setUser(userData);
        setToken(authToken);

        // Set authorization header for future requests
        axios.defaults.headers.common["Authorization"] = `Bearer ${authToken}`;

        return {
          success: true,
          isStaff: userId === "1", // Assuming user ID 1 is staff
        };
      }
      return { success: false, error: "Invalid credentials" };
    } catch (error) {
      console.error("Login error:", error);
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
      const response = await axios.post("/signup", userData);

      if (response.data.success) {
        const authToken = response.data.token;

        // Store token (user data will be stored at login)
        await AsyncStorage.setItem("authToken", authToken);
        setToken(authToken);

        // Set authorization header
        axios.defaults.headers.common["Authorization"] = `Bearer ${authToken}`;

        return { success: true };
      }
      return { success: false, error: "Registration failed" };
    } catch (error) {
      console.error("Signup error:", error);
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
      // Clear auth state from storage
      await AsyncStorage.removeItem("userProfile");
      await AsyncStorage.removeItem("authToken");

      // Clear state
      setUser(null);
      setToken(null);

      // Remove authorization header
      delete axios.defaults.headers.common["Authorization"];

      return { success: true };
    } catch (error) {
      console.error("Logout error:", error);
      return { success: false, error: "Unable to logout. Please try again." };
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
