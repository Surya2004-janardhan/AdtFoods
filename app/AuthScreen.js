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
} from "react-native";
import { MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import axios from "../axiosConfig";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import AuthContext from "../context/AuthContext";
import Toast from "react-native-toast-message";

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
        className="text-xs text-gray-600 mb-1.5"
        style={{ fontFamily: "Poppins-Medium" }}
      >
        {label}
      </Text>
      <View className="flex-row items-center bg-white border border-gray-200 rounded-xl px-3 py-2.5 shadow-sm">
        <MaterialCommunityIcons
          name={icon}
          size={16}
          color="#FF6B00"
          style={{ marginRight: 8 }}
        />
        <TextInput
          className="flex-1 text-sm text-gray-800"
          style={{ fontFamily: "Poppins-Regular", minHeight: 18 }}
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

  const router = useRouter();
  const authContext = useContext(AuthContext);

  const handleLogin = async () => {
    if (!userId || !password) {
      Toast.show({
        type: "error",
        text1: "Missing Fields",
        text2: "Please fill in all required fields",
      });
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

        Toast.show({
          type: "success",
          text1: "Login Successful",
          text2: "Welcome back!",
        });
      } else {
        Toast.show({
          type: "error",
          text1: "Login Failed",
          text2: result.error,
        });
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Login Failed",
        text2: "An unexpected error occurred",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    if (!name || !email || !phoneNumber || !userId || !password) {
      Toast.show({
        type: "error",
        text1: "Missing Fields",
        text2: "Please fill in all required fields",
      });
      return;
    }

    setLoading(true);
    try {
      const userData = {
        user_id: userId,
        name: name,
        email,
        phone_number: phoneNumber,
        password,
      };

      const result = await authContext.signup(userData);

      if (result.success) {
        // Don't navigate or store auth data since no token is created
        // Switch to login mode and show success message
        setIsLogin(true);

        Toast.show({
          type: "success",
          text1: "Registration Successful",
          text2: result.message || "Please login to continue",
        });

        // Clear signup form but keep userId for login
        setName("");
        setEmail("");
        setPhoneNumber("");
        setPassword("");
        // Keep userId filled for convenience
      } else {
        Toast.show({
          type: "error",
          text1: "Registration Failed",
          text2: result.error,
        });
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Registration Failed",
        text2: "An unexpected error occurred",
      });
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
            <View className="w-16 h-16 bg-orange-500 rounded-2xl items-center justify-center mb-3 shadow-lg">
              <MaterialCommunityIcons
                name="food-fork-drink"
                size={32}
                color="white"
              />
            </View>
            <Text
              className="text-2xl text-gray-900 text-center mb-1"
              style={{ fontFamily: "PlayfairDisplay-Bold" }}
            >
              ADITYA FOODS
            </Text>
            <Text
              className="text-sm text-gray-600 text-center"
              style={{ fontFamily: "Poppins-Regular" }}
            >
              Delicious meals at your fingertips
            </Text>
          </View>

          {/* Form */}
          <View className="bg-white p-5 rounded-2xl shadow-lg border border-gray-100">
            <View className="mb-4">
              <Text
                className="text-lg text-gray-900 text-center mb-1"
                style={{ fontFamily: "Poppins-SemiBold" }}
              >
                {isLogin ? "Welcome Back" : "Create Account"}
              </Text>
              <Text
                className="text-sm text-gray-500 text-center"
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
                className="text-white text-base"
                style={{ fontFamily: "Poppins-SemiBold" }}
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
                className="text-orange-600 text-sm"
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
      <Toast />
    </KeyboardAvoidingView>
  );
};

export default AuthScreen;
