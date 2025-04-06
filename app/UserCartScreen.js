// original code from src
// import React, { useContext, useEffect, useState } from 'react';
// import { View, Text, Button, StyleSheet, Alert } from 'react-native';
// import CartContext from '../context/CartContext';
// import OrdersContext from '../context/OrdersContext';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import axios from '../axiosConfig';

// const UserCartScreen = ({ navigation }) => {
//   const { cartItems, updateQuantity, calculateTotal, clearCart, removeFromCart } = useContext(CartContext);
//   const { addOrder } = useContext(OrdersContext);
//   const [userProfile, setUserProfile] = useState({});
//   const [userToken, setUserToken] = useState('');
//   const [foodItems, setFoodItems] = useState([]);

//   useEffect(() => {
//     const fetchUserProfile = async () => {
//       try {
//         const profileData = await AsyncStorage.getItem('userProfile');
//         if (profileData) {
//           const parsedProfile = JSON.parse(profileData);
//           setUserProfile({
//             userId: parsedProfile.id || null,
//             name: parsedProfile.name || 'Anonymous',
//             email: parsedProfile.email || 'user@example.com',
//             phone: parsedProfile.phone || '0000000000',
//           });
//         }
//       } catch (error) {
//         console.error('Error retrieving user profile:', error);
//       }
//     };

//     const fetchUserToken = async () => {
//       try {
//         const response = await axios.get('/get-token', { params: { user_id: 1 } });
//         if (response.data.success) {
//           setUserToken(response.data.token);
//         } else {
//           Alert.alert('Failed to Retrieve Token', response.data.message || 'Please try again later.');
//         }
//       } catch (error) {
//         console.error('Error fetching user token:', error.response || error.message);
//         Alert.alert('Error', 'There was an issue retrieving your token. Please try again.');
//       }
//     };

//     const fetchFoodItems = async () => {
//       try {
//         const response = await axios.get('/food-items');
//         const availableItems = response.data.filter(item => item.available === 1); // Filter for available items
//         const updatedItems = availableItems;

//         setFoodItems(updatedItems);

//         // Check cart items against available items
//         cartItems.forEach(cartItem => {
//           if (!updatedItems.some(item => item.id === cartItem.id)) {
//             removeFromCart(cartItem.id); // Remove unavailable items from the cart
//           }
//         });
//       } catch (error) {
//         console.error('Error fetching food items:', error.message); // Log detailed error
//         alert('Failed to fetch food items. Please try again later.'); // User-friendly error message
//       }
//     };

//     fetchUserProfile();
//     if (userProfile.userId) fetchUserToken(); // Fetch the token if userId is available
//     fetchFoodItems(); // Fetch food items and update availability
//   }, [userProfile.userId]);

//   const increaseQuantity = (itemId) => {
//     updateQuantity(itemId, cartItems.find((item) => item.id === itemId).quantity + 1);
//   };

//   const decreaseQuantity = (itemId) => {
//     const item = cartItems.find((item) => item.id === itemId);
//     if (item.quantity > 1) {
//       updateQuantity(itemId, item.quantity - 1);
//     } else {
//       removeFromCart(itemId);
//     }
//   };

//   const placeOrder = async () => {
//     const newOrder = {
//       userEmail: userProfile.email,
//       userName: userProfile.name,
//       userPhone: userProfile.phone,
//       items: cartItems.map(item => `${item.name} x ${item.quantity}`).join(', '),
//       totalAmount: calculateTotal(),
//       status: 'pending',
//       userToken: userToken, // Use the fetched token here
//       userId: userProfile.userId,
//     };

//     try {
//       const response = await axios.post('/place-order', newOrder);
//       if (response.data.success) {
//         addOrder({ ...newOrder, id: response.data.orderId });
//         Alert.alert('Order Placed', 'Thank you for your order!');
//         clearCart();
//         navigation.navigate('Orders');
//       } else {
//         Alert.alert('Failed to Place Order', 'Please try again later.');
//       }
//     } catch (error) {
//       console.error('Error placing order:', error.response || error.message);
//       Alert.alert('Error', 'There was an issue placing your order. Please try again.');
//     }
//   };

