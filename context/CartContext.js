// import React, { createContext, useState } from "react";

// const CartContext = createContext();

// export const CartProvider = ({ children }) => {
//   const [cartItems, setCartItems] = useState([]);

//   // const addToCart = (item) => {
//   //   setCartItems((prevItems) => {
//   //     // const existingItemIndex = prevItems.findIndex((i) => i.id === item.id);
//   //     const existingItemIndex = prevItems.findIndex((i) => i._id === item._id);

//   //     if (existingItemIndex >= 0) {
//   //       const newItems = [...prevItems];
//   //       newItems[existingItemIndex].quantity += item.quantity;
//   //       return newItems;
//   //     } else {
//   //       return [...prevItems, item];
//   //     }
//   //   });
//   // };

//   // const removeFromCart = (itemId) => {
//   //   setCartItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
//   // };

//   // const updateQuantity = (itemId, quantity) => {
//   //   setCartItems((prevItems) => {
//   //     return prevItems.map((item) =>
//   //       item.id === itemId ? { ...item, quantity } : item
//   //     );
//   //   });
//   // };
//   const addToCart = (item) => {
//     setCartItems((prevItems) => {
//       const existingItemIndex = prevItems.findIndex((i) => i._id === item._id);
//       if (existingItemIndex >= 0) {
//         const newItems = [...prevItems];
//         newItems[existingItemIndex].quantity += item.quantity;
//         return newItems;
//       } else {
//         return [...prevItems, item];
//       }
//     });
//   };

//   const removeFromCart = (itemId) => {
//     setCartItems((prevItems) =>
//       prevItems.filter((item) => item._id !== itemId)
//     );
//   };
// const updateQuantity = (itemId, quantity) => {
//   if (quantity <= 0) {
//     removeFromCart(itemId);
//   } else {
//     setCartItems((prevItems) =>
//       prevItems.map((item) =>
//         item._id === itemId ? { ...item, quantity } : item
//       )
//     );
//   }
// };

//   // const updateQuantity = (itemId, quantity) => {
//   //   setCartItems((prevItems) =>
//   //     prevItems.map((item) =>
//   //       item._id === itemId ? { ...item, quantity } : item
//   //     )
//   //   );
//   // };

//   const calculateTotal = () => {
//     return cartItems.reduce(
//       (total, item) => total + item.price * item.quantity,
//       0
//     );
//   };

//   const clearCart = () => {
//     setCartItems([]);
//   };

//   return (
//     <CartContext.Provider
//       value={{
//         cartItems,
//         addToCart,
//         removeFromCart,
//         updateQuantity,
//         calculateTotal,
//         clearCart,
//       }}
//     >
//       {children}
//     </CartContext.Provider>
//   );
// };

// export default CartContext;
import React, { createContext, useState } from "react";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  const addToCart = (item) => {
    setCartItems((prevItems) => {
      const index = prevItems.findIndex((i) => i.id === item.id);

      if (index >= 0) {
        const newItems = [...prevItems];

        if (item.quantity <= 0) {
          // ✅ Remove the item from the cart if quantity is 0
          newItems.splice(index, 1);
        } else {
          // ✅ Update the item quantity
          newItems[index] = { ...newItems[index], quantity: item.quantity };
        }

        return newItems;
      } else {
        return item.quantity > 0 ? [...prevItems, item] : prevItems;
      }
    });
  };

  // const addToCart = (item) => {
  //   setCartItems((prevItems) => {
  //     const index = prevItems.findIndex((i) => i.id === item.id);
  //     if (index >= 0) {
  //       const newItems = [...prevItems];
  //       newItems[index].quantity += item.quantity;
  //       return newItems;
  //     } else {
  //       return [...prevItems, item];
  //     }
  //   });
  // };

  const removeFromCart = (itemId) => {
    setCartItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
  };

  const updateQuantity = (itemId, quantity) => {
    setCartItems((prevItems) => {
      if (quantity <= 0) {
        return prevItems.filter((item) => item.id !== itemId);
      }
      return prevItems.map((item) =>
        item.id === itemId ? { ...item, quantity } : item
      );
    });
  };

  const calculateTotal = () => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        calculateTotal,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;

// this is the original ciode

// import React, { createContext, useState } from 'react';

// const CartContext = createContext();

// export const CartProvider = ({ children }) => {
//   const [cartItems, setCartItems] = useState([]);

//   const addToCart = (item) => {
//     setCartItems((prevItems) => {
//       const existingItemIndex = prevItems.findIndex((i) => i.id === item.id);
//       if (existingItemIndex >= 0) {
//         const newItems = [...prevItems];
//         newItems[existingItemIndex].quantity += item.quantity;
//         return newItems;
//       } else {
//         return [...prevItems, item];
//       }
//     });
//   };

//   const removeFromCart = (itemId) => {
//     setCartItems((prevItems) => prevItems.filter((item) => item.id !== itemId));
//   };

//   const updateQuantity = (itemId, quantity) => {
//     setCartItems((prevItems) => {
//       return prevItems.map((item) =>
//         item.id === itemId ? { ...item, quantity } : item
//       );
//     });
//   };

//   const calculateTotal = () => {
//     return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
//   };

//   const clearCart = () => {
//     setCartItems([]);
//   };

//   return (
//     <CartContext.Provider
//       value={{ cartItems, addToCart, removeFromCart, updateQuantity, calculateTotal, clearCart }}
//     >
//       {children}
//     </CartContext.Provider>
//   );
// };

// export default CartContext;
