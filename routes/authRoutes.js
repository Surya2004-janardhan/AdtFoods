const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const validateRequest =
  require("../middleware/validateRequest").validateRequest;

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
router.post("/login", validateRequest(loginSchema), authController.login);
router.post("/signup", validateRequest(signupSchema), authController.signup);
router.get("/get-token", authController.getToken);
router.post(
  "/save-token",
  validateRequest(saveTokenSchema),
  authController.saveToken
);

module.exports = router;
