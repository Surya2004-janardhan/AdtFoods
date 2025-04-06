import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

const AccountScreen = () => {
  const [userProfile, setUserProfile] = useState({});
  const router = useRouter();

  useEffect(() => {
    const getUserProfile = async () => {
      try {
        const profileData = await AsyncStorage.getItem("userProfile");
        if (profileData) {
          setUserProfile(JSON.parse(profileData));
        }
      } catch (error) {
        console.error("Error retrieving user profile:", error);
      }
    };

    getUserProfile();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      <Text style={styles.label}>ID:</Text>
      <Text style={styles.value}>{userProfile.id || "N/A"}</Text>
      <Text style={styles.label}>Name:</Text>
      <Text style={styles.value}>{userProfile.name || "N/A"}</Text>
      <Text style={styles.label}>Email:</Text>
      <Text style={styles.value}>{userProfile.email || "N/A"}</Text>
      <Text style={styles.label}>Phone:</Text>
      <Text style={styles.value}>{userProfile.phone || "N/A"}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#EEE8AA",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
    textAlign: "center",
  },
  label: {
    fontSize: 16,
    color: "#555",
  },
  value: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
  },
});

export default AccountScreen;
