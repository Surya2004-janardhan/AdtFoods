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
const { connectRedis } = require("./config/redis");
// const { MONGO_URI } = require("./config/constants");

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
connectDB();
connectRedis();

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

// Health check API
app.get("/health", (req, res) => {
  const healthInfo = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
    server: {
      node_version: process.version,
      platform: process.platform,
      memory: {
        total:
          Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + " MB",
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + " MB",
        free:
          Math.round(
            (process.memoryUsage().heapTotal - process.memoryUsage().heapUsed) /
              1024 /
              1024
          ) + " MB",
      },
    },
    database: {
      mongodb:
        mongoose.connection.readyState === 1 ? "connected" : "disconnected",
      name: mongoose.connection.name || "N/A",
    },
    cache: {
      redis: require("./config/redis").isRedisAvailable()
        ? "connected"
        : "not configured",
    },
    request: {
      method: req.method,
      url: req.url,
      baseUrl: req.baseUrl,
      originalUrl: req.originalUrl,
      protocol: req.protocol,
      secure: req.secure,
      ip: req.ip || req.connection.remoteAddress,
      ips: req.ips,
      hostname: req.hostname,
      headers: req.headers,
      query: req.query,
      params: req.params,
      cookies: req.cookies || {},
      httpVersion: req.httpVersion,
      userAgent: req.get("user-agent"),
    },
  };

  res.json(healthInfo);
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
