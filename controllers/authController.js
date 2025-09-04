const User = require("../models/User");
const Token = require("../models/Token");
const jwt = require("jsonwebtoken");
const { JWT_SECRET, JWT_EXPIRATION } = require("../config/constants");

// Handle user login
const login = async (req, res) => {
  try {
    const { user_id, password } = req.body;

    if (!user_id || !password) {
      return res
        .status(400)
        .json({ error: "Please provide both user ID and password" });
    }

    const user = await User.findOne({ user_id, password });
    if (!user) {
      return res.status(401).json({
        error: "Invalid credentials. Please check your user ID and password",
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user._id,
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        isStaff: user.user_id === "1", // Simple staff check based on user_id
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRATION }
    );

    // Return user info and token
    res.json({
      success: true,
      user: {
        name: user.name,
        email: user.email,
        user_id: user.user_id,
        phone_number: user.phone_number,
      },
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res
      .status(500)
      .json({ error: "Unable to login at this time. Please try again later" });
  }
};

// Handle user registration
const signup = async (req, res) => {
  const { user_id, name, password, email, phone_number } = req.body;

  // Validate input fields with user-friendly messages
  if (!user_id || !name || !password || !email || !phone_number)
    return res
      .status(400)
      .json({ error: "Please fill in all required fields" });

  if (user_id.length !== 10)
    return res
      .status(400)
      .json({ error: "User ID must be exactly 10 characters" });

  if (!/^\d{10}$/.test(phone_number))
    return res
      .status(400)
      .json({ error: "Please enter a valid 10-digit phone number" });

  if (password.length < 8)
    return res
      .status(400)
      .json({ error: "Password must be at least 8 characters" });

  if (!/\S+@\S+\.\S+/.test(email))
    return res
      .status(400)
      .json({ error: "Please enter a valid email address" });

  try {
    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [{ user_id: user_id }, { email: email }],
    });

    if (existingUser) {
      return res
        .status(409)
        .json({ error: "User ID or email already registered" });
    }

    // Create new user
    const newUser = await User.create({
      user_id,
      name,
      password,
      email,
      phone_number,
    });

    // Generate JWT token
    const token = jwt.sign(
      {
        id: newUser._id,
        user_id: newUser.user_id,
        name: newUser.name,
        email: newUser.email,
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRATION }
    );

    res.status(201).json({
      success: true,
      message: "Registration successful",
      token,
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({
      error: "Unable to complete registration. Please try again later",
    });
  }
};

// Get device token for a user
const getToken = async (req, res) => {
  const { user_id } = req.query;

  if (!user_id) {
    return res.status(400).json({ error: "User ID is required" });
  }

  try {
    const tokenDoc = await Token.findOne({ user_id: user_id });

    if (tokenDoc) {
      res.json({ success: true, token: tokenDoc.token });
    } else {
      res.status(404).json({ error: "No device token found for this user" });
    }
  } catch (error) {
    console.error("Error retrieving token:", error);
    res.status(500).json({
      error: "Unable to retrieve device token. Please try again later",
    });
  }
};

// Save device token for a user
const saveToken = async (req, res) => {
  const { userId, token } = req.body;

  if (!userId || !token) {
    return res
      .status(400)
      .json({ error: "Both user ID and device token are required" });
  }

  try {
    // Update the device token in the users collection
    const userUpdateResult = await User.updateOne(
      { user_id: userId },
      { $set: { device_token: token } }
    );

    if (userUpdateResult.matchedCount === 0) {
      return res
        .status(404)
        .json({ error: "User not found. Please login again" });
    }

    // Check if this token already exists in tokens collection
    const existingToken = await Token.findOne({ user_id: userId, token });

    if (existingToken) {
      return res.status(200).json({
        success: true,
        message: "Device registered successfully",
      });
    }

    // Insert the token into the tokens collection
    await Token.create({ user_id: userId, token });

    res.status(200).json({
      success: true,
      message: "Device registered successfully",
    });
  } catch (err) {
    console.error("Error saving token:", err);
    res
      .status(500)
      .json({ error: "Unable to register device. Please try again later" });
  }
};

module.exports = {
  login,
  signup,
  getToken,
  saveToken,
};
