const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config/constants");

// JWT Authentication middleware
const authenticateToken = (req, res, next) => {
  // Skip authentication for login, signup and root routes
  if (req.path === "/login" || req.path === "/signup" || req.path === "/") {
    return next();
  }

  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN format

  if (!token) {
    return res
      .status(401)
      .json({ error: "Authentication required. Please login again." });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res
        .status(403)
        .json({ error: "Session expired. Please login again." });
    }
    req.user = user;
    next();
  });
};

module.exports = authenticateToken;
