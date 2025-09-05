const express = require("express");
const router = express.Router();
const paymentController = require("../controllers/paymentController");
const auth = require("../middleware/auth");

// Create Razorpay order
router.post("/create-order", paymentController.createRazorpayOrder);

// Verify Razorpay payment
router.post("/verify-payment", paymentController.verifyRazorpayPayment);

module.exports = router;
