import React, { useState, useEffect, useContext, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import axios from "../axiosConfig";
import CartContext from "../context/CartContext";
const UserFoodItemsScreen = () => {
  const [foodItems, setFoodItems] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  // const navigation = useNavigation();
  const router = useRouter(); // ✅ Use router instead of navigation

  const { cartItems, addToCart } = useContext(CartContext);

  const fetchFoodItems = async () => {
    try {
      const response = await axios.get("/food-items");
      // console.log("responsee from rouet ," ,response)
      const availableItems = response.data.filter((item) => item.available); // Filter for available items
      const updatedItems = availableItems.map((item) => ({
        ...item,
        price: parseFloat(item.price), // Ensure price is a number
        quantity: 0, // Initialize quantity to zero
      }));
      setFoodItems(updatedItems);
    } catch (error) {
      console.error("Error fetching food items:", error.message); // Log detailed error
      alert("Failed to fetch food items. Please try again later."); // User-friendly error message
    }
  };
  console.log(foodItems);

  useEffect(() => {
    fetchFoodItems();
  }, []);
  useFocusEffect(
    useCallback(() => {
      setFoodItems((prevItems) =>
        prevItems.map((item) => {
          const cartItem = cartItems.find((c) => c.id === item.id);
          return {
            ...item,
            quantity: cartItem ? cartItem.quantity : 0,
          };
        })
      );
    }, [cartItems])
  );

  // useFocusEffect(
  //   useCallback(() => {
  //     // Reset quantities to zero when the screen is focused
  //     setFoodItems((prevItems) =>
  //       prevItems.map((item) => ({ ...item, quantity: 0 }))
  //     );
  //   }, [])
  // );
  const updateQuantity = (id, increment) => {
    setFoodItems((prevItems) => {
      const updatedItems = prevItems.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(0, item.quantity + increment) }
          : item
      );

      const updatedItem = updatedItems.find((item) => item.id === id);

      // Always call addToCart to reflect the latest quantity
      addToCart(updatedItem);

      return updatedItems;
    });
  };

  // const updateQuantity = (id, increment) => {
  //   setFoodItems((prevItems) => {
  //     const updatedItems = prevItems.map((item) =>
  //       item.id === id
  //         ? { ...item, quantity: Math.max(0, item.quantity + increment) }
  //         : item
  //     );

  //     const updatedItem = updatedItems.find((item) => item.id === id);

  //     if (increment > 0) {
  //       addToCart(updatedItem); // ✅ use full updated item with correct quantity
  //     }

  //     return updatedItems;
  //   });
  // };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchFoodItems().finally(() => setRefreshing(false));
  }, []);

  // console.log(foodItems);
  console.log(cartItems);

  return (
    <View style={styles.container}>
      <FlatList
        data={foodItems}
        // keyExtractor={(item, index) =>
        //   (item.id ?? item.id ?? index).toString()
        // }
        keyExtractor={(item) => item.id.toString()}
        // {item.id}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text>DUmmy</Text>
            <Image source={{ uri: item.image }} style={styles.itemImage} />
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemDescription}>{item.description}</Text>
            <Text style={styles.itemPrice}>{item.price}</Text>
            <View style={styles.quantityContainer}>
              <TouchableOpacity
                onPress={() => updateQuantity(item.id, -1)}
                style={styles.quantityButton}
              >
                <Text style={styles.quantityButtonText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.quantityText}>{item.quantity}</Text>
              <TouchableOpacity
                onPress={() => updateQuantity(item.id, 1)}
                style={styles.quantityButton}
              >
                <Text style={styles.quantityButtonText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        // refreshControl={
        //   <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        // }
      />
      <View style={styles.bottomNavigation}>
        <TouchableOpacity
          onPress={() => router.push("/UserCartScreen")}
          style={styles.navButton}
        >
          <View style={styles.iconContainer}>
            <Text style={styles.navIcon}>🛒</Text>
            {cartItems.length > 0 && (
              <View style={styles.cartCountContainer}>
                <Text style={styles.cartCountText}>
                  {cartItems.reduce((total, item) => total + item.quantity, 0)}
                </Text>
              </View>
            )}
          </View>
          <Text style={styles.navText}>Checkout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#EEE8AA",
  },
  item: {
    marginBottom: 20,
    padding: 20,
    backgroundColor: "#ffffff",
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  itemImage: {
    width: "100%",
    height: 200,
    borderRadius: 15,
  },
  itemName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginTop: 10,
  },
  itemDescription: {
    fontSize: 16,
    color: "#666",
    marginTop: 5,
  },
  itemPrice: {
    fontSize: 18,
    color: "#333",
    marginTop: 5,
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 15,
  },
  quantityButton: {
    backgroundColor: "#ff8c00",
    padding: 10,
    borderRadius: 5,
  },
  quantityButtonText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  quantityText: {
    fontSize: 20,
    marginHorizontal: 20,
    color: "#000",
  },
  bottomNavigation: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 10,
    backgroundColor: "#ff8c00",
    borderRadius: 10,
    marginBottom: -8,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  navButton: {
    alignItems: "center",
  },
  iconContainer: {
    position: "relative",
    alignItems: "center",
  },
  navIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
    display: "flex",
    marginBottom: 0,
    lineHeight: 40, // This ensures the text is vertically centered
    fontSize: 20,
    paddingLeft: 10, // Move the inner icon to the right
  },
  cartCountContainer: {
    position: "absolute",
    top: -5,
    right: -10,
    backgroundColor: "#9370DB",
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  cartCountText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  navText: {
    fontSize: 12,
    color: "#f8f8f8",
    marginTop: 5,
  },
});

export default UserFoodItemsScreen;