//   return (
//     <View style={styles.container}>
//       {cartItems.length === 0 ? (
//         <Text style={styles.emptyText}>Your cart is empty</Text>
//       ) : (
//         <>
//           {cartItems.map((item) => (
//             <View key={item.id} style={styles.card}>
//               <View style={styles.itemDetails}>
//                 <Text style={styles.itemName}>{item.name}</Text>
//                 <Text style={styles.itemDescription}>{item.description}</Text>
//               </View>
//               <View style={styles.quantityContainer}>
//                 <Button title="-" onPress={() => decreaseQuantity(item.id)} color="#ff8c00" />
//                 <Text style={styles.quantity}>{item.quantity}</Text>
//                 <Button title="+" onPress={() => increaseQuantity(item.id)} color="#ff8c00" />
//               </View>
//               <Text style={styles.itemPrice}>{(item.price * item.quantity).toFixed(2)}</Text>
//             </View>
//           ))}
//           <Text style={styles.total}>Total: {calculateTotal().toFixed(2)}</Text>
//           <Button title="Place Order" onPress={placeOrder} color="#ff8c00" />
//         </>
//       )}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 20,
//     backgroundColor: '#EEE8AA',
//   },
//   card: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     padding: 15,
//     backgroundColor: '#fff',
//     borderRadius: 10,
//     marginBottom: 20,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 8,
//     elevation: 5,
//   },
//   itemDetails: {
//     flex: 1,
//     marginRight: 10,
//   },
//   itemName: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     marginBottom: 5,
//     color:'#000',

//   },
//   itemDescription: {
//     fontSize: 14,
//     color: '#555',
//   },
//   quantityContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginTop: -40,

//   },
//   quantity: {
//     marginHorizontal: 10,
//     fontSize: 18,
//     color:'#000',
//   },
//   itemPrice: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     marginLeft: 10,
//     color:'#000',

//   },
//   total: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     marginVertical: 20,
//     textAlign: 'center',
//     color:'#000',

//   },
//   emptyText: {
//     fontSize: 18,
//     textAlign: 'center',
//     marginVertical: 20,
//     color:'#000',

//   },
// });

// export default UserCartScreen;

// import React, { useContext, useEffect, useState } from "react";
// import { View, Text, Button, StyleSheet, Alert } from "react-native";
// import { useRouter } from "expo-router";
// import CartContext from "../context/CartContext";
// import OrdersContext from "../context/OrdersContext";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import axios from "../axiosConfig";

// const UserCartScreen = () => {
//   const router = useRouter();
//   const {
//     cartItems,
//     updateQuantity,
//     calculateTotal,
//     clearCart,
//     removeFromCart,
//   } = useContext(CartContext);
//   const { addOrder } = useContext(OrdersContext);
//   const [userProfile, setUserProfile] = useState({});
//   const [userToken, setUserToken] = useState("");
//   const [foodItems, setFoodItems] = useState([]);

//   useEffect(() => {
//     const fetchUserProfile = async () => {
//       try {
//         const profileData = await AsyncStorage.getItem("userProfile");
//         if (profileData) {
//           const parsedProfile = JSON.parse(profileData);
//           setUserProfile({
//             userId: parsedProfile.id || null,
//             name: parsedProfile.name || "Anonymous",
//             email: parsedProfile.email || "user@example.com",
//             phone: parsedProfile.phone || "0000000000",
//           });
//         }
//       } catch (error) {
//         console.error("Error retrieving user profile:", error);
//       }
//     };

//     const fetchUserToken = async () => {
//       try {
//         const response = await axios.get("/get-token", {
//           params: { user_id: userProfile.userId },
//         });
//         if (response.data.success) {
//           setUserToken(response.data.token);
//         }
//       } catch (error) {
//         console.error("Error fetching user token:", error);
//       }
//     };

//     fetchUserProfile();
//     if (userProfile.userId) fetchUserToken();
//   }, [userProfile.userId]);

//   const placeOrder = async () => {
//     const newOrder = {
//       userEmail: userProfile.email,
//       userName: userProfile.name,
//       userPhone: userProfile.phone,
//       items: cartItems
//         .map((item) => `${item.name} x ${item.quantity}`)
//         .join(", "),
//       totalAmount: calculateTotal(),
//       status: "pending",
//       userToken: userToken,
//       userId: userProfile.userId,
//     };

//     try {
//       const response = await axios.post("/place-order", newOrder);

//       if (response.data.success) {
//         addOrder({ ...newOrder, id: response.data.orderId });

//         // Navigate to PaymentScreen and pass order details
//         // router.push({
//         //   pathname: "/PaymentScreen",
//         //   params: {
//         //     orderId: response.data.orderId,
//         //     totalAmount: newOrder.totalAmount,
//         //   },
//         // });

