import React, { useState, useEffect, useCallback } from "react";
import { View, Text, FlatList, StyleSheet, RefreshControl } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import axios from "../axiosConfig"; // Ensure axiosConfig is correctly set up

const OrdersScreen = () => {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const profileData = await AsyncStorage.getItem("userProfile");
        if (profileData) {
          setUserProfile(JSON.parse(profileData));
        }
      } catch (error) {
        console.error("Error retrieving user profile:", error);
      }
    };

    fetchUserProfile();
  }, []);

  useEffect(() => {
    if (userProfile) {
      fetchOrders();
    }
  }, [userProfile]);

  const fetchOrders = async () => {
    try {
      const response = await axios.get("/orders");
      if (userProfile) {
        const userOrders = response.data.filter(
          (order) => order.user_email === userProfile.email
        );
        setOrders(userOrders);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };
  // const userOrders = response.data.filter(
  //   (order) => order.user_email === userProfile.email && order.id
  // );

  useEffect(() => {
    const invalidOrders = orders.filter((order) => !order?.id);
    if (invalidOrders.length) {
      console.warn("Some orders have no ID:", invalidOrders);
    }
  }, [orders]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchOrders().finally(() => setRefreshing(false));
  }, [userProfile]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Your Orders</Text>
      <FlatList
        data={orders}
        keyExtractor={(item, index) => {
          return item?.id ? item.id.toString() : `${index}-${item.user_email}`;
        }}
        // keyExtractor={(item) => item.id.toString()}
        // keyExtractor={(item,id) =>
        //   item?.id ? item.id.toString() : id.toString()
        // }
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.userEmail}>Order ID: {item.order_id}</Text>
            <Text style={styles.itemDetail}>Name: {item.user_name}</Text>
            <Text style={styles.itemDetail}>Phone: {item.user_phone}</Text>
            <Text style={styles.itemDetail}>Items: {item.items}</Text>
            <Text style={styles.itemDetail}>
              Total: ${parseFloat(item.total_amount).toFixed(2)}
            </Text>
            <Text style={styles.itemDetail}>
              Date: {new Date(item.created_at).toLocaleString()}
            </Text>
            <Text style={styles.itemDetail}>Status: {item.status}</Text>
          </View>
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <Text style={styles.emptyMessage}>No orders found.</Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#F5F5DC",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
    textAlign: "center",
  },
  item: {
    marginBottom: 15,
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  userEmail: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
  },
  itemDetail: {
    color: "#444",
    marginTop: 3,
  },
  emptyMessage: {
    textAlign: "center",
    color: "#888",
    marginTop: 20,
  },
});

export default OrdersScreen;
