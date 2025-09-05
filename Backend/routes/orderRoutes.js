const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");
const { auth } = require("../middleware/auth");
const validateRequest =
  require("../middleware/validateRequest").validateRequest;

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
router.get("/orders/count", auth, orderController.getTotalOrderCount);
router.get("/orders", auth, orderController.getAllOrders);
router.get("/orders/:userId", auth, orderController.getOrdersByUserId);
router.post(
  "/orders",
  auth,
  validateRequest(createOrderSchema),
  orderController.createOrder
);
router.put(
  "/orders/:id/status",
  auth,
  validateRequest(updateOrderStatusSchema),
  orderController.updateOrderStatus
);

module.exports = router;