//         // clear the current cart since the order is placed successfully
//         // redirect to the orders page so that user can check that the order is successfully placed
//         clearCart()
//         router.push("/OrdersScreen")
//       }
//     } catch (error) {
//       console.error("Error placing order:", error);
//       Alert.alert("Error", "There was an issue placing your order.");
//     }
//   };

//   // const placeOrder = async () => {
//   //   const newOrder = {
//   //     userEmail: userProfile.email,
//   //     userName: userProfile.name,
//   //     userPhone: userProfile.phone,
//   //     items: cartItems
//   //       .map((item) => `${item.name} x ${item.quantity}`)
//   //       .join(", "),
//   //     totalAmount: calculateTotal(),
//   //     status: "pending",
//   //     userToken: userToken,
//   //     userId: userProfile.userId,
//   //   };

//   //   try {
//   //     const response = await axios.post("/place-order", newOrder);
//   //     if (response.data.success) {
//   //       addOrder({ ...newOrder, id: response.data.orderId });
//   //       Alert.alert("Order Placed", "Thank you for your order!");
//   //       clearCart();
//   //       router.push("/orders");
//   //     }
//   //   } catch (error) {
//   //     console.error("Error placing order:", error);
//   //     Alert.alert("Error", "There was an issue placing your order.");
//   //   }
//   // };

//   return (
//     <View style={styles.container}>
//       {cartItems.length === 0 ? (
//         <Text style={styles.emptyText}>Your cart is empty</Text>
//       ) : (
//         <>
//           {cartItems.map((item, index) => (
//             <View key={index} style={styles.card}>
//               <View style={styles.itemDetails}>
//                 <Text style={styles.itemName}>{item.name}</Text>
//               </View>
//               <View style={styles.quantityContainer}>
//                 <Button
//                   title="-"
//                   onPress={() => updateQuantity(item.id, item.quantity - 1)}
//                   color="#ff8c00"
//                 />
//                 <Text style={styles.quantity}>{item.quantity}</Text>
//                 <Button
//                   title="+"
//                   onPress={() => updateQuantity(item.id, item.quantity + 1)}
//                   color="#ff8c00"
//                 />
//               </View>
//               <Text style={styles.itemPrice}>
//                 ₹{(item.price * item.quantity).toFixed(2)}
//               </Text>
//             </View>
//           ))}
//           <Text style={styles.total}>
//             Total: ₹{calculateTotal().toFixed(2)}
//           </Text>
//           <Button title="Place Order" onPress={placeOrder} color="#ff8c00" />
//         </>
//       )}
//     </View>
//   );
// };

import React, { useContext, useEffect, useState } from "react";
import { View, Text, Button, StyleSheet, Alert } from "react-native";
import { useRouter } from "expo-router";
import CartContext from "../context/CartContext";
import OrdersContext from "../context/OrdersContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "../axiosConfig";

