const mongoose = require("mongoose");
const { MONGO_URI } = require("./constants");

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
    //   useNewUrlParser: true,
    //   useUnifiedTopology: true,
    });
    console.log("MongoDB connected");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    // Exit process with failure
    process.exit(1);
  }
};

module.exports = connectDB;
