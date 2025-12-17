const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const { auth } = require("../middleware/auth");
const validateRequest =
  require("../middleware/validateRequest").validateRequest;
const { cacheMiddleware, clearCache } = require("../middleware/cache");

// Create order schema
const createOrderSchema = {
  userId: { type: "string", required: true },
  name: { type: "string", required: true },
  restaurant: { type: "string", required: true },
  items: { type: "array", required: true },
  totalAmount: { type: "number", required: true },
  deliveryFee: { type: "number" },
  tax: { type: "number" },
  paymentMethod: { type: "string", required: true },
  note: { type: "string" },
  restaurantName: { type: "string" },
  restaurantLocation: { type: "string" },
  razorpayOrderId: { type: "string" },
  razorpayPaymentId: { type: "string" },
};

// Update order status schema
const updateOrderStatusSchema = {
  status: {
    type: "string",
    required: true,
    enum: ["pending", "processing", "completed", "cancelled"],
  },
};

// Order routes
router.get(
  "/orders/count",
  auth,
  cacheMiddleware("orders-count", 60),
  orderController.getTotalOrderCount
);
router.get(
  "/orders",
  auth,
  cacheMiddleware("orders", 30),
  orderController.getAllOrders
);
router.get(
  "/orders/:userId",
  auth,
  cacheMiddleware("user-orders", 30),
  orderController.getOrdersByUserId
);
router.post(
  "/orders",
  auth,
  validateRequest(createOrderSchema),
  clearCache("orders:*"),
  clearCache("orders-count:*"),
  clearCache("user-orders:*"),
  orderController.createOrder
);
router.put(
  "/orders/:id/status",
  auth,
  validateRequest(updateOrderStatusSchema),
  clearCache("orders:*"),
  clearCache("user-orders:*"),
  orderController.updateOrderStatus
);

module.exports = router;