const UserCartScreen = () => {
  const router = useRouter();
  const { cartItems, updateQuantity, calculateTotal, clearCart } =
    useContext(CartContext);
  const { addOrder } = useContext(OrdersContext);

  const [userProfile, setUserProfile] = useState({});
  const [userToken, setUserToken] = useState("");

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const profileData = await AsyncStorage.getItem("userProfile");
        if (profileData) {
          const parsedProfile = JSON.parse(profileData);
          setUserProfile({
            userId: parsedProfile.id || null,
            name: parsedProfile.name || "Anonymous",
            email: parsedProfile.email || "user@example.com",
            phone: parsedProfile.phone || "0000000000",
          });
        }
      } catch (error) {
        console.error("Error retrieving user profile:", error);
      }
    };

    fetchUserProfile();
  }, []);

  useEffect(() => {
    const fetchUserToken = async () => {
      if (!userProfile.userId) return;
      try {
        const response = await axios.get("/get-token", {
          params: { user_id: userProfile.userId },
        });
        if (response.data.success) {
          setUserToken(response.data.token);
        }
      } catch (error) {
        console.error("Error fetching user token:", error);
      }
    };

    fetchUserToken();
  }, [userProfile.userId]);

  const placeOrder = async () => {
    const newOrder = {
      userEmail: userProfile.email,
      userName: userProfile.name,
      userPhone: userProfile.phone,
      items: cartItems
        .map((item) => `${item.name} x ${item.quantity}`)
        .join(", "),
      totalAmount: calculateTotal(),
      status: "pending",
      userToken: userToken,
      userId: userProfile.userId,
    };

    try {
      const response = await axios.post("/place-order", newOrder);
      if (response.data.success) {
        addOrder({ ...newOrder, id: response.data.orderId });
        clearCart();
        router.push("/OrdersScreen");
      }
    } catch (error) {
      console.error("Error placing order:", error);
      Alert.alert("Error", "There was an issue placing your order.");
    }
  };

  return (
    <View style={styles.container}>
      {cartItems.length === 0 ? (
        <Text style={styles.emptyText}>Your cart is empty</Text>
      ) : (
        <>
          {cartItems.map((item, index) => (
            <View key={index} style={styles.card}>
              <View style={styles.itemDetails}>
                <Text style={styles.itemName}>{item.name}</Text>
              </View>
              <View style={styles.quantityContainer}>
                <Button
                  title="-"
                  onPress={() => updateQuantity(item.id, item.quantity - 1)}
                  color="#ff8c00"
                />
                <Text style={styles.quantity}>{item.quantity}</Text>
                <Button
                  title="+"
                  onPress={() => updateQuantity(item.id, item.quantity + 1)}
                  color="#ff8c00"
                />
              </View>
              <Text style={styles.itemPrice}>
                ₹{(item.price * item.quantity).toFixed(2)}
              </Text>
            </View>
          ))}
          <Text style={styles.total}>
            Total: ₹{calculateTotal().toFixed(2)}
          </Text>
          <Button title="Place Order" onPress={placeOrder} color="#ff8c00" />
        </>
      )}
    </View>
  );
};

// export default UserCartScreen;
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#EEE8AA",
  },
  card: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 10,
    marginBottom: 20,
  },
  itemDetails: {
    flex: 1,
    marginRight: 10,
  },
  itemName: {
    marginTop: 5,
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  quantity: {
    marginHorizontal: 10,
    fontSize: 18,
    color: "#000",
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
    marginLeft: "12",
    // alignContent:"center"
    marginTop: 5,
  },
  total: {
    fontSize: 18,
    fontWeight: "bold",
    marginVertical: 20,
    textAlign: "center",
    color: "#000",
  },
  emptyText: {
    fontSize: 18,
    textAlign: "center",
    marginVertical: 20,
    color: "#000",
  },
});

export default UserCartScreen;
// import React, { useEffect, useState } from "react";
// import {
//   View,
//   Text,
//   Button,
//   StyleSheet,
//   Alert,
//   FlatList,
//   ActivityIndicator,
// } from "react-native";
// import axios from "../axiosConfig";
// import { useRouter } from "expo-router";
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import Toast from "react-native-toast-message";

// const UserCartScreen = () => {
//   const router = useRouter();
//   const [userProfile, setUserProfile] = useState(null);
//   const [cartItems, setCartItems] = useState([]);
//   const [loading, setLoading] = useState(false);

//   // 🧠 Fetch user info from local storage
//   useEffect(() => {
//     const getUser = async () => {
//       const data = await AsyncStorage.getItem("userProfile");
//       if (data) {
//         const parsed = JSON.parse(data);
//         setUserProfile(parsed);
//       }
//     };
//     getUser();
//   }, []);

//   // 🔄 Fetch cart when userProfile is ready
//   useEffect(() => {
//     if (userProfile?.id) fetchCartItems(userProfile.id);
//   }, [userProfile]);

//   const fetchCartItems = async (userId) => {
//     try {
//       setLoading(true);
//       const response = await axios.get(`/api/cart/${userId}`);
//       console.log("response ", response);
//       setCartItems(response.data.cartItems || []);
//     } catch (err) {
//       console.error("Failed to load cart", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const updateQuantity = async (cartItemId, quantity) => {
//     if (quantity <= 0) {
//       removeFromCart(cartItemId);
//       return;
//     }

//     try {
//       await axios.put(`/api/cart/${cartItemId}`, { quantity });
//       setCartItems((prev) =>
//         prev.map((item) =>
//           item._id === cartItemId ? { ...item, quantity } : item
//         )
//       );
//     } catch (err) {
//       console.error("Failed to update quantity", err);
//     }
//   };

