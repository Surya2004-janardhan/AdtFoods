import { Stack } from "expo-router";
import { CartProvider } from "../context/CartContext";
import { OrdersProvider } from "../context/OrdersContext"; // Ensure this file exists
import Toast from "react-native-toast-message";

export default function Layout() {
  return (
    <CartProvider>
      <OrdersProvider>
        <Stack
          screenOptions={{
            headerShown: false, // 👈 this hides headers globally
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
          <Stack.Screen name="SignUpScreen" />
        </Stack>
        <Toast />
      </OrdersProvider>
    </CartProvider>
  );
}
