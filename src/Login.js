import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import Toast from "react-native-toast-message";
import Icon from "react-native-vector-icons/Ionicons";
import CONFIG from "../config";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { theme } from "./theme"; // Import professional design system

const Login = ({ navigation }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [user_id, setId] = useState("");
  const [user_name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone_number, setPhone] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false); // Loading state

  const handleLogin = async () => {
    if (!user_id || !password) {
      Toast.show({
        type: "error",
        text1: "Validation Error",
        text2: "Please enter both user ID and Password",
        position: "top",
      });
      return;
    }

    setLoading(true); // Start loading
    try {
      const response = await fetch(`${CONFIG.API_BASE_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id, password }),
      });
      const data = await response.json();
      if (data.success && data.token) {
        await AsyncStorage.setItem("jwtToken", data.token);
        Toast.show({
          type: "success",
          text1: "Login Successful",
          text2: "Redirecting to user Dashboard",
          position: "top",
          visibilityTime: 300,
          onHide: () => {
            navigation.reset({
              index: 0,
              routes: [
                { name: "HomeScreen", params: { jwtToken: data.token } },
              ],
            });
          },
        });
      } else {
        Toast.show({
          type: "error",
          text1: "Login Failed",
          text2: data.error || "Invalid credentials",
          position: "top",
        });
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Login failed. Please try again.",
        position: "top",
      });
    } finally {
      setLoading(false); // Stop loading
    }
  };
  const handleRegister = async () => {
    console.log("inside of register");
    if (!user_id || !user_name || !password || !phone_number || !email) {
      Toast.show({
        type: "error",
        text1: "Validation Error",
        text2: "Please fill all fields",
        position: "top",
      });
      return;
    }

    setLoading(true); // Start loading
    try {
      console.log("inside the fetch of register");
      const response = await fetch(`${CONFIG.API_BASE_URL}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id,
          name: user_name,
          password,
          email,
          phone_number,
        }),
      });
      const data = await response.json();
      console.log("Response status:", response.status);
      console.log("Response data:", data);
      if (response.ok && data.success) {
        Toast.show({
          type: "success",
          text1: "Registration Successful",
          text2: "You can now log in",
          position: "top",
        });
        setIsRegistering(false);
      } else {
        Toast.show({
          type: "error",
          text1: "Registration Failed",
          text2: data.error || data.message || "Please try again",
          position: "top",
        });
      }
    } catch (error) {
      console.error("Registration error:", error);
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Registration failed. Try again.",
        position: "top",
      });
    } finally {
      setLoading(false); // Stop loading
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar backgroundColor="#ffff" barStyle="dark-content" />
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.innerContainer}>
          <View style={styles.logoContainer}>
            <Image
              source={require("../assets/main.png")}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputWrapper}>
              {isRegistering && (
                <>
                  <View style={styles.inputContainer}>
                    <Icon
                      name="person-circle-outline"
                      size={24}
                      color="#666"
                      style={styles.inputIcon}
                    />
                    <TextInput
                      placeholder="Full Name"
                      value={user_name}
                      onChangeText={setName}
                      style={styles.input}
                      placeholderTextColor="#999"
                    />
                  </View>
                  <View style={styles.inputContainer}>
                    <Icon
                      name="mail-outline"
                      size={24}
                      color="#666"
                      style={styles.inputIcon}
                    />
                    <TextInput
                      placeholder="Email"
                      value={email}
                      onChangeText={setEmail}
                      style={styles.input}
                      placeholderTextColor="#999"
                      autoCapitalize="none"
                      keyboardType="email-address"
                    />
                  </View>
                </>
              )}

              <View style={styles.inputContainer}>
                <Icon
                  name="person-outline"
                  size={24}
                  color="#666"
                  style={styles.inputIcon}
                />
                <TextInput
                  placeholder="User ID"
                  value={user_id}
                  onChangeText={setId}
                  style={styles.input}
                  placeholderTextColor="#999"
                  autoCapitalize="none"
                />
              </View>

              {isRegistering && (
                <View style={styles.inputContainer}>
                  <Icon
                    name="call-outline"
                    size={24}
                    color="#666"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    placeholder="Phone Number"
                    value={phone_number}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                    style={styles.input}
                    placeholderTextColor="#999"
                  />
                </View>
              )}

              <View style={styles.inputContainer}>
                <Icon
                  name="lock-closed-outline"
                  size={24}
                  color="#666"
                  style={styles.inputIcon}
                />
                <TextInput
                  placeholder="Password"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                  style={styles.input}
                  placeholderTextColor="#999"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIconContainer}
                >
                  <Icon
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={24}
                    color="#666"
                  />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              onPress={isRegistering ? handleRegister : handleLogin}
              style={[styles.loginButton, loading && styles.disabledButton]}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.loginButtonText}>
                  {isRegistering ? "Register" : "Login"}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setIsRegistering(!isRegistering)}
              style={{ marginTop: 15, alignSelf: "center" }}
            >
              <Text style={{ color: "#333" }}>
                {isRegistering
                  ? "Already have an account? Login"
                  : "Don't have an account? Register"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
      <Toast />
    </KeyboardAvoidingView>
  );
};

// Professional Login Screen Styles
const professionalStyles = StyleSheet.create({
  // Main Layout
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: theme.spacing.xl,
    backgroundColor: theme.colors.primary,
  },

  // Header Section
  headerContainer: {
    alignItems: "center",
    marginBottom: theme.spacing.xxxl,
  },
  title: {
    fontSize: theme.fonts.sizes.display,
    fontWeight: theme.fonts.weights.bold,
    color: theme.colors.white,
    textAlign: "center",
    letterSpacing: -1,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: theme.fonts.sizes.lg,
    color: theme.colors.white,
    textAlign: "center",
    opacity: 0.9,
    fontWeight: theme.fonts.weights.medium,
  },

  // Form Section
  formContainer: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.xxl,
    padding: theme.spacing.xl,
    marginBottom: theme.spacing.lg,
    ...theme.shadows.xl,
  },

  // Input Fields
  inputContainer: {
    marginBottom: theme.spacing.lg,
  },
  label: {
    fontSize: theme.fonts.sizes.sm,
    fontWeight: theme.fonts.weights.semibold,
    color: theme.colors.textPrimary,
    marginBottom: theme.spacing.sm,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  input: {
    height: theme.components.input.height,
    borderWidth: theme.components.input.borderWidth,
    borderColor: theme.colors.gray300,
    borderRadius: theme.components.input.borderRadius,
    paddingHorizontal: theme.components.input.paddingHorizontal,
    fontSize: theme.fonts.sizes.md,
    backgroundColor: theme.colors.white,
    color: theme.colors.textPrimary,
    fontWeight: theme.fonts.weights.medium,
  },

  // Buttons
  loginButton: {
    height: theme.components.button.height,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.components.button.borderRadius,
    justifyContent: "center",
    alignItems: "center",
    marginTop: theme.spacing.lg,
    ...theme.shadows.lg,
  },
  loginButtonText: {
    color: theme.colors.white,
    fontSize: theme.fonts.sizes.lg,
    fontWeight: theme.fonts.weights.bold,
  },
  registerButton: {
    height: theme.components.button.height,
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: theme.colors.white,
    borderRadius: theme.components.button.borderRadius,
    justifyContent: "center",
    alignItems: "center",
    marginTop: theme.spacing.md,
  },
  registerButtonText: {
    color: theme.colors.white,
    fontSize: theme.fonts.sizes.lg,
    fontWeight: theme.fonts.weights.bold,
  },
});

// Use professionalStyles as styles
const styles = professionalStyles;

export default Login;