//   const removeFromCart = async (cartItemId) => {
//     try {
//       await axios.delete(`/api/cart/${cartItemId}`);
//       setCartItems((prev) => prev.filter((item) => item._id !== cartItemId));
//     } catch (err) {
//       console.error("Failed to remove item", err);
//     }
//   };

//   const calculateTotal = () => {
//     return cartItems.reduce(
//       (sum, item) => sum + item.product.price * item.quantity,
//       0
//     );
//   };

//   const placeOrder = async () => {
//     const newOrder = {
//       userId: userProfile.id,
//       items: cartItems.map((item) => ({
//         productId: item.product._id,
//         name: item.product.name,
//         quantity: item.quantity,
//         price: item.product.price,
//       })),
//       totalAmount: calculateTotal(),
//     };

//     try {
//       const response = await axios.post("/api/orders", newOrder);
//       if (response.data.success) {
//         Toast.show({
//           type: "success",
//           text2: "Your order has been placed!",
//         });
//         setCartItems([]);
//         router.replace("/OrdersScreen");
//       }
//     } catch (error) {
//       console.error("Order failed", error);
//       Alert.alert("Error", "Could not place order.");
//     }
//   };

//   const renderItem = ({ item }) => (
//     <View key={item._id} style={styles.card}>
//       <View style={styles.itemDetails}>
//         <Text style={styles.itemName}>{item.product.name}</Text>
//       </View>
//       <View style={styles.quantityContainer}>
//         <Button
//           title="-"
//           onPress={() => updateQuantity(item._id, item.quantity - 1)}
//           color="#ff8c00"
//         />
//         <Text style={styles.quantity}>{item.quantity}</Text>
//         <Button
//           title="+"
//           onPress={() => updateQuantity(item._id, item.quantity + 1)}
//           color="#ff8c00"
//         />
//       </View>
//       <Text style={styles.itemPrice}>
//         ${(item.product.price * item.quantity).toFixed(2)}
//       </Text>
//     </View>
//   );

//   if (loading) {
//     return (
//       <View style={styles.container}>
//         <ActivityIndicator size="large" color="#ff8c00" />
//       </View>
//     );
//   }
//   {
//     console.log(cartItems);
//   }

//   return (
//     <View style={styles.container}>
//       {cartItems.length === 0 ? (
//         <Text style={styles.emptyText}>Your cart is empty</Text>
//       ) : (
//         <>
//           <FlatList
//             data={cartItems}
//             keyExtractor={(item) => item._id}
//             renderItem={renderItem}
//           />
//           <Text style={styles.total}>
//             Total: ${calculateTotal().toFixed(2)}
//           </Text>
//           <Button title="Place Order" onPress={placeOrder} color="#ff8c00" />
//         </>
//       )}
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 20,
//     backgroundColor: "#EEE8AA",
//   },
//   card: {
//     flexDirection: "row",
//     justifyContent: "space-between",
//     padding: 15,
//     backgroundColor: "#fff",
//     borderRadius: 10,
//     marginBottom: 20,
//   },
//   itemDetails: {
//     flex: 1,
//     marginRight: 10,
//   },
//   itemName: {
//     fontSize: 16,
//     fontWeight: "bold",
//     color: "#000",
//   },
//   quantityContainer: {
//     flexDirection: "row",
//     alignItems: "center",
//   },
//   quantity: {
//     marginHorizontal: 10,
//     fontSize: 18,
//     color: "#000",
//   },
//   itemPrice: {
//     fontSize: 16,
//     fontWeight: "bold",
//     color: "#000",
//   },
//   total: {
//     fontSize: 18,
//     fontWeight: "bold",
//     marginVertical: 20,
//     textAlign: "center",
//     color: "#000",
//   },
//   emptyText: {
//     fontSize: 18,
//     textAlign: "center",
//     marginVertical: 20,
//     color: "#000",
//   },
// });

// export default UserCartScreen;

// // import React, { useContext, useEffect, useState } from "react";
// // import { View, Text, Button, StyleSheet, Alert } from "react-native";
// // import { useRouter } from "expo-router";
// // import CartContext from "../context/CartContext";
// // import OrdersContext from "../context/OrdersContext";
// // import AsyncStorage from "@react-native-async-storage/async-storage";
// // import axios from "../axiosConfig";
// // import Toast from "react-native-toast-message";

