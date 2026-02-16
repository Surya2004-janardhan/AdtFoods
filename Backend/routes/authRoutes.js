const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const validateRequest =
  require("../middleware/validateRequest").validateRequest;
const { cacheMiddleware, clearCache } = require("../middleware/cache");
const { authLimiter, strictLimiter, apiLimiter } = require("../middleware/rateLimiter");

// Login validation schema
const loginSchema = {
  user_id: { type: "string", required: true },
  password: { type: "string", required: true },
};

// Signup validation schema
const signupSchema = {
  user_id: { type: "string", required: true, pattern: "^.{10}$" },
  name: { type: "string", required: true },
  password: { type: "string", required: true, minLength: 8 },
  email: { type: "string", required: true, pattern: "\\S+@\\S+\\.\\S+" },
  phone_number: { type: "string", required: true, pattern: "^\\d{10}$" },
};

// Save token validation schema
const saveTokenSchema = {
  userId: { type: "string", required: true },
  token: { type: "string", required: true },
};

// Auth routes
router.post("/login", authLimiter, authController.login);
router.post("/signup", authLimiter, clearCache("user-token:*"), authController.signup);
router.get("/verify", authController.verifyToken); // New route for token verification
router.get(
  "/get-token",
  apiLimiter,
  cacheMiddleware("user-token", 600),
  authController.getToken
);
router.post(
  "/save-token",
  validateRequest(saveTokenSchema),
  strictLimiter,
  clearCache("user-token:*"),
  authController.saveToken
);

module.exports = router;
