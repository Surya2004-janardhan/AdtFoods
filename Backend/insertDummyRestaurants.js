const mongoose = require("mongoose");
require("dotenv").config();

const uri = process.env.mongo_uri;

const restaurantSchema = new mongoose.Schema({}, { strict: false });
const Restaurant = mongoose.model("restaurants", restaurantSchema);

const dummyRestaurants = [
  {
    name: "Spicy Bites",
    address: "123 Main St, Hyderabad",
    cuisine: "Indian",
    rating: 4.5,
    image: "https://example.com/images/spicybites.jpg",
    isOpen: true,
  },
  {
    name: "Pizza Palace",
    address: "456 Park Ave, Hyderabad",
    cuisine: "Italian",
    rating: 4.2,
    image: "https://example.com/images/pizzapalace.jpg",
    isOpen: false,
  },
  {
    name: "Sushi World",
    address: "789 Lake Rd, Hyderabad",
    cuisine: "Japanese",
    rating: 4.8,
    image: "https://example.com/images/sushiworld.jpg",
    isOpen: true,
  },
];

async function insertRestaurants() {
  try {
    await mongoose.connect(uri);
    await Restaurant.insertMany(dummyRestaurants);
    console.log("Dummy restaurants inserted successfully!");
    mongoose.disconnect();
  } catch (err) {
    console.error("Error inserting dummy restaurants:", err);
    mongoose.disconnect();
  }
}

insertRestaurants();