// // const UserCartScreen = () => {
// //   const router = useRouter();
// //   const {
// //     cartItems,
// //     updateQuantity,
// //     calculateTotal,
// //     clearCart,
// //     removeFromCart,
// //   } = useContext(CartContext);
// //   const { addOrder } = useContext(OrdersContext);
// //   const [userProfile, setUserProfile] = useState({});
// //   const [userToken, setUserToken] = useState("");
// //   const [foodItems, setFoodItems] = useState([]);

// //   useEffect(() => {
// //     const fetchUserProfile = async () => {
// //       try {
// //         const profileData = await AsyncStorage.getItem("userProfile");
// //         if (profileData) {
// //           const parsedProfile = JSON.parse(profileData);
// //           setUserProfile({
// //             userId: parsedProfile.id || null,
// //             name: parsedProfile.name || "Anonymous",
// //             email: parsedProfile.email || "user@example.com",
// //             phone: parsedProfile.phone || "0000000000",
// //           });
// //         }
// //       } catch (error) {
// //         console.error("Error retrieving user profile:", error);
// //       }
// //     };

// //     const fetchUserToken = async () => {
// //       try {
// //         const response = await axios.get("/get-token", {
// //           params: { user_id: userProfile.userId },
// //         });
// //         if (response.data.success) {
// //           setUserToken(response.data.token);
// //         }
// //       } catch (error) {
// //         console.error("Error fetching user token:", error);
// //       }
// //     };

// //     fetchUserProfile();
// //     if (userProfile.userId) fetchUserToken();
// //   }, [userProfile.userId]);

// //   const placeOrder = async () => {
// //     const newOrder = {
// //       userEmail: userProfile.email,
// //       userName: userProfile.name,
// //       userPhone: userProfile.phone,
// //       items: cartItems
// //         .map((item) => `${item.name} x ${item.quantity}`)
// //         .join(", "),
// //       totalAmount: calculateTotal(),
// //       status: "pending",
// //       userToken: userToken,
// //       userId: userProfile.userId,
// //     };

// //     try {
// //       const response = await axios.post("/place-order", newOrder);

// //       if (response.data.success) {
// //         addOrder({ ...newOrder, id: response.data.orderId });

// //         clearCart(); // Clear cart context
// //         Toast.show({
// //           type: "success",
// //           text2: "Your order has been placed.",
// //           position: "top",
// //           visibilityTime: 2300,
// //         });

// //         router.replace("/OrdersScreen");
// //       }
// //     } catch (error) {
// //       console.error("Error placing order:", error);
// //       Alert.alert("Error", "There was an issue placing your order.");
// //     }
// //   };

// //   return (
// //     <View style={styles.container}>
// //       {cartItems.length === 0 ? (
// //         <Text style={styles.emptyText}>Your cart is empty</Text>
// //       ) : (
// //         <>
// //           {cartItems.map((item, index) => (
// //             <View
// //               key={item.id ? item.id.toString() : `${item.name}-${index}`}
// //               style={styles.card}
// //             >
// //               <View style={styles.itemDetails}>
// //                 <Text style={styles.itemName}>{item.name}</Text>
// //               </View>
// //               <View style={styles.quantityContainer}>
// //                 <Button
// //                   title="-"
// //                   onPress={() => updateQuantity(item.id, item.quantity - 1)}
// //                   color="#ff8c00"
// //                 />
// //                 <Text style={styles.quantity}>{item.quantity}</Text>
// //                 <Button
// //                   title="+"
// //                   onPress={() => updateQuantity(item.id, item.quantity + 1)}
// //                   color="#ff8c00"
// //                 />
// //               </View>
// //               <Text style={styles.itemPrice}>
// //                 {(item.price * item.quantity).toFixed(2)}
// //               </Text>
// //             </View>
// //           ))}
// //           <Text style={styles.total}>Total: {calculateTotal().toFixed(2)}</Text>
// //           <Button title="Place Order" onPress={placeOrder} color="#ff8c00" />
// //         </>
// //       )}
// //     </View>
// //   );
// // };

