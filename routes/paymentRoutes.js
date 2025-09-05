const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");
const { auth } = require("../middleware/auth");

// Create Razorpay order
router.post("/create-order", auth, paymentController.createRazorpayOrder);

// Verify Razorpay payment
router.post("/verify-payment", auth, paymentController.verifyRazorpayPayment);

module.exports = router;
