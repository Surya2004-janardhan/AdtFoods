const Order = require("../models/Order");

// Get total order count (for generating order IDs)
const getTotalOrderCount = async (req, res) => {
  try {
    const count = await Order.countDocuments();
    res.json({ totalOrders: count });
  } catch (error) {
    console.error("Error getting total order count:", error);
    res.status(500).json({ error: "Unable to get order count" });
  }
};

// Get all orders
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate("restaurant", "name location")
      .populate("items.food", "name price image")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res
      .status(500)
      .json({ error: "Unable to load orders. Please try again later" });
  }
};

// Get orders by user ID
const getOrdersByUserId = async (req, res) => {
  try {
    const userId = req.params.userId;
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const orders = await Order.find({ userId })
      .populate("restaurant", "name location")
      .populate("items.food", "name price image")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error("Error fetching user orders:", error);
    res
      .status(500)
      .json({ error: "Unable to load your orders. Please try again later" });
  }
};

// Create a new order
const createOrder = async (req, res) => {
  try {
    console.log("Received order data:", JSON.stringify(req.body, null, 2));

    const {
      userId,
      name,
      restaurant,
      items,
      totalAmount,
      deliveryFee,
      tax,
      paymentMethod,
      note,
      restaurantName,
      restaurantLocation,
      razorpayOrderId,
      razorpayPaymentId,
    } = req.body;

    console.log("Destructured data:", {
      userId,
      name,
      restaurant,
      items: items ? `array of ${items.length} items` : "undefined",
      totalAmount,
      paymentMethod,
    });

    if (!userId || !items || !totalAmount || !restaurant) {
      console.log("Missing required fields:", {
        userId: !!userId,
        items: !!items,
        totalAmount: !!totalAmount,
        restaurant: !!restaurant,
      });
      return res.status(400).json({ error: "Missing required order details" });
    }

    if (!Array.isArray(items)) {
      console.log("Items is not an array:", typeof items, items);
      return res.status(400).json({ error: "items should be of type array" });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Get next order number
    const lastOrder = await Order.findOne().sort({ orderNumber: -1 });
    const nextOrderNumber = lastOrder ? lastOrder.orderNumber + 1 : 1;

    const newOrder = new Order({
      orderNumber: nextOrderNumber,
      userId,
      customerName: name,
      restaurant,
      items,
      totalAmount,
      deliveryFee: deliveryFee || 30,
      tax: tax || 0,
      paymentMethod,
      note,
      status: "pending",
      otp,
      restaurantName,
      restaurantLocation,
      razorpayOrderId,
      razorpayPaymentId,
    });

    await newOrder.save();

    // Populate the saved order before returning
    const populatedOrder = await Order.findById(newOrder._id)
      .populate("restaurant", "name location")
      .populate("items.food", "name price image");

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order: populatedOrder,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    res
      .status(500)
      .json({ error: "Unable to place order. Please try again later" });
  }
};

// Update order status
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (
      !status ||
      !["pending", "ready_to_pick", "cancelled"].includes(status)
    ) {
      return res.status(400).json({ error: "Invalid order status" });
    }

    const order = await Order.findByIdAndUpdate(
      id,
      { status, updatedAt: new Date() },
      { new: true }
    )
      .populate("restaurant", "name location")
      .populate("items.food", "name price image");

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json({
      success: true,
      message: `Order status updated to ${status}`,
      order: order,
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    res
      .status(500)
      .json({ error: "Unable to update order status. Please try again later" });
  }
};

module.exports = {
  getTotalOrderCount,
  getAllOrders,
  getOrdersByUserId,
  createOrder,
  updateOrderStatus,
};
