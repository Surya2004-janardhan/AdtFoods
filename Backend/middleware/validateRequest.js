// Basic request validation middleware
const basicValidation = (req, res, next) => {
  if (req.body && Object.keys(req.body).length > 0) {
    return next();
  } else if (req.method === "GET" || req.method === "DELETE") {
    return next();
  }
  return res.status(400).json({ error: "Please provide valid input data" });
};

// Schema validation middleware
const validateRequest = (schema) => {
  return (req, res, next) => {
    const errors = [];

    // Validate required fields
    Object.keys(schema).forEach((field) => {
      if (
        schema[field].required &&
        (!req.body[field] || req.body[field] === "")
      ) {
        errors.push(`${field} is required`);
      }
    });

    // Validate type, pattern, minLength, etc.
    Object.keys(schema).forEach((field) => {
      if (req.body[field]) {
        // Type validation
        if (schema[field].type) {
          let isValidType = false;

          if (schema[field].type === "array") {
            isValidType = Array.isArray(req.body[field]);
          } else {
            isValidType = typeof req.body[field] === schema[field].type;
          }

          if (!isValidType) {
            errors.push(`${field} should be of type ${schema[field].type}`);
          }
        }

        // Pattern validation
        if (
          schema[field].pattern &&
          !new RegExp(schema[field].pattern).test(req.body[field])
        ) {
          errors.push(`${field} format is invalid`);
        }

        // Min length validation
        if (
          schema[field].minLength &&
          req.body[field].length < schema[field].minLength
        ) {
          errors.push(
            `${field} should be at least ${schema[field].minLength} characters`
          );
        }

        // Enum validation
        if (
          schema[field].enum &&
          !schema[field].enum.includes(req.body[field])
        ) {
          errors.push(
            `${field} should be one of: ${schema[field].enum.join(", ")}`
          );
        }
      }
    });

    if (errors.length > 0) {
      return res.status(400).json({ error: errors.join(", ") });
    }

    next();
  };
};

module.exports = { validateRequest, basicValidation };
