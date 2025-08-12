const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken"); // <-- Added
dotenv.config();
const app = express();
app.use(bodyParser.json());
app.use(cors());

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key"; // put in .env

uri = process.env.mongo_uri;
// MongoDB Connection
mongoose
  .connect(uri)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Models
const userSchema = new mongoose.Schema({
  user_id: String,
  name: String,
  password: String,
  email: String,
  phone_number: String,
});
const orderSchema = new mongoose.Schema({
  user_email: String,
  user_name: String,
  user_phone: String,
  items: String,
  total_amount: Number,
  status: String,
  user_id: String,
});
const tokensschema = new mongoose.Schema({
  user_id: String,
  token: String,
});
const foodItemSchema = new mongoose.Schema({
  id: Number,
  name: String,
  price: Number,
  available: Boolean,
  image: String,
});
const restaurantSchema = new mongoose.Schema({}, { strict: false });

// Add cart schema
const cartSchema = new mongoose.Schema({
  userId: String,
  itemId: String,
  itemName: String,
  price: String,
  imageUrl: String,
  restaurant_id: String,
  quantity: Number,
});

const FoodItem = mongoose.model("fooditems", foodItemSchema);
const User = mongoose.model("users", userSchema);
const Order = mongoose.model("orders", orderSchema);
const Restaurant = mongoose.model("restaurants", restaurantSchema);
const Token = mongoose.model("tokens", tokensschema);
const Cart = mongoose.model("carts", cartSchema);

// ✅ JWT middleware
function verifyJWT(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader) return res.status(401).json({ error: "No token provided" });

  const token = authHeader.split(" ")[1]; // Expect "Bearer <token>"
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ error: "Invalid or expired token" });
    req.user = decoded; // attach decoded payload (e.g. user_id)
    next();
  });
}

// ---------------------- Routes ----------------------
app.get("/food-items", verifyJWT, async (req, res) => {
  const items = await FoodItem.find({});
  res.json(items);
});

app.post("/signup", async (req, res) => {
  console.log("calledd here singup ");
  const { user_id, name, password, email, phone_number } = req.body;
  if (!user_id || !name || !password || !email || !phone_number)
    return res.status(400).json({ error: "All fields are required" });
  if (user_id.length !== 10)
    return res
      .status(400)
      .json({ error: "User ID must be exactly 10 characters long" });
  if (!/^\d{10}$/.test(phone_number))
    return res
      .status(400)
      .json({ error: "Phone number must be exactly 10 digits" });
  if (password.length < 8)
    return res
      .status(400)
      .json({ error: "Password must be at least 8 characters long" });
  if (!/\S+@\S+\.\S+/.test(email))
    return res.status(400).json({ error: "Email format is invalid" });

  try {
    await User.create({ user_id, name, password, email, phone_number });
    res.status(201).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Error signing up user" });
  }
});

app.get("/get-token", verifyJWT, async (req, res) => {
  const { user_id } = req.query;
  if (!user_id) {
    return res.status(400).json({ success: false, message: "Missing user_id" });
  }
  try {
    const tokenDoc = await Token.findOne({ user_id: user_id });
    if (tokenDoc) {
      res.json({ success: true, token: tokenDoc.token });
    } else {
      res
        .status(404)
        .json({ success: false, message: "Token not found for this user" });
    }
  } catch (error) {
    console.error("Error retrieving token:", error);
    res.status(500).json({ error: "Error retrieving token" });
  }
});

// ✅ Modified to generate JWT
app.post("/login", async (req, res) => {
  const { user_id, password } = req.body;
  const user = await User.findOne({ user_id, password });
  if (!user)
    return res.status(401).json({ error: "Invalid user ID or password" });

  const token = jwt.sign(
    { user_id: user.user_id, email: user.email },
    JWT_SECRET,
    { expiresIn: "2h" }
  );
  res.json({ success: true, token, user });
});

