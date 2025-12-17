const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require("morgan");
const dotenv = require("dotenv");

// Import routes
const authRoutes = require("./routes/authRoutes");
const foodRoutes = require("./routes/foodRoutes");
const orderRoutes = require("./routes/orderRoutes");
const paymentRoutes = require("./routes/paymentRoutes");

// Import middleware
const errorHandler = require("./middleware/errorHandler");
const notFoundHandler = require("./middleware/notFoundHandler");

// Import configuration
const connectDB = require("./config/database");
// const { MONGO_URI } = require("./config/constants");

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(morgan("dev")); // HTTP request logger

// Routes
app.use("/", authRoutes);
app.use("/", foodRoutes);
app.use("/", orderRoutes);
app.use("/", paymentRoutes);

// Home route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to AdtFoods API" });
});

// 404 handler
app.use(notFoundHandler.notFoundHandler);

// Error handler
app.use(errorHandler.errorHandler);

app.listen(3500, () => {
  console.log("server running successfully on 3500");
});
// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.log("UNHANDLED REJECTION! 💥 Shutting down...");
  console.error(err.name, err.message);
  process.exit(1);
});
