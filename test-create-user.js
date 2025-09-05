const mongoose = require("mongoose");
const User = require("./models/User");

// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/adtfoods", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function createTestUsers() {
  try {
    // Check if users already exist
    const existingUsers = await User.find({});
    console.log("Existing users:", existingUsers);

    // Create a regular test user
    const testUser = new User({
      user_id: "1234567890",
      name: "Test User",
      password: "testpass123",
      email: "test@example.com",
      phone_number: "9876543210",
    });

    // Create a staff user
    const staffUser = new User({
      user_id: "1", // Staff user
      name: "Admin User",
      password: "admin123",
      email: "admin@example.com",
      phone_number: "1234567890",
    });

    // Save users only if they don't exist
    const existingTestUser = await User.findOne({ user_id: "1234567890" });
    if (!existingTestUser) {
      await testUser.save();
      console.log("Test user created:", testUser);
    } else {
      console.log("Test user already exists");
    }

    const existingStaffUser = await User.findOne({ user_id: "1" });
    if (!existingStaffUser) {
      await staffUser.save();
      console.log("Staff user created:", staffUser);
    } else {
      console.log("Staff user already exists");
    }

    console.log("Test users setup complete!");
    process.exit(0);
  } catch (error) {
    console.error("Error creating test users:", error);
    process.exit(1);
  }
}

createTestUsers();
