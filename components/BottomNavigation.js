import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter, usePathname } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const BottomNavigation = ({ userRole = "user" }) => {
  const router = useRouter();
  const pathname = usePathname() || "/";

  const handleNavigation = (route) => {
    try {
      console.log("Navigating to:", route);
      router.push(route);
    } catch (error) {
      console.error("Navigation error:", error);
      // Fallback navigation attempt
      try {
        router.replace(route);
      } catch (fallbackError) {
        console.error("Fallback navigation failed:", fallbackError);
      }
    }
  };

  // Define navigation items based on user role
  const getNavigationItems = () => {
    if (userRole === "staff") {
      return [
        {
          name: "Menu",
          icon: "food",
          route: "/StaffFoodItemsScreen",
          key: "staff-menu",
        },
        {
          name: "Orders",
          icon: "clipboard-list",
          route: "/StaffOrdersScreen",
          key: "staff-orders",
        },
        {
          name: "Account",
          icon: "account",
          route: "/AccountScreen",
          key: "account",
        },
      ];
    } else {
      return [
        {
          name: "Home",
          icon: "home",
          route: "/HomeScreen",
          key: "home",
        },
        {
          name: "Notifications",
          icon: "bell",
          route: "/NotificationsScreen",
          key: "notifications",
        },
        {
          name: "Orders",
          icon: "clipboard-list",
          route: "/OrdersScreen",
          key: "orders",
        },
        {
          name: "Account",
          icon: "account",
          route: "/AccountScreen",
          key: "account",
        },
      ];
    }
  };

  const navigationItems = getNavigationItems();

  const isActiveRoute = (route) => {
    // Handle both /ScreenName and ScreenName patterns
    const normalizedPathname = pathname.startsWith("/")
      ? pathname
      : `/${pathname}`;
    const normalizedRoute = route.startsWith("/") ? route : `/${route}`;
    return normalizedPathname === normalizedRoute;
  };

  return (
    <View style={styles.container}>
      <View style={styles.navContainer}>
        {navigationItems.map((item) => (
          <TouchableOpacity
            key={item.key}
            style={[
              styles.navItem,
              isActiveRoute(item.route) && styles.activeNavItem,
            ]}
            onPress={() => {
              if (item.action) {
                item.action();
              } else if (item.route) {
                handleNavigation(item.route);
              }
            }}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.iconContainer,
                isActiveRoute(item.route) && styles.activeIconContainer,
              ]}
            >
              <MaterialCommunityIcons
                name={item.icon}
                size={24}
                color={isActiveRoute(item.route) ? "#FFFFFF" : "#FF6B00"}
              />
            </View>
            <Text
              style={[
                styles.navText,
                isActiveRoute(item.route) && styles.activeNavText,
              ]}
            >
              {item.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 8,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  navContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 8,
    paddingHorizontal: 5,
    backgroundColor: "#FFFFFF",
  },
  navItem: {
    alignItems: "center",
    flex: 1,
    paddingVertical: 8,
  },
  activeNavItem: {
    // Active item styling handled in iconContainer
    borderRadius: 20,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
    marginBottom: 4,
  },
  activeIconContainer: {
    backgroundColor: "#FF6B00",
    shadowColor: "#FF6B00",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  navText: {
    fontSize: 12,
    color: "#666666",
    fontWeight: "500",
    textAlign: "center",
  },
  activeNavText: {
    color: "#FF6B00",
    fontWeight: "600",
  },
});

export default BottomNavigation;
