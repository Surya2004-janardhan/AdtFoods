import { Stack } from "expo-router";
import { CartProvider } from "../context/CartContext";
import { OrdersProvider } from "../context/OrdersContext";
import { AuthProvider } from "../context/AuthContext";
import Toast from "react-native-toast-message";
import { useFonts } from "expo-font";
import { Text, View } from "react-native";
import "../global.css";

export default function Layout() {
  const [fontsLoaded] = useFonts({
    Poppins: require("../assets/fonts/Poppins-Regular.ttf"),
    "Poppins-Bold": require("../assets/fonts/Poppins-Bold.ttf"),
    "Poppins-Medium": require("../assets/fonts/Poppins-Medium.ttf"),
    PlayfairDisplay: require("../assets/fonts/PlayfairDisplay-Regular.ttf"),
    "PlayfairDisplay-Bold": require("../assets/fonts/PlayfairDisplay-Bold.ttf"),
    Montserrat: require("../assets/fonts/Montserrat-Regular.ttf"),
    "Montserrat-Bold": require("../assets/fonts/Montserrat-Bold.ttf"),
  });

  if (!fontsLoaded) {
    return (
      <View
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: "#FFFFFF" }}
      >
        <Text className="text-lg font-bold" style={{ color: "#333333" }}>
          Loading...
        </Text>
      </View>
    );
  }

  return (
    <AuthProvider>
      <CartProvider>
        <OrdersProvider>
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: {
                backgroundColor: "#FFFFFF", // Modern white background
              },
            }}
          >
            <Stack.Screen name="index" options={{ title: "Home" }} />
            <Stack.Screen name="AuthScreen" />
            <Stack.Screen name="HomeScreen" />
            <Stack.Screen name="UserFoodItemsScreen" />
            <Stack.Screen name="PaymentScreen" />
            <Stack.Screen name="PaymentSuccessScreen" />
            <Stack.Screen name="UserCartScreen" />
            <Stack.Screen name="StaffFoodItemsScreen" />
            <Stack.Screen name="StaffOrdersScreen" />
            <Stack.Screen name="OrdersScreen" />
            <Stack.Screen name="AccountScreen" />
          </Stack>
          <Toast />
        </OrdersProvider>
      </CartProvider>
    </AuthProvider>
  );
}
