// import React, { useEffect, useState } from "react";
// import { NavigationContainer } from "@react-navigation/native";
// import { createStackNavigator } from "@react-navigation/stack";
// import { ActivityIndicator, View } from "react-native";
// import Login from "./src/Login";
// import HomeScreen from "./src/HomeScreen";
// import AccountScreen from "./src/AccountScreen";
// import UserFoodItemsScreen from "./src/UserFoodItemsScreen";
// import Orders from "./src/Orders";
// import Checkout from "./src/Checkout";
// import * as Device from "expo-device";
// import CONFIG from "./config";

// export default function App() {
//   const [initialRoute, setInitialRoute] = useState("Login");
//   const Stack = createStackNavigator();

//   useEffect(() => {
//     const init = async () => {
//       const deviceId =
//         Device.osInternalBuildId || Device.osBuildId || "unknown";

//       try {
//         const response = await fetch(`${CONFIG.API_BASE_URL}/verify-token`, {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({ token: deviceId }),
//         });

//         const data = await response.json();
//         console.log("Token check response:", data);

//         if (data && data.valid) {
//           setInitialRoute("HomeScreen");
//         } else {
//           setInitialRoute("Login");
//         }
//       } catch (error) {
//         console.log("Token verification error:", error);
//         setInitialRoute("Login");
//       }
//     };

//     init();
//   }, []);

//   if (!initialRoute) {
//     return (
//       <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
//         <ActivityIndicator size="large" color="#0000ff" />
//       </View>
//     );
//   }

//   return (
//     <NavigationContainer>
//       <Stack.Navigator
//         initialRouteName={initialRoute}
//         screenOptions={{ headerShown: false }}
//       >
//         <Stack.Screen name="Login" component={Login} />
//         <Stack.Screen name="HomeScreen" component={HomeScreen} />
//         <Stack.Screen name="AccountScreen" component={AccountScreen} />
//         <Stack.Screen
//           name="UserFoodItemsScreen"
//           component={UserFoodItemsScreen}
//         />
//         <Stack.Screen name="Orders" component={Orders} />
//         <Stack.Screen name="Checkout" component={Checkout} />
//       </Stack.Navigator>
//     </NavigationContainer>
//   );
// }

import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { ActivityIndicator, View, StyleSheet } from "react-native";
import Login from "./src/Login";
import HomeScreen from "./src/HomeScreen";
import AccountScreen from "./src/AccountScreen";
import UserFoodItemsScreen from "./src/UserFoodItemsScreen";
import Orders from "./src/Orders";
import Checkout from "./src/Checkout";
import AsyncStorage from "@react-native-async-storage/async-storage";
import CONFIG from "./config";
import LottieView from "lottie-react-native";
import { CartProvider } from "./src/CartContext";

const Stack = createStackNavigator();

export default function App() {
  const [initialRoute, setInitialRoute] = useState(null); // null while loading
  const [loading, setLoading] = useState(true);
  // const [userId, setUserId] = useState(null);
  const [initialParams, setInitialParams] = useState({});

  useEffect(() => {
    const init = async () => {
      try {
        const jwtToken = await AsyncStorage.getItem("jwtToken");
        if (jwtToken) {
          // Optionally, verify token with backend here if you want
          setInitialRoute("HomeScreen");
          setInitialParams({ jwtToken });
        } else {
          setInitialRoute("Login");
        }
      } catch (error) {
        setInitialRoute("Login");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);
  const LoadingComponent = () => (
    <View style={styles.loaderContainer}>
      <View style={styles.loaderCircle}>
        <LottieView
          source={require("./assets/rocket.json")}
          autoPlay
          loop
          style={{ width: 620, height: 420 }} // Adjust the Lottie size as needed
        />
      </View>
    </View>
  );
  if (loading || !initialRoute) {
    return <LoadingComponent />;
  }

  // Check the current navigation stack setup to ensure Checkout screen is registered
  console.log("App.js - Navigation stack configuration");

  return (
    <CartProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName={initialRoute}
          screenOptions={{ headerShown: false }}
        >
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen
            name="HomeScreen"
            component={HomeScreen}
            initialParams={initialParams}
          />

          <Stack.Screen name="AccountScreen" component={AccountScreen} />
          <Stack.Screen
            name="UserFoodItemsScreen"
            component={UserFoodItemsScreen}
          />
          <Stack.Screen name="Orders" component={Orders} />
          <Stack.Screen name="Checkout" component={Checkout} />
        </Stack.Navigator>
      </NavigationContainer>
    </CartProvider>
  );
}

const styles = StyleSheet.create({
  loaderContainer: {
    flex: 1,
    backgroundColor: "#ff8c00",
    justifyContent: "center",
    alignItems: "center",
    // borderRadius: "70%",
  },
  loaderCircle: {
    width: 200, // Adjust the size of the circle as needed
    height: 200, // Keep width and height the same to create a circle
    borderRadius: "50%", // Half of the width/height to make it circular
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden", // Ensures that Lottie stays within the circle
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5, // Android shadow
  },
});
