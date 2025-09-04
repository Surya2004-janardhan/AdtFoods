import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const instance = axios.create({
  baseURL: "http://10.234.34.53:3500", // Set your base URL here
});

// Add a request interceptor to add the JWT token to all requests
instance.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error("Error setting auth token:", error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle auth errors
instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If the error is 401 or 403 and not already retrying
    if (
      (error.response?.status === 401 || error.response?.status === 403) &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        // Clear auth token and redirect to login
        await AsyncStorage.removeItem("authToken");

        // You can't navigate from here directly, but you can set a flag in AsyncStorage
        // that the app can check on the next render
        await AsyncStorage.setItem("authRedirect", "true");

        // You could also use an event system to notify components
        // For example with EventEmitter or with a state management library
      } catch (refreshError) {
        console.error("Error handling auth error:", refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default instance;

// IPv4 Address. . . . . . . . . . . : 192.168.17.53
