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
  StyleSheet,
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
}) => {
  return (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={styles.inputWrapper}>
        <MaterialCommunityIcons
          name={icon}
          size={20}
          color="#FF6B00"
          style={styles.inputIcon}
        />
        <TextInput
          style={styles.textInput}
          value={value}
          onChangeText={setValue}
          keyboardType={keyboardType}
          secureTextEntry={isPassword && !showPassword}
          placeholder={`Enter your ${label.toLowerCase()}`}
          placeholderTextColor="#999999"
        />
        {isPassword && (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeIcon}
          >
            <Feather
              name={showPassword ? "eye" : "eye-off"}
              size={20}
              color="#666666"
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
      const response = await axios.post("/auth/login", {
        user_id: userId,
        password,
      });

      if (response.data.token) {
        await AsyncStorage.setItem("userToken", response.data.token);
        await AsyncStorage.setItem("userId", userId);

        if (response.data.user_role) {
          await AsyncStorage.setItem("userRole", response.data.user_role);
        }

        // Navigate based on user role
        if (response.data.user_role === "staff") {
          router.replace("/StaffFoodItemsScreen");
        } else {
          router.replace("/HomeScreen");
        }

        Toast.show({
          type: "success",
          text1: "Login Successful",
          text2: "Welcome back!",
        });
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Login Failed",
        text2: error.response?.data?.message || "An error occurred",
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
      const response = await axios.post("/auth/register", {
        user_name: name,
        email,
        phone_number: phoneNumber,
        user_id: userId,
        password,
      });

      if (response.data.token) {
        await AsyncStorage.setItem("userToken", response.data.token);
        await AsyncStorage.setItem("userId", userId);

        router.replace("/HomeScreen");

        Toast.show({
          type: "success",
          text1: "Registration Successful",
          text2: "Welcome to Aditya Foods!",
        });
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Registration Failed",
        text2: error.response?.data?.message || "An error occurred",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.content}>
          {/* Logo Section */}
          <View style={styles.logoSection}>
            <View style={styles.logoContainer}>
              <MaterialCommunityIcons
                name="food-fork-drink"
                size={48}
                color="white"
              />
            </View>
            <Text style={styles.logoText}>ADITYA FOODS</Text>
            <Text style={styles.taglineText}>
              Delicious meals at your fingertips
            </Text>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            {!isLogin && (
              <>
                <InputField
                  label="Full Name"
                  value={name}
                  setValue={setName}
                  icon="account"
                />
                <InputField
                  label="Email Address"
                  value={email}
                  setValue={setEmail}
                  icon="email"
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
              icon="account-circle"
            />
            <InputField
              label="Password"
              value={password}
              setValue={setPassword}
              icon="lock"
              isPassword={true}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
            />

            <TouchableOpacity
              style={[
                styles.submitButton,
                loading && styles.submitButtonDisabled,
              ]}
              onPress={isLogin ? handleLogin : handleSignup}
              disabled={loading}
            >
              <Text style={styles.submitButtonText}>
                {loading ? "Loading..." : isLogin ? "LOGIN" : "SIGN UP"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.switchButton}
              onPress={() => setIsLogin(!isLogin)}
            >
              <Text style={styles.switchButtonText}>
                {isLogin
                  ? "Don't have an account? Sign up here"
                  : "Already have an account? Log in here"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Decorative Element */}
          <View style={styles.decorativeBar} />
        </View>
      </ScrollView>
      <Toast />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollContainer: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  logoSection: {
    alignItems: "center",
    marginBottom: 48,
  },
  logoContainer: {
    width: 80,
    height: 80,
    backgroundColor: "#FF6B00",
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    shadowColor: "#FF6B00",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  logoText: {
    fontFamily: "PlayfairDisplay-Bold",
    fontSize: 28,
    color: "#333333",
    textAlign: "center",
    marginBottom: 8,
  },
  taglineText: {
    fontFamily: "Poppins",
    fontSize: 14,
    color: "#666666",
    textAlign: "center",
  },
  formContainer: {
    backgroundColor: "#FFFFFF",
    padding: 24,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontFamily: "Poppins-Medium",
    fontSize: 14,
    color: "#333333",
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FAFAFA",
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: "#333333",
    fontFamily: "Poppins",
  },
  eyeIcon: {
    padding: 4,
  },
  submitButton: {
    backgroundColor: "#FF6B00",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 24,
    shadowColor: "#FF6B00",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  submitButtonDisabled: {
    backgroundColor: "#FFB366",
    shadowOpacity: 0,
    elevation: 0,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Poppins-Bold",
  },
  switchButton: {
    marginTop: 20,
    alignItems: "center",
  },
  switchButtonText: {
    color: "#FF6B00",
    fontSize: 14,
    fontFamily: "Poppins",
  },
  decorativeBar: {
    width: 64,
    height: 4,
    backgroundColor: "#FF6B00",
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 48,
  },
});

export default AuthScreen;
