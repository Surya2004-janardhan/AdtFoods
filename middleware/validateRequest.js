// Request validation middleware
const validateRequest = (req, res, next) => {
  if (req.body && Object.keys(req.body).length > 0) {
    return next();
  } else if (req.method === "GET" || req.method === "DELETE") {
    return next();
  }
  return res.status(400).json({ error: "Please provide valid input data" });
};

module.exports = validateRequest;