// // const styles = StyleSheet.create({
// //   container: {
// //     flex: 1,
// //     padding: 20,
// //     backgroundColor: "#EEE8AA",
// //   },
// //   card: {
// //     flexDirection: "row",
// //     justifyContent: "space-between",
// //     padding: 15,
// //     backgroundColor: "#fff",
// //     borderRadius: 10,
// //     marginBottom: 20,
// //   },
// //   itemDetails: {
// //     flex: 1,
// //     marginRight: 10,
// //   },
// //   itemName: {
// //     fontSize: 16,
// //     fontWeight: "bold",
// //     color: "#000",
// //   },
// //   quantityContainer: {
// //     flexDirection: "row",
// //     alignItems: "center",
// //   },
// //   quantity: {
// //     marginHorizontal: 10,
// //     fontSize: 18,
// //     color: "#000",
// //   },
// //   itemPrice: {
// //     fontSize: 16,
// //     fontWeight: "bold",
// //     color: "#000",
// //   },
// //   total: {
// //     fontSize: 18,
// //     fontWeight: "bold",
// //     marginVertical: 20,
// //     textAlign: "center",
// //     color: "#000",
// //   },
// //   emptyText: {
// //     fontSize: 18,
// //     textAlign: "center",
// //     marginVertical: 20,
// //     color: "#000",
// //   },
// // });

// // export default UserCartScreen;

// // // import React, { useContext, useEffect, useState } from "react";
// // // import { View, Text, Button, StyleSheet, Alert } from "react-native";
// // // import { useRouter } from "expo-router";
// // // import CartContext from "../context/CartContext";
// // // import OrdersContext from "../context/OrdersContext";
// // // import AsyncStorage from "@react-native-async-storage/async-storage";
// // // import axios from "../axiosConfig";
// // // import Toast, { BaseToast } from "react-native-toast-message";

// // // const UserCartScreen = () => {
// // //   const router = useRouter();
// // //   const {
// // //     cartItems,
// // //     updateQuantity,
// // //     calculateTotal,
// // //     clearCart,
// // //     removeFromCart,
// // //   } = useContext(CartContext);
// // //   const { addOrder } = useContext(OrdersContext);
// // //   const [userProfile, setUserProfile] = useState({});
// // //   const [userToken, setUserToken] = useState("");
// // //   const [foodItems, setFoodItems] = useState([]);

// // //   useEffect(() => {
// // //     const fetchUserProfile = async () => {
// // //       try {
// // //         const profileData = await AsyncStorage.getItem("userProfile");
// // //         if (profileData) {
// // //           const parsedProfile = JSON.parse(profileData);
// // //           setUserProfile({
// // //             userId: parsedProfile.id || null,
// // //             name: parsedProfile.name || "Anonymous",
// // //             email: parsedProfile.email || "user@example.com",
// // //             phone: parsedProfile.phone || "0000000000",
// // //           });
// // //         }
// // //       } catch (error) {
// // //         console.error("Error retrieving user profile:", error);
// // //       }
// // //     };

// // //     const fetchUserToken = async () => {
// // //       try {
// // //         const response = await axios.get("/get-token", {
// // //           params: { user_id: userProfile.userId },
// // //         });
// // //         if (response.data.success) {
// // //           setUserToken(response.data.token);
// // //         }
// // //       } catch (error) {
// // //         console.error("Error fetching user token:", error);
// // //       }
// // //     };

// // //     fetchUserProfile();
// // //     if (userProfile.userId) fetchUserToken();
// // //   }, [userProfile.userId]);

// // //   const placeOrder = async () => {
// // //     const newOrder = {
// // //       userEmail: userProfile.email,
// // //       userName: userProfile.name,
// // //       userPhone: userProfile.phone,
// // //       items: cartItems
// // //         .map((item) => `${item.name} x ${item.quantity}`)
// // //         .join(", "),
// // //       totalAmount: calculateTotal(),
// // //       status: "pending",
// // //       userToken: userToken,
// // //       userId: userProfile.userId,
// // //     };

// // //     try {
// // //       const response = await axios.post("/place-order", newOrder);

// // //       if (response.data.success) {
// // //         addOrder({ ...newOrder, id: response.data.orderId });

// // //         // Navigate to PaymentScreen and pass order details
// // //         // router.push({
// // //         //   pathname: "/PaymentScreen",
// // //         //   params: {
// // //         //     orderId: response.data.orderId,
// // //         //     totalAmount: newOrder.totalAmount,
// // //         //   },
// // //         clearCart(); // Clear cart context
// // //         Toast.show({
// // //           type: "success", // custom type
// // //           text2: "Your order has been placed.",
// // //           position: "top",
// // //           visibilityTime: 2300,
// // //         });

// // //         router.replace("/OrdersScreen");
// // //       }
// // //     } catch (error) {
// // //       console.error("Error placing order:", error);
// // //       Alert.alert("Error", "There was an issue placing your order.");
// // //     }
// // //   };

