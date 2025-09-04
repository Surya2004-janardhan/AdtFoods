const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const morgan = require("morgan");
const dotenv = require("dotenv");

// Import routes
const authRoutes = require("./routes/authRoutes");
const foodRoutes = require("./routes/foodRoutes");
const orderRoutes = require("./routes/orderRoutes");

// Import middleware
const { errorHandler } = require("./middleware/errorHandler");
const { notFoundHandler } = require("./middleware/notFoundHandler");

// Import configuration
const { connectDB } = require("./config/database");

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(morgan("dev")); // HTTP request logger

// Routes
app.use("/", authRoutes);
app.use("/", foodRoutes);
app.use("/", orderRoutes);

// Home route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to AdtFoods API" });
});

// 404 handler
app.use(notFoundHandler);

// Error handler
app.use(errorHandler);

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  console.log("UNHANDLED REJECTION! 💥 Shutting down...");
  console.error(err.name, err.message);
  process.exit(1);
});
