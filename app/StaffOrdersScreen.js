import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  RefreshControl,
} from "react-native";
import axios from "../axiosConfig";
import { useRouter } from "expo-router";

const StaffOrdersScreen = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const fetchOrders = async () => {
    try {
      const response = await axios.get("/orders");
      const sortedData = response.data.sort((a, b) =>
        a.status === "pending" ? -1 : 1
      );
      setOrders(sortedData);
      setFilteredOrders(sortedData);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  const handleOrderStatus = async (id, status) => {
    try {
      const response = await axios.patch(`/orders/${id}`, { status });
      if (response.status === 200) {
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order._id === id ? { ...order, status } : order
          )
        );
        setFilteredOrders((prevOrders) =>
          prevOrders.map((order) =>
            order._id === id ? { ...order, status } : order
          )
        );
      }
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  };

  const formatAmount = (amount) => {
    return isNaN(parseFloat(amount)) ? "0.00" : parseFloat(amount).toFixed(2);
  };

  const handleSearch = (text) => {
    setSearchTerm(text);
    const filtered = orders.filter(
      (order) =>
        order.user_email.toLowerCase().includes(text.toLowerCase()) ||
        order.user_name.toLowerCase().includes(text.toLowerCase()) ||
        order.user_phone.toLowerCase().includes(text.toLowerCase())
    );
    setFilteredOrders(filtered);
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchOrders().finally(() => setRefreshing(false));
  }, []);

  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchBar}
        placeholder="Search orders..."
        placeholderTextColor="#000"
        value={searchTerm}
        onChangeText={handleSearch}
      />
      <FlatList
        data={filteredOrders}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.userEmail}>User Id: {item.user_id}</Text>
            <Text style={styles.itemDetail}>Name: {item.user_name}</Text>
            <Text style={styles.itemDetail}>Phone: {item.user_phone}</Text>
            <Text style={styles.itemDetail}>Items: {item.items}</Text>
            <Text style={styles.itemDetail}>
              Total: {formatAmount(item.total_amount)}
            </Text>
            <Text style={styles.itemDetail}>
              Date & Time: {item.created_at}
            </Text>
            <Text style={styles.itemDetail}>Status: {item.status}</Text>
            <View style={styles.buttonContainer}>
              {item.status === "pending" && (
                <>
                  <TouchableOpacity
                    style={styles.button}
                    onPress={() => handleOrderStatus(item._id, "accepted")}
                  >
                    <Text style={styles.buttonText}>Accept</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.button}
                    onPress={() => handleOrderStatus(item._id, "rejected")}
                  >
                    <Text style={styles.buttonText}>Reject</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        )}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#FFFACD",
  },
  searchBar: {
    height: 40,
    borderColor: "#000",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 20,
    color: "#000",
  },
  item: {
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  itemDetail: {
    color: "#000",
    marginBottom: 5,
  },
  userEmail: {
    fontWeight: "bold",
    marginBottom: 5,
    color: "#000",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  button: {
    backgroundColor: "#ff8c00",
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginHorizontal: 5,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default StaffOrdersScreen;
