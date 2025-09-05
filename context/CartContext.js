import React, { createContext, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  // Store carts by restaurant ID: { restaurantId: { items: [], restaurantInfo: {} } }
  const [restaurantCarts, setRestaurantCarts] = useState({});
  const [currentRestaurantId, setCurrentRestaurantId] = useState(null);

  // Get cart items for current restaurant
  const getCartItems = (restaurantId = currentRestaurantId) => {
    if (!restaurantId) return [];
    return restaurantCarts[restaurantId]?.items || [];
  };

  // Get restaurant info for current cart
  const getCurrentRestaurantInfo = (restaurantId = currentRestaurantId) => {
    if (!restaurantId) return null;
    return restaurantCarts[restaurantId]?.restaurantInfo || null;
  };

  // Set current restaurant and initialize cart if needed
  const setCurrentRestaurant = (restaurantId, restaurantInfo) => {
    setCurrentRestaurantId(restaurantId);

    // Initialize cart for this restaurant if it doesn't exist
    setRestaurantCarts((prev) => ({
      ...prev,
      [restaurantId]: prev[restaurantId] || {
        items: [],
        restaurantInfo: restaurantInfo || {},
      },
    }));
  };

  // Add item to current restaurant cart
  const addToCart = (item, restaurantId = currentRestaurantId) => {
    if (!restaurantId) {
      console.warn("No restaurant selected for cart");
      return;
    }

    setRestaurantCarts((prev) => {
      const currentCart = prev[restaurantId] || {
        items: [],
        restaurantInfo: {},
      };
      const existingItemIndex = currentCart.items.findIndex(
        (i) => i._id === item._id
      );

      let newItems;
      if (existingItemIndex >= 0) {
        // Update existing item quantity
        newItems = [...currentCart.items];
        if (item.quantity <= 0) {
          // Remove item if quantity is 0
          newItems.splice(existingItemIndex, 1);
        } else {
          // Update quantity
          newItems[existingItemIndex] = {
            ...newItems[existingItemIndex],
            quantity: item.quantity,
          };
        }
      } else {
        // Add new item if quantity > 0
        newItems =
          item.quantity > 0 ? [...currentCart.items, item] : currentCart.items;
      }

      return {
        ...prev,
        [restaurantId]: {
          ...currentCart,
          items: newItems,
        },
      };
    });

    return { success: true };
  };

  // Remove item from current restaurant cart
  const removeFromCart = (itemId, restaurantId = currentRestaurantId) => {
    if (!restaurantId) return;

    setRestaurantCarts((prev) => {
      const currentCart = prev[restaurantId];
      if (!currentCart) return prev;

      return {
        ...prev,
        [restaurantId]: {
          ...currentCart,
          items: currentCart.items.filter((item) => item._id !== itemId),
        },
      };
    });
  };

  // Update quantity for specific item
  const updateQuantity = (
    itemId,
    quantity,
    restaurantId = currentRestaurantId
  ) => {
    if (!restaurantId) return;

    setRestaurantCarts((prev) => {
      const currentCart = prev[restaurantId];
      if (!currentCart) return prev;

      let newItems;
      if (quantity <= 0) {
        // Remove item if quantity is 0 or less
        newItems = currentCart.items.filter((item) => item._id !== itemId);
      } else {
        // Update quantity
        newItems = currentCart.items.map((item) =>
          item._id === itemId ? { ...item, quantity } : item
        );
      }

      return {
        ...prev,
        [restaurantId]: {
          ...currentCart,
          items: newItems,
        },
      };
    });
  };

  // Calculate total for current restaurant
  const calculateTotal = (restaurantId = currentRestaurantId) => {
    if (!restaurantId) return 0;
    const items = getCartItems(restaurantId);
    return items.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  // Get item quantity from current restaurant cart
  const getItemQuantity = (itemId, restaurantId = currentRestaurantId) => {
    if (!restaurantId) return 0;
    const items = getCartItems(restaurantId);
    const item = items.find((item) => item._id === itemId);
    return item?.quantity || 0;
  };

  // Clear cart for specific restaurant
  const clearRestaurantCart = (restaurantId = currentRestaurantId) => {
    if (!restaurantId) return;

    setRestaurantCarts((prev) => ({
      ...prev,
      [restaurantId]: {
        ...prev[restaurantId],
        items: [],
      },
    }));
  };

  // Clear all carts
  const clearAllCarts = () => {
    setRestaurantCarts({});
    setCurrentRestaurantId(null);
  };

  // Get cart count for current restaurant
  const getCartCount = (restaurantId = currentRestaurantId) => {
    if (!restaurantId) return 0;
    const items = getCartItems(restaurantId);
    return items.reduce((count, item) => count + item.quantity, 0);
  };

  // Check if cart has items for specific restaurant
  const hasCartItems = (restaurantId = currentRestaurantId) => {
    if (!restaurantId) return false;
    return getCartItems(restaurantId).length > 0;
  };

  // Get all restaurant IDs that have items in cart
  const getActiveRestaurantIds = () => {
    return Object.keys(restaurantCarts).filter(
      (id) => restaurantCarts[id].items.length > 0
    );
  };

  const value = {
    // Current restaurant management
    currentRestaurantId,
    setCurrentRestaurant,
    getCurrentRestaurantInfo,

    // Cart operations
    getCartItems,
    addToCart,
    removeFromCart,
    updateQuantity,

    // Cart info
    calculateTotal,
    getItemQuantity,
    getCartCount,
    hasCartItems,

    // Cart management
    clearRestaurantCart,
    clearAllCarts,

    // Multi-restaurant info
    restaurantCarts,
    getActiveRestaurantIds,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export { CartContext };
export default CartContext;