app.post("/save-token", verifyJWT, async (req, res) => {
  const { userId, token } = req.body;
  console.log("Received token:", userId, token);

  if (!userId || !token) {
    return res.status(400).json({ error: "User ID and token are required" });
  }
  try {
    const userUpdateResult = await User.updateOne(
      { user_id: userId },
      { $set: { device_token: token } }
    );
    if (userUpdateResult.matchedCount === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    const existingToken = await Token.findOne({ user_id: userId, token });
    if (existingToken) {
      return res.status(200).json({
        success: "Token already exists in tokens collection, user updated",
      });
    }
    await Token.create({ user_id: userId, token });
    res.status(200).json({
      success: "Token saved in both users and tokens collections",
    });
  } catch (err) {
    console.error("Error saving token:", err);
    res.status(500).json({ error: "Database error" });
  }
});

app.get("/orders", verifyJWT, async (req, res) => {
  try {
    const orders = await Order.find({});
    res.json(orders);
  } catch {
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

app.put("/food-items/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const { available } = req.body;
  if (typeof available !== "boolean")
    return res.status(400).json({ error: "Invalid availability status" });

  await FoodItem.updateOne({ id }, { available });
  res.json({ success: true });
});

app.get("/restaurants", async (req, res) => {
  const restaurants = await Restaurant.find({});
  // console.log(restaurants);
  res.json(restaurants);
});

app.get("/food-items/:restaurantId", async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const items = await FoodItem.find({ restaurant_id: restaurantId });
    res.json(items);
  } catch (error) {
    console.error("Error fetching food items:", error);
    res.status(500).json({ error: "Failed to fetch food items" });
  }
});

// Cart routes
app.get("/user-cart-items", async (req, res) => {
  try {
    const { userId } = req.query;
    console.log("Fetching cart items for userId:", userId);

    const cartItems = await Cart.find({ userId });
    console.log("Found cart items:", cartItems);

    res.json(cartItems);
  } catch (error) {
    console.error("Error fetching cart items:", error);
    res.status(500).json({ error: "Failed to fetch cart items" });
  }
});

app.post("/usercart/add-item", async (req, res) => {
  try {
    const {
      userId,
      itemId,
      itemName,
      price,
      imageUrl,
      restaurantId,
      quantity,
    } = req.body;

    console.log("Received cart add request:", req.body);

    // Check if item already exists in cart
    const existingItem = await Cart.findOne({ userId, itemId });
    console.log("Existing item:", existingItem);

    if (existingItem) {
      // Update quantity
      await Cart.updateOne(
        { userId, itemId },
        { $inc: { quantity: quantity || 1 } }
      );
      console.log("Updated existing item quantity");
    } else {
      // Add new item
      const newCartItem = await Cart.create({
        userId,
        itemId,
        itemName,
        price,
        imageUrl,
        restaurant_id: restaurantId,
        quantity: quantity || 1,
      });
      console.log("Created new cart item:", newCartItem);
    }

    res.json({ success: true, message: "Item added to cart" });
  } catch (error) {
    console.error("Error adding item to cart:", error);
    res.status(500).json({ error: "Failed to add item to cart" });
  }
});

// Add cart increment/decrement routes
app.post("/usercart/increment-item", async (req, res) => {
  try {
    const { userId, itemId } = req.body;

    await Cart.updateOne({ userId, itemId }, { $inc: { quantity: 1 } });

    res.json({ success: true, message: "Item quantity increased" });
  } catch (error) {
    console.error("Error incrementing item:", error);
    res.status(500).json({ error: "Failed to increment item" });
  }
});

app.post("/usercart/decrement-item", async (req, res) => {
  try {
    const { userId, itemId } = req.body;

    const item = await Cart.findOne({ userId, itemId });

    if (!item) {
      return res.status(404).json({ error: "Item not found in cart" });
    }

    if (item.quantity <= 1) {
      // Remove item if quantity becomes 0
      await Cart.deleteOne({ userId, itemId });
    } else {
      // Decrease quantity
      await Cart.updateOne({ userId, itemId }, { $inc: { quantity: -1 } });
    }

    res.json({ success: true, message: "Item quantity decreased" });
  } catch (error) {
    console.error("Error decrementing item:", error);
    res.status(500).json({ error: "Failed to decrement item" });
  }
});

// Add delete items route
app.post("/delete-items", async (req, res) => {
  try {
    const { userId, restaurantId } = req.body;

    await Cart.deleteMany({ userId, restaurant_id: restaurantId });

    res.json({ success: true, message: "Cart items deleted" });
  } catch (error) {
    console.error("Error deleting cart items:", error);
    res.status(500).json({ error: "Failed to delete cart items" });
  }
});

app.post("/place-order", verifyJWT, async (req, res) => {
  const { userEmail, userName, userPhone, items, totalAmount, status, userId } =
    req.body;
  const newOrder = await Order.create({
    user_email: userEmail,
    user_name: userName,
    user_phone: userPhone,
    items,
    total_amount: totalAmount,
    status,
    user_id: userId,
  });
  res.json({ success: true, orderId: newOrder._id });
});

app.patch("/orders/:id", verifyJWT, async (req, res) => {
  const id = req.params.id;
  const { status } = req.body;

  const order = await Order.findById(id);
  if (!order) return res.status(404).json({ error: "Order not found" });

  await Order.findByIdAndUpdate(id, { status });
  res.json({ success: true, message: "Order status updated successfully" });
});

app.get("/", (req, res) => {
  res.send("Welcome to My Server running on port 3500!");
});

const PORT = process.env.PORT || 3500;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
