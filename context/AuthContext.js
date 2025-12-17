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
        const [storedUser, storedToken, storedExpiry] = await Promise.all([
          AsyncStorage.getItem("userProfile"),
          AsyncStorage.getItem("authToken"),
          AsyncStorage.getItem("tokenExpiry"),
        ]);

        if (storedUser && storedToken) {
          // Check token expiry first (client-side validation)
          if (storedExpiry) {
            const expiryTime = parseInt(storedExpiry, 10);
            const currentTime = Date.now();

            if (currentTime > expiryTime) {
              console.log("Token expired, clearing auth data");
              await clearAuthData();
              setLoading(false);
              return;
            }
          }

          console.log("Found valid stored auth data");

          // Parse and set user data immediately (optimistic approach)
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
          setToken(storedToken);

          // Set the token in axios headers
          axios.defaults.headers.common[
            "Authorization"
          ] = `Bearer ${storedToken}`;

          // Mark loading as false immediately for faster UI
          setLoading(false);

          // Verify token with backend in background (non-blocking)
          axios
            .get("/verify")
            .then((response) => {
              if (response.data.success) {
                console.log("Token verified successfully in background");
                // Update user data from backend if changed
                setUser(response.data.user);
                AsyncStorage.setItem(
                  "userProfile",
                  JSON.stringify(response.data.user)
                );
              } else {
                console.log("Background token verification failed");
                clearAuthData();
              }
            })
            .catch((error) => {
              console.log(
                "Background token verification error:",
                error.message
              );
              // Only clear if it's an authentication error
              if (
                error.response?.status === 401 ||
                error.response?.status === 403
              ) {
                clearAuthData();
              }
            });
        } else {
          console.log("No stored auth data found");
          setLoading(false);
        }
      } catch (error) {
        console.error("Error loading authentication state:", error);
        await clearAuthData();
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
        "tokenExpiry",
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

        // Calculate token expiry (30 days from now)
        const expiryTime = Date.now() + 30 * 24 * 60 * 60 * 1000;

        // Store all data in parallel for faster login
        await Promise.all([
          AsyncStorage.setItem("userProfile", JSON.stringify(userData)),
          AsyncStorage.setItem("authToken", authToken),
          AsyncStorage.setItem("userId", userData.user_id),
          AsyncStorage.setItem("tokenExpiry", expiryTime.toString()),
          AsyncStorage.setItem(
            "userRole",
            userData.user_id === "1" ? "staff" : "user"
          ),
        ]);

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
