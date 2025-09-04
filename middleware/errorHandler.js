// Error handler middleware
const errorHandler = (err, req, res, next) => {
  console.error("Server error:", err.stack);

  // JWT specific errors
  if (err.name === "JsonWebTokenError") {
    return res
      .status(401)
      .json({ error: "Invalid session. Please login again" });
  }

  if (err.name === "TokenExpiredError") {
    return res
      .status(401)
      .json({ error: "Your session has expired. Please login again" });
  }

  // Generic user-friendly error message
  res.status(err.statusCode || 500).json({
    error: "Something went wrong. Please try again later",
  });
};

module.exports = errorHandler;
