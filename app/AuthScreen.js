import React, { useState, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StatusBar,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Image,
} from "react-native";
import { MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import axios from "../axiosConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import AuthContext from "../context/AuthContext";
import CustomNotification from "../components/CustomNotification";

// Prevent keyboard from dismissing on submit
if (TextInput.defaultProps == null) TextInput.defaultProps = {};
TextInput.defaultProps.blurOnSubmit = false;
TextInput.defaultProps.autoCorrect = false;

const InputField = ({
  label,
  value,
  setValue,
  icon,
  keyboardType = "default",
  isPassword = false,
  showPassword,
  setShowPassword,
  placeholder,
}) => {
  return (
    <View className="mb-3">
      <Text
        className="text-xl text-gray-500 mb-2"
        style={{ fontFamily: "Poppins-SemiBold" }}
      >
        {label}
      </Text>
      <View className="flex-row items-center bg-white border border-gray-200 rounded-xl px-3 py-3.5 shadow-sm">
        <MaterialCommunityIcons
          name={icon}
          size={16}
          color="#FF6B00"
          style={{ marginRight: 8 }}
        />
        <TextInput
          className="flex-1 text-base text-gray-800"
          style={{ fontFamily: "Poppins-Regular", minHeight: 20 }}
          value={value}
          onChangeText={setValue}
          keyboardType={keyboardType}
          secureTextEntry={isPassword && !showPassword}
          placeholder={placeholder || `Enter ${label.toLowerCase()}`}
          placeholderTextColor="#9CA3AF"
          autoCapitalize={
            isPassword
              ? "none"
              : keyboardType === "email-address"
              ? "none"
              : "words"
          }
        />
        {isPassword && (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            className="p-1"
          >
            <Feather
              name={showPassword ? "eye" : "eye-off"}
              size={14}
              color="#6B7280"
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const AuthScreen = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState({
    message: "",
    type: "",
    visible: false,
  });

  const router = useRouter();
  const authContext = useContext(AuthContext);

  // Helper function to show notifications
  const showNotification = (message, type = "info") => {
    setNotification({ message, type, visible: true });
    setTimeout(() => {
      setNotification((prev) => ({ ...prev, visible: false }));
    }, 3000);
  };

  const handleLogin = async () => {
    // Check if all fields are filled
    if (!userId || !password) {
      showNotification("Please fill in all required fields", "error");
      return;
    }

    // Validate user ID format
    if (userId.trim().length !== 10) {
      showNotification("User ID must be exactly 10 characters", "error");
      return;
    }

    // Validate password
    if (password.length < 6) {
      showNotification("Password must be at least 6 characters", "error");
      return;
    }

    setLoading(true);
    try {
      const result = await authContext.login(userId, password);

      if (result.success) {
        // Navigate based on staff status
        if (result.isStaff) {
          await AsyncStorage.setItem("userRole", "staff");
          router.replace("/StaffFoodItemsScreen");
        } else {
          await AsyncStorage.setItem("userRole", "user");
          router.replace("/HomeScreen");
        }

        showNotification("Welcome back!", "success");
      } else {
        showNotification(result.error || "Login failed", "error");
      }
    } catch (error) {
      showNotification(error.message || "Network error occurred", "error");
    } finally {
      setLoading(false);
    }
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhoneNumber = (phone) => {
    const phoneRegex = /^[0-9]{10}$/;
    return phoneRegex.test(phone);
  };

  const validatePassword = (password) => {
    return password.length >= 6;
  };

  const validateUserId = (userId) => {
    const userIdRegex = /^[a-zA-Z0-9_]{10}$/;
    return userIdRegex.test(userId);
  };

  const handleSignup = async () => {
    // Check if all fields are filled
    if (!name || !email || !phoneNumber || !userId || !password) {
      showNotification("Please fill in all required fields", "error");
      return;
    }

    // Validate name
    if (name.trim().length < 5) {
      showNotification("Name must be at least 5 characters long", "error");
      return;
    }

    // Validate email
    if (!validateEmail(email)) {
      showNotification("Please enter a valid email address", "error");
      return;
    }

    // Validate phone number
    if (!validatePhoneNumber(phoneNumber)) {
      showNotification("Please enter a valid 10-digit phone number", "error");
      return;
    }

    // Validate user ID
    if (!validateUserId(userId)) {
      showNotification(
        "User ID must be exactly 10 characters (letters, numbers, underscore only)",
        "error"
      );
      return;
    }

    // Validate password
    if (!validatePassword(password)) {
      showNotification("Password must be at least 6 characters long", "error");
      return;
    }

    setLoading(true);
    try {
      const userData = {
        user_id: userId,
        name: name.trim(),
        email: email.toLowerCase().trim(),
        phone_number: phoneNumber,
        password,
      };

      const result = await authContext.signup(userData);

      if (result.success) {
        // Don't navigate or store auth data since no token is created
        // Switch to login mode and show success message
        setIsLogin(true);

        showNotification(
          result.message || "Registration successful! Please login to continue",
          "success"
        );

        // Clear signup form but keep userId for login
        setName("");
        setEmail("");
        setPhoneNumber("");
        setPassword("");
        // Keep userId filled for convenience
      } else {
        showNotification(result.error || "Registration failed", "error");
      }
    } catch (error) {
      showNotification("An unexpected error occurred", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-gray-50"
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />

      {/* Custom Notification */}
      <CustomNotification
        message={notification.message}
        type={notification.type}
        visible={notification.visible}
      />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: 20,
          paddingVertical: 30,
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 justify-center min-h-full">
          {/* Logo Section */}
          <View className="items-center mb-6">
            {/* Custom Logo Image */}
            <Image
              source={require("../assets/icon.png")}
              style={{
                width: 80,
                height: 80,
                marginBottom: 12,
                borderRadius: 20,
              }}
              resizeMode="contain"
            />
            <Text
              className="text-3xl text-gray-900 text-center m-1"
              style={{ fontFamily: "Poppins-Bold" }}
            >
              ADITYA FOODS
            </Text>
            <Text
              className="text-base text-gray-600 text-center"
              style={{ fontFamily: "Poppins-Regular" }}
            >
              Delicious meals at your fingertips
            </Text>
          </View>

          {/* Form */}
          <View className="bg-white p-5 rounded-2xl shadow-lg border border-gray-100">
            <View className="mb-4">
              <Text
                className="text-2xl text-gray-900 text-center mb-1"
                style={{ fontFamily: "Poppins-Bold" }}
              >
                {isLogin ? "Welcome Back" : "Create Account"}
              </Text>
              <Text
                className="text-base text-gray-500 text-center"
                style={{ fontFamily: "Poppins-Regular" }}
              >
                {isLogin ? "Sign in to continue" : "Join us today"}
              </Text>
            </View>

            {!isLogin && (
              <>
                <InputField
                  label="Full Name"
                  value={name}
                  setValue={setName}
                  icon="account"
                  placeholder="Enter Name"
                  // className="bg-amber-900"
                />
                <InputField
                  label="Email Address"
                  value={email}
                  setValue={setEmail}
                  icon="email"
                  keyboardType="email-address"
                  placeholder="Enter E-mail"
                />
                <InputField
                  label="Phone Number"
                  value={phoneNumber}
                  setValue={setPhoneNumber}
                  icon="phone"
                  keyboardType="phone-pad"
                  placeholder="Enter Phone no"
                />
              </>
            )}
            <InputField
              label="User ID"
              value={userId}
              setValue={setUserId}
              icon="account-circle"
              placeholder="Enter username"
            />
            <InputField
              label="Password"
              value={password}
              setValue={setPassword}
              icon="lock-outline"
              isPassword={true}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
              placeholder="Enter password"
            />

            <TouchableOpacity
              className={`bg-orange-500 rounded-xl py-3 items-center mt-4 shadow-md ${
                loading ? "opacity-70" : "shadow-orange-200"
              }`}
              onPress={isLogin ? handleLogin : handleSignup}
              disabled={loading}
              activeOpacity={0.8}
            >
              <Text
                className="text-white text-xl"
                style={{ fontFamily: "Poppins-Bold" }}
              >
                {loading
                  ? "Please wait..."
                  : isLogin
                  ? "Sign In"
                  : "Create Account"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="mt-4 items-center py-2"
              onPress={() => setIsLogin(!isLogin)}
              activeOpacity={0.7}
            >
              <Text
                className="text-orange-600 text-base"
                style={{ fontFamily: "Poppins-Medium" }}
              >
                {isLogin
                  ? "New here? Create an account"
                  : "Already registered? Sign in"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Decorative Element */}
          <View className="w-12 h-0.5 bg-orange-500 rounded self-center mt-6" />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default AuthScreen;
