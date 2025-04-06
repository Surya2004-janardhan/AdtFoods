// import { View, Text, Button, ScrollView } from "react-native";
// import { useRouter } from "expo-router";

// export default function IndexScreen() {
//   const router = useRouter();

//   return (
//     <ScrollView contentContainerStyle={{ padding: 20 }}>
//       <Text style={{ fontSize: 22, fontWeight: "bold", marginBottom: 20 }}>
//         Welcome to the Home Screen!
//       </Text>
//       <Button
//         title="Go to Authentication"
//         onPress={() => router.push("/AuthScreen")}
//       />
//       <Button
//         title="Go to User Food Items"
//         onPress={() => router.push("/UserFoodItemsScreen")}
//       />
//       <Button
//         title="Go to User Cart"
//         onPress={() => router.push("/UserCartScreen")}
//       />
//       <Button
//         title="Go to Staff Food Items"
//         onPress={() => router.push("/StaffFoodItemsScreen")}
//       />
//       <Button
//         title="Go to Staff Orders"
//         onPress={() => router.push("/StaffOrdersScreen")}
//       />
//       <Button
//         title="Go to Orders"
//         onPress={() => router.push("/OrdersScreen")}
//       />
//       <Button
//         title="Go to Account"
//         onPress={() => router.push("/AccountScreen")}
//       />
//       <Button
//         title="Go to Sign Up"
//         onPress={() => router.push("/SignUpScreen")}
//       />
//     </ScrollView>
//   );
// }

// import {
//   View,
//   Text,
//   FlatList,
//   TouchableOpacity,
//   Image,
//   StyleSheet,
// } from "react-native";
// import { useRouter } from "expo-router";

// export default function IndexScreen() {
//   const router = useRouter();

//   const screens = [
//     { name: "Auth", screen: "AuthScreen", icon: "🔑" },
//     { name: "User Food Items", screen: "UserFoodItemsScreen", icon: "🍔" },
//     { name: "User Cart", screen: "UserCartScreen", icon: "🛒" },
//     { name: "Staff Food Items", screen: "StaffFoodItemsScreen", icon: "🍽️" },
//     { name: "Staff Orders", screen: "StaffOrdersScreen", icon: "📦" },
//     { name: "Orders", screen: "OrdersScreen", icon: "📋" },
//     { name: "Account", screen: "AccountScreen", icon: "👤" },
//     { name: "Sign Up", screen: "SignUpScreen", icon: "📝" },
//   ];

//   return (
//     <View style={styles.container}>
//       <Text style={styles.header}>Welcome to the Food Ordering App! 🍕</Text>
//       <FlatList
//         data={screens}
//         keyExtractor={(item) => item.screen}
//         renderItem={({ item }) => (
//           <TouchableOpacity
//             style={styles.card}
//             onPress={() => router.push(`/${item.screen}`)}
//           >
//             <Text style={styles.icon}>{item.icon}</Text>
//             <Text style={styles.title}>{item.name}</Text>
//           </TouchableOpacity>
//         )}
//       />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 20,
//     backgroundColor: "#F8F9FA",
//   },
//   header: {
//     fontSize: 24,
//     fontWeight: "bold",
//     marginBottom: 20,
//     textAlign: "center",
//   },
//   card: {
//     backgroundColor: "#FFF",
//     padding: 15,
//     marginVertical: 10,
//     borderRadius: 10,
//     flexDirection: "row",
//     alignItems: "center",
//     shadowColor: "#000",
//     shadowOpacity: 0.1,
//     shadowOffset: { width: 0, height: 2 },
//     elevation: 3,
//   },
//   icon: {
//     fontSize: 24,
//     marginRight: 10,
//   },
//   title: {
//     fontSize: 18,
//     fontWeight: "500",
//   },
// });

import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
// import Toast from "react-native-toast-message";
import { CartProvider } from "../context/CartContext";
import { OrdersProvider } from "../context/OrdersContext";

export default function IndexScreen() {
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check internet connectivity
    const unsubscribe = NetInfo.addEventListener((state) => {
      if (state.isConnected) {
        if (!isConnected) {
          Toast.show({
            type: "success",
            position: "top",
            text1: "Connected to the Internet",
            visibilityTime: 3000,
            autoHide: true,
            topOffset: 40,
            style: { backgroundColor: "lightgreen" },
          });
        }
      } else {
        if (isConnected) {
          Toast.show({
            type: "error",
            position: "top",
            text1: "No Internet Connection, please connect",
            visibilityTime: 0,
            autoHide: false,
            topOffset: 40,
            style: { backgroundColor: "red" },
          });
        }
      }
      setIsConnected(state.isConnected);
    });

    return () => unsubscribe();
  }, [isConnected]);

  useEffect(() => {
    const checkLoginState = async () => {
      try {
        const userToken = await AsyncStorage.getItem("userToken");

        if (userToken === "staff") {
          router.replace("/StaffFoodItemsScreen");
        } else if (userToken) {
          router.replace("/HomeScreen");
        } else {
          router.replace("/AuthScreen");
        }
      } catch (error) {
        console.error("Error checking login state:", error);
      } finally {
        setLoading(false);
      }
    };

    checkLoginState();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <CartProvider>
        <OrdersProvider>
          {/* <Toast /> */}
        </OrdersProvider>
      </CartProvider>
    </View>
  );
}
