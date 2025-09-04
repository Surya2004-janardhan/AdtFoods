import React, { useState, useContext, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import axios from "../axiosConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import AuthContext from "../context/AuthContext";

const AuthScreen = () => {
  const router = useRouter();
  const { login, signup, isAuthenticated, isStaff } = useContext(AuthContext);
  const [isLogin, setIsLogin] = useState(true);
  const [userId, setUserId] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Check if user is already authenticated on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      if (isAuthenticated()) {
        if (isStaff()) {
          router.replace("/StaffFoodItemsScreen");
        } else {
          router.replace("/HomeScreen");
        }
      }
    };

    checkAuthStatus();
  }, []);

  const handleLogin = async () => {
    if (!userId || !password) {
      setError("Please enter both user ID and password");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await login(userId, password);

      if (result.success) {
        // Register device token
        const fcmToken = userId === "1" ? "staff" : "user";
        await AsyncStorage.setItem("fcmToken", fcmToken);

        // Save device token to server
        await axios.post("/save-token", {
          userId,
          token: fcmToken,
        });

        // Navigate based on user role
        if (result.isStaff) {
          router.replace("/StaffFoodItemsScreen");
        } else {
          router.replace("/HomeScreen");
        }
      } else {
        setError(result.error || "Login failed. Please try again.");
      }
    } catch (err) {
      setError(err.message || "An unexpected error occurred during login.");
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    // Basic validation
    if (!userId || !name || !password || !email || !phoneNumber) {
      setError("Please fill in all fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const userData = {
        user_id: userId.toString(),
        name: name.toString(),
        password: password.toString(),
        email: email.toString(),
        phone_number: phoneNumber.toString(),
      };

      const result = await signup(userData);

      if (result.success) {
        // Show success message and switch to login view
        setError("");
        setIsLogin(true);
      } else {
        setError(result.error || "Registration failed. Please try again.");
      }
    } catch (err) {
      setError(
        err.message || "An unexpected error occurred during registration."
      );
      console.error("Signup error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.innerContainer}>
        <Image
          source={{
            uri: "https://tse3.mm.bing.net/th?id=OIP.7Qcj0BxVn5MWww7LaukFsQHaHa&pid=Api&P=0&h=180",
          }}
          style={styles.logo}
        />
        <Text style={styles.title}>{isLogin ? "Login" : "Sign Up"}</Text>
        <Text style={styles.subtitle}>
          {isLogin ? "Please log in to continue" : "Create a new account"}
        </Text>
        {error ? <Text style={styles.error}>{error}</Text> : null}

        {!isLogin && (
          <>
            <Text style={styles.label}>Name</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              style={styles.input}
            />
            <Text style={styles.label}>Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              style={styles.input}
              keyboardType="email-address"
            />
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              style={styles.input}
              keyboardType="phone-pad"
            />
          </>
        )}
        <Text style={styles.label}>ID</Text>
        <TextInput
          value={userId}
          onChangeText={setUserId}
          style={styles.input}
        />
        <Text style={styles.label}>Password</Text>
        <TextInput
          value={password}
          onChangeText={setPassword}
          style={styles.input}
          secureTextEntry
        />

        <TouchableOpacity
          style={styles.button}
          onPress={isLogin ? handleLogin : handleSignup}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.buttonText}>
              {isLogin ? "Login" : "Sign Up"}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
          <Text style={styles.linkText}>
            {isLogin
              ? "Don't have an account? Sign up here"
              : "Already have an account? Log in here"}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#9370DB",
  },
  innerContainer: {
    width: "90%",
    padding: 20,
    borderRadius: 10,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    alignItems: "center",
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
  },
  label: {
    alignSelf: "flex-start",
    fontSize: 16,
    color: "#333",
    marginBottom: 5,
  },
  input: {
    height: 40,
    borderColor: "#ddd",
    borderBottomWidth: 1,
    width: "100%",
    marginBottom: 15,
    paddingHorizontal: 10,
    fontSize: 16,
    color: "#000",
  },
  button: {
    backgroundColor: "#ffA500",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginBottom: 20,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  error: {
    color: "#ff4d4d",
    marginBottom: 10,
  },
  linkText: {
    color: "#007bff",
    fontSize: 14,
    textDecorationLine: "underline",
  },
});

export default AuthScreen;
