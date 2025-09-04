import React, { useState, useContext, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  ScrollView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { MaterialCommunityIcons, Feather } from "@expo/vector-icons";
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
  const [showPassword, setShowPassword] = useState(false);

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

  const InputField = ({
    label,
    value,
    setValue,
    icon,
    keyboardType = "default",
    secure = false,
    isPassword = false,
  }) => (
    <View className="w-full mb-5">
      <Text className="text-secondary font-['Poppins-Medium'] text-base mb-2">
        {label}
      </Text>
      <View className="w-full flex-row items-center border-b-2 border-gray-200">
        <Feather name={icon} size={18} color="#FF6B00" className="mr-2" />
        <TextInput
          value={value}
          onChangeText={setValue}
          className="flex-1 py-2 px-3 text-secondary text-base font-['Poppins']"
          keyboardType={keyboardType}
          secureTextEntry={isPassword && !showPassword}
        />
        {isPassword && (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            className="p-2"
          >
            <Feather
              name={showPassword ? "eye-off" : "eye"}
              size={18}
              color="#888"
            />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      <ScrollView className="flex-1 bg-accent-cream">
        <View className="flex-1 items-center justify-center px-6 py-10">
          {/* Logo and Header */}
          <View className="w-full items-center mb-8">
            <View className="w-24 h-24 bg-primary rounded-full items-center justify-center mb-6 shadow-lg">
              <MaterialCommunityIcons name="food" size={56} color="white" />
            </View>

            <Text className="font-['PlayfairDisplay-Bold'] text-3xl text-secondary text-center">
              ADITYA FOODS
            </Text>

            <View className="h-1 w-20 bg-primary my-3" />

            <Text className="font-['Poppins'] text-secondary-light text-center text-base">
              {isLogin
                ? "Welcome back! Please log in to continue"
                : "Create an account to get started"}
            </Text>
          </View>

          {/* Error Message */}
          {error ? (
            <View className="w-full bg-red-100 border-l-4 border-red-500 p-3 rounded mb-5">
              <Text className="text-red-500 font-['Poppins']">{error}</Text>
            </View>
          ) : null}

          {/* Form Container */}
          <View className="w-full bg-white p-6 rounded-xl shadow-md">
            {!isLogin && (
              <>
                <InputField
                  label="Full Name"
                  value={name}
                  setValue={setName}
                  icon="user"
                />
                <InputField
                  label="Email Address"
                  value={email}
                  setValue={setEmail}
                  icon="mail"
                  keyboardType="email-address"
                />
                <InputField
                  label="Phone Number"
                  value={phoneNumber}
                  setValue={setPhoneNumber}
                  icon="phone"
                  keyboardType="phone-pad"
                />
              </>
            )}

            <InputField
              label="User ID"
              value={userId}
              setValue={setUserId}
              icon="hash"
            />

            <InputField
              label="Password"
              value={password}
              setValue={setPassword}
              icon="lock"
              isPassword={true}
            />

            <TouchableOpacity
              className={`mt-6 rounded-lg py-4 px-6 items-center justify-center ${
                loading ? "bg-primary-light" : "bg-primary"
              }`}
              onPress={isLogin ? handleLogin : handleSignup}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text className="text-white font-['Poppins-Bold'] text-lg">
                  {isLogin ? "LOGIN" : "SIGN UP"}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              className="mt-5 items-center"
              onPress={() => setIsLogin(!isLogin)}
            >
              <Text className="text-primary font-['Poppins'] text-base">
                {isLogin
                  ? "Don't have an account? Sign up here"
                  : "Already have an account? Log in here"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Bottom decoration */}
          <View className="w-16 h-1 bg-primary mt-12" />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default AuthScreen;
