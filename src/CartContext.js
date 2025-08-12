import React, { createContext, useContext, useReducer } from "react";

// Initial state
const initialState = {
  cartItems: [],
  totalAmount: 0,
  totalCount: 0,
};

// Action types
const CART_ACTIONS = {
  ADD_ITEM: "ADD_ITEM",
  REMOVE_ITEM: "REMOVE_ITEM",
  UPDATE_QUANTITY: "UPDATE_QUANTITY",
  CLEAR_CART: "CLEAR_CART",
  SET_CART: "SET_CART",
};

// Reducer function
const cartReducer = (state, action) => {
  switch (action.type) {
    case CART_ACTIONS.ADD_ITEM: {
      const { item } = action.payload;
      const existingItemIndex = state.cartItems.findIndex(
        (cartItem) =>
          cartItem._id === item._id &&
          cartItem.restaurantId === item.restaurantId
      );

      let updatedCartItems;
      if (existingItemIndex >= 0) {
        // Item exists, update quantity
        updatedCartItems = state.cartItems.map((cartItem, index) =>
          index === existingItemIndex
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      } else {
        // New item, add to cart
        updatedCartItems = [...state.cartItems, { ...item, quantity: 1 }];
      }

      const totalCount = updatedCartItems.reduce(
        (sum, item) => sum + item.quantity,
        0
      );
      const totalAmount = updatedCartItems.reduce(
        (sum, item) => sum + parseFloat(item.price) * item.quantity,
        0
      );

      return {
        ...state,
        cartItems: updatedCartItems,
        totalCount,
        totalAmount,
      };
    }

    case CART_ACTIONS.REMOVE_ITEM: {
      const { itemId, restaurantId } = action.payload;
      const updatedCartItems = state.cartItems.filter(
        (item) => !(item._id === itemId && item.restaurantId === restaurantId)
      );

      const totalCount = updatedCartItems.reduce(
        (sum, item) => sum + item.quantity,
        0
      );
      const totalAmount = updatedCartItems.reduce(
        (sum, item) => sum + parseFloat(item.price) * item.quantity,
        0
      );

      return {
        ...state,
        cartItems: updatedCartItems,
        totalCount,
        totalAmount,
      };
    }

    case CART_ACTIONS.UPDATE_QUANTITY: {
      const { itemId, restaurantId, quantity } = action.payload;

      if (quantity <= 0) {
        // Remove item if quantity is 0 or less
        return cartReducer(state, {
          type: CART_ACTIONS.REMOVE_ITEM,
          payload: { itemId, restaurantId },
        });
      }

      const updatedCartItems = state.cartItems.map((item) =>
        item._id === itemId && item.restaurantId === restaurantId
          ? { ...item, quantity }
          : item
      );

      const totalCount = updatedCartItems.reduce(
        (sum, item) => sum + item.quantity,
        0
      );
      const totalAmount = updatedCartItems.reduce(
        (sum, item) => sum + parseFloat(item.price) * item.quantity,
        0
      );

      return {
        ...state,
        cartItems: updatedCartItems,
        totalCount,
        totalAmount,
      };
    }

    case CART_ACTIONS.CLEAR_CART: {
      return initialState;
    }

    case CART_ACTIONS.SET_CART: {
      const { cartItems } = action.payload;
      const totalCount = cartItems.reduce(
        (sum, item) => sum + item.quantity,
        0
      );
      const totalAmount = cartItems.reduce(
        (sum, item) => sum + parseFloat(item.price) * item.quantity,
        0
      );

      return {
        ...state,
        cartItems,
        totalCount,
        totalAmount,
      };
    }

    default:
      return state;
  }
};

// Create context
const CartContext = createContext();

// Cart provider component
export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Action creators
  const addToCart = (item) => {
    console.log("CartContext: Adding item to cart", item);
    dispatch({
      type: CART_ACTIONS.ADD_ITEM,
      payload: { item },
    });
  };

  const removeFromCart = (itemId, restaurantId) => {
    console.log("CartContext: Removing item from cart", itemId, restaurantId);
    dispatch({
      type: CART_ACTIONS.REMOVE_ITEM,
      payload: { itemId, restaurantId },
    });
  };

  const updateQuantity = (itemId, restaurantId, quantity) => {
    console.log(
      "CartContext: Updating quantity",
      itemId,
      restaurantId,
      quantity
    );
    dispatch({
      type: CART_ACTIONS.UPDATE_QUANTITY,
      payload: { itemId, restaurantId, quantity },
    });
  };

  const clearCart = () => {
    console.log("CartContext: Clearing cart");
    dispatch({ type: CART_ACTIONS.CLEAR_CART });
  };

  const setCart = (cartItems) => {
    console.log("CartContext: Setting cart items", cartItems);
    dispatch({
      type: CART_ACTIONS.SET_CART,
      payload: { cartItems },
    });
  };

  // Get cart items for a specific restaurant
  const getCartItemsForRestaurant = (restaurantId) => {
    return state.cartItems.filter((item) => item.restaurantId === restaurantId);
  };

  // Get quantity of a specific item
  const getItemQuantity = (itemId, restaurantId) => {
    const item = state.cartItems.find(
      (cartItem) =>
        cartItem._id === itemId && cartItem.restaurantId === restaurantId
    );
    return item ? item.quantity : 0;
  };

  const value = {
    ...state,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    setCart,
    getCartItemsForRestaurant,
    getItemQuantity,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

// Custom hook to use cart context
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

export { CART_ACTIONS };
