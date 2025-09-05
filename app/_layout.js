import { Stack } from "expo-router";
import { CartProvider } from "../context/CartContext";
import { OrdersProvider } from "../context/OrdersContext";
import { AuthProvider } from "../context/AuthContext";
import { FoodProvider } from "../context/FoodContext";
import AuthWrapper from "../components/AuthWrapper";
import Toast from "react-native-toast-message";
import { useFonts } from "expo-font";
import { Text, View } from "react-native";
import "../global.css";

export default function Layout() {
  const [fontsLoaded] = useFonts({
    // Poppins family
    "Poppins-Thin": require("../assets/fonts/Poppins-Thin.ttf"),
    "Poppins-ExtraLight": require("../assets/fonts/Poppins-ExtraLight.ttf"),
    "Poppins-Light": require("../assets/fonts/Poppins-Light.ttf"),
    "Poppins-Regular": require("../assets/fonts/Poppins-Regular.ttf"),
    "Poppins-Medium": require("../assets/fonts/Poppins-Medium.ttf"),
    "Poppins-SemiBold": require("../assets/fonts/Poppins-SemiBold.ttf"),
    "Poppins-Bold": require("../assets/fonts/Poppins-Bold.ttf"),
    "Poppins-ExtraBold": require("../assets/fonts/Poppins-ExtraBold.ttf"),
    "Poppins-Black": require("../assets/fonts/Poppins-Black.ttf"),

    // PlayfairDisplay family
    "PlayfairDisplay-Regular": require("../assets/fonts/PlayfairDisplay-Regular.ttf"),
    "PlayfairDisplay-Medium": require("../assets/fonts/PlayfairDisplay-Medium.ttf"),
    "PlayfairDisplay-SemiBold": require("../assets/fonts/PlayfairDisplay-SemiBold.ttf"),
    "PlayfairDisplay-Bold": require("../assets/fonts/PlayfairDisplay-Bold.ttf"),
    "PlayfairDisplay-ExtraBold": require("../assets/fonts/PlayfairDisplay-ExtraBold.ttf"),
    "PlayfairDisplay-Black": require("../assets/fonts/PlayfairDisplay-Black.ttf"),

    // Montserrat family
    "Montserrat-Thin": require("../assets/fonts/Montserrat-Thin.ttf"),
    "Montserrat-ExtraLight": require("../assets/fonts/Montserrat-ExtraLight.ttf"),
    "Montserrat-Light": require("../assets/fonts/Montserrat-Light.ttf"),
    "Montserrat-Regular": require("../assets/fonts/Montserrat-Regular.ttf"),
    "Montserrat-Medium": require("../assets/fonts/Montserrat-Medium.ttf"),
    "Montserrat-SemiBold": require("../assets/fonts/Montserrat-SemiBold.ttf"),
    "Montserrat-Bold": require("../assets/fonts/Montserrat-Bold.ttf"),
    "Montserrat-ExtraBold": require("../assets/fonts/Montserrat-ExtraBold.ttf"),
    "Montserrat-Black": require("../assets/fonts/Montserrat-Black.ttf"),
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
      <FoodProvider>
        <CartProvider>
          <OrdersProvider>
            <AuthWrapper>
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
            </AuthWrapper>
          </OrdersProvider>
        </CartProvider>
      </FoodProvider>
    </AuthProvider>
  );
}
