// 404 handler middleware
const notFoundHandler = (req, res, next) => {
  res.status(404).json({ error: "The requested resource was not found" });
};

module.exports = notFoundHandler;
