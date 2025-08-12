const mongoose = require("mongoose");
require("dotenv").config();

const uri = process.env.mongo_uri;

const restaurantSchema = new mongoose.Schema({}, { strict: false });
const Restaurant = mongoose.model("restaurants", restaurantSchema);

const dummyRestaurants = [
  {
    restaurant_id: "rest001",
    name: "Spicy Bites",
    address: "123 Main St, Hyderabad",
    cuisine: "Indian",
    rating: 4.5,
    image: "https://images.unsplash.com/photo-1552566965-6e6be3b0010b?w=400",
    isOpen: true,
  },
  {
    restaurant_id: "rest002",
    name: "Pizza Palace",
    address: "456 Park Ave, Hyderabad",
    cuisine: "Italian",
    rating: 4.2,
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400",
    isOpen: true,
  },
  {
    restaurant_id: "rest003",
    name: "Sushi World",
    address: "789 Lake Rd, Hyderabad",
    cuisine: "Japanese",
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1579027989536-b7b1f875659b?w=400",
    isOpen: true,
  },
];

async function insertRestaurants() {
  try {
    await mongoose.connect(uri);

    // Clear existing restaurants first
    await Restaurant.deleteMany({});

    await Restaurant.insertMany(dummyRestaurants);
    console.log("Dummy restaurants inserted successfully!");
    mongoose.disconnect();
  } catch (err) {
    console.error("Error inserting dummy restaurants:", err);
    mongoose.disconnect();
  }
}

insertRestaurants();