// // //   // const placeOrder = async () => {
// // //   //   const newOrder = {
// // //   //     userEmail: userProfile.email,
// // //   //     userName: userProfile.name,
// // //   //     userPhone: userProfile.phone,
// // //   //     items: cartItems
// // //   //       .map((item) => `${item.name} x ${item.quantity}`)
// // //   //       .join(", "),
// // //   //     totalAmount: calculateTotal(),
// // //   //     status: "pending",
// // //   //     userToken: userToken,
// // //   //     userId: userProfile.userId,
// // //   //   };

// // //   //   try {
// // //   //     const response = await axios.post("/place-order", newOrder);
// // //   //     if (response.data.success) {
// // //   //       addOrder({ ...newOrder, id: response.data.orderId });
// // //   //       Alert.alert("Order Placed", "Thank you for your order!");
// // //   //       clearCart();
// // //   //       router.push("/orders");
// // //   //     }
// // //   //   } catch (error) {
// // //   //     console.error("Error placing order:", error);
// // //   //     Alert.alert("Error", "There was an issue placing your order.");
// // //   //   }
// // //   // };

// // //   return (
// // //     <View style={styles.container}>
// // //       {cartItems.length === 0 ? (
// // //         <Text style={styles.emptyText}>Your cart is empty</Text>
// // //       ) : (
// // //         <>
// // //           {cartItems.map((item) => (
// // //             <View key={item.id} style={styles.card}>
// // //               <View style={styles.itemDetails}>
// // //                 <Text style={styles.itemName}>{item.name}</Text>
// // //               </View>
// // //               <View style={styles.quantityContainer}>
// // //                 <Button
// // //                   title="-"
// // //                   onPress={() => updateQuantity(item.id, item.quantity - 1)}
// // //                   color="#ff8c00"
// // //                 />
// // //                 <Text style={styles.quantity}>{item.quantity}</Text>
// // //                 <Button
// // //                   title="+"
// // //                   onPress={() => updateQuantity(item.id, item.quantity + 1)}
// // //                   color="#ff8c00"
// // //                 />
// // //               </View>
// // //               <Text style={styles.itemPrice}>
// // //                 {(item.price * item.quantity).toFixed(2)}
// // //               </Text>
// // //             </View>
// // //           ))}
// // //           <Text style={styles.total}>Total: {calculateTotal().toFixed(2)}</Text>
// // //           {/* <Button
// // //             title="Show Toast"
// // //             onPress={() => {
// // //               Toast.show({
// // //                 type: "info",
// // //                 text1: "Test Toast",
// // //                 text2: "If you see this, it works!",
// // //               });
// // //             }}
// // //           /> */}

// // //           <Button title="Place Order" onPress={placeOrder} color="#ff8c00" />
// // //           {/* <Toast config={toastConfig} /> */}
// // //         </>
// // //       )}
// // //     </View>
// // //   );
// // // };

// // // const styles = StyleSheet.create({
// // //   container: {
// // //     flex: 1,
// // //     padding: 20,
// // //     backgroundColor: "#EEE8AA",
// // //   },
// // //   card: {
// // //     flexDirection: "row",
// // //     justifyContent: "space-between",
// // //     padding: 15,
// // //     backgroundColor: "#fff",
// // //     borderRadius: 10,
// // //     marginBottom: 20,
// // //   },
// // //   itemDetails: {
// // //     flex: 1,
// // //     marginRight: 10,
// // //   },
// // //   itemName: {
// // //     fontSize: 16,
// // //     fontWeight: "bold",
// // //     color: "#000",
// // //   },
// // //   quantityContainer: {
// // //     flexDirection: "row",
// // //     alignItems: "center",
// // //   },
// // //   quantity: {
// // //     marginHorizontal: 10,
// // //     fontSize: 18,
// // //     color: "#000",
// // //   },
// // //   itemPrice: {
// // //     fontSize: 16,
// // //     fontWeight: "bold",
// // //     color: "#000",
// // //   },
// // //   total: {
// // //     fontSize: 18,
// // //     fontWeight: "bold",
// // //     marginVertical: 20,
// // //     textAlign: "center",
// // //     color: "#000",
// // //   },
// // //   emptyText: {
// // //     fontSize: 18,
// // //     textAlign: "center",
// // //     marginVertical: 20,
// // //     color: "#000",
// // //   },
// // // });

// // // export default UserCartScreen;
