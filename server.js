const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(bodyParser.json());
app.use(cors());
uri =
  "mongodb+srv://chintalajanardhan2004:adityafoods@cluster0.dm083rc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
// MongoDB Connection
mongoose
  .connect(uri, {
    // useNewUrlParser: true,
    // useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Define Schemas and Models
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
// const foodItemSchema = new mongoose.Schema({
//   id: Number,
//   name: String,
//   price: Number,
//   available: Boolean,
// });
const foodItemSchema = new mongoose.Schema({
  id: Number,
  name: String,
  price: Number,
  available: Boolean,
  image: String,
});
const FoodItem = mongoose.model("fooditems", foodItemSchema);

const restaurantSchema = new mongoose.Schema({}, { strict: false });

const User = mongoose.model("users", userSchema);
const Order = mongoose.model("orders", orderSchema);
// const FoodItem = mongoose.model("food_items", foodItemSchema);
const Restaurant = mongoose.model("restaurants", restaurantSchema);
const Token = mongoose.model("tokens", tokensschema);
// ---------------------- Routes ----------------------
app.get("/food-items", async (req, res) => {
  const items = await FoodItem.find({});
  res.json(items);
  // items = json(items)
  // console.log(items);
});

app.post("/signup", async (req, res) => {
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
// token findin endpoint -- error prone area to be checked

app.get("/get-token", async (req, res) => {
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

app.post("/login", async (req, res) => {
  const { user_id, password } = req.body;
  const user = await User.findOne({ user_id, password });
  if (!user)
    return res.status(401).json({ error: "Invalid user ID or password" });
  res.json({ success: true, user });
});
// save-token endpoint later included error prone route fr
app.post("/save-token", async (req, res) => {
  const { userId, token } = req.body;
  console.log("Received token:", userId, token);

  if (!userId || !token) {
    return res.status(400).json({ error: "User ID and token are required" });
  }

  try {
    // Update the device token in the users collection
    const userUpdateResult = await User.updateOne(
      { user_id: userId },
      { $set: { device_token: token } }
    );

    if (userUpdateResult.matchedCount === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if this token already exists in tokens collection
    const existingToken = await Token.findOne({ user_id: userId, token });

    if (existingToken) {
      return res.status(200).json({
        success: "Token already exists in tokens collection, user updated",
      });
    }

    // Insert the token into the tokens collection
    await Token.create({ user_id: userId, token });

    res.status(200).json({
      success: "Token saved in both users and tokens collections",
    });
  } catch (err) {
    console.error("Error saving token:", err);
    res.status(500).json({ error: "Database error" });
  }
});

app.get("/orders", async (req, res) => {
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
  res.json(restaurants);
});

app.post("/place-order", async (req, res) => {
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

app.patch("/orders/:id", async (req, res) => {
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
