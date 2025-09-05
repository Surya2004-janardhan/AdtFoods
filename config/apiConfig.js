// API Configuration
export const API_CONFIG = {
  BASE_URL: "http://192.168.1.4:3500", // Replace with your actual server IP
  ENDPOINTS: {
    PAYMENT: {
      CREATE_ORDER: "/payment/create-order",
      VERIFY_PAYMENT: "/payment/verify-payment",
    },
    ORDERS: {
      CREATE: "/orders",
      GET_BY_USER: "/orders/user",
      UPDATE_STATUS: "/orders",
    },
  },
};

// Razorpay Configuration
export const RAZORPAY_CONFIG = {
  KEY_ID: "rzp_test_your_key_id_here", // Replace with your actual Razorpay key ID
  CURRENCY: "INR",
  COMPANY_NAME: "AdtFoods",
  COMPANY_LOGO: "https://your-logo-url.com/logo.png", // Add your app logo URL
  THEME_COLOR: "#FF6B00",
};
