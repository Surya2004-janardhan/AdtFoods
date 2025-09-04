const dotenv = require("dotenv");
dotenv.config();

module.exports = {
  PORT: process.env.PORT || 3500,
  MONGO_URI: process.env.MONGO_URI,
  JWT_SECRET: process.env.JWT_SECRET || "adtfoods-jwt-secret-key-2025",
  JWT_EXPIRATION: "24h",
};
