const Order = require("../models/Order");

// Get all orders
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({}).sort({ date: -1 });
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

    const orders = await Order.find({ userId }).sort({ date: -1 });
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
    const { userId, name, items, total, paymentMethod, note } = req.body;

    if (!userId || !items || !total) {
      return res.status(400).json({ error: "Missing required order details" });
    }

    const orderCount = await Order.countDocuments({});
    const newOrder = new Order({
      id: orderCount + 1,
      userId,
      name,
      items,
      total,
      paymentMethod,
      note,
      status: "pending",
      date: new Date(),
    });

    await newOrder.save();
    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order: newOrder,
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
      !["pending", "processing", "completed", "cancelled"].includes(status)
    ) {
      return res.status(400).json({ error: "Invalid order status" });
    }

    const order = await Order.findOne({ id: parseInt(id) });
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    order.status = status;
    await order.save();

    res.json({
      success: true,
      message: `Order status updated to ${status}`,
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    res
      .status(500)
      .json({ error: "Unable to update order status. Please try again later" });
  }
};

module.exports = {
  getAllOrders,
  getOrdersByUserId,
  createOrder,
  updateOrderStatus,
};
