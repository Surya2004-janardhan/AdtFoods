// API Configuration
export const API_CONFIG = {
  BASE_URL: "http://10.234.34.53:3500", // Use same IP as axiosConfig.js
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
  KEY_ID: "rzp_test_RDqyGtggIzLZTh", // From .env file - RAZORPAY_KEY_ID
  CURRENCY: "INR",
  COMPANY_NAME: "Aditya Foods",
  DESCRIPTION: "Aditya Foods Order Payment",
  COMPANY_LOGO: "https://your-logo-url.com/logo.png", // Add your app logo URL
  THEME_COLOR: "#FF6B00",
};
