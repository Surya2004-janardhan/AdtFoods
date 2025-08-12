const mongoose = require("mongoose");
require("dotenv").config();

const uri = process.env.mongo_uri;

const foodItemSchema = new mongoose.Schema({}, { strict: false });
const FoodItem = mongoose.model("fooditems", foodItemSchema);

const restaurantIds = [
  "rest001", // Spicy Bites
  "rest002", // Pizza Palace
  "rest003", // Sushi World
];

const dummyFoodItems = [
  // Spicy Bites
  {
    item_id: "item001",
    name: "Paneer Butter Masala",
    price: 180.0,
    image_url:
      "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400",
    description: "Creamy cottage cheese curry with rich tomato gravy.",
    rating: 4.7,
    restaurant_id: restaurantIds[0],
  },
  {
    item_id: "item002",
    name: "Chicken Biryani",
    price: 220.0,
    image_url:
      "https://images.unsplash.com/photo-1563379091339-03246963d80c?w=400",
    description: "Aromatic basmati rice cooked with tender chicken and spices.",
    rating: 4.8,
    restaurant_id: restaurantIds[0],
  },
  {
    item_id: "item003",
    name: "Dal Tadka",
    price: 120.0,
    image_url:
      "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400",
    description: "Yellow lentils tempered with cumin and spices.",
    rating: 4.5,
    restaurant_id: restaurantIds[0],
  },
  // Pizza Palace
  {
    item_id: "item004",
    name: "Margherita Pizza",
    price: 250.0,
    image_url:
      "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400",
    description: "Classic pizza with tomato, mozzarella, and basil.",
    rating: 4.6,
    restaurant_id: restaurantIds[1],
  },
  {
    item_id: "item005",
    name: "Veggie Supreme Pizza",
    price: 270.0,
    image_url:
      "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400",
    description: "Loaded with fresh veggies and cheese.",
    rating: 4.4,
    restaurant_id: restaurantIds[1],
  },
  {
    item_id: "item006",
    name: "Cheese Garlic Bread",
    price: 150.0,
    image_url:
      "https://images.unsplash.com/photo-1571197119382-64419a799645?w=400",
    description: "Crispy bread with cheese and garlic butter.",
    rating: 4.3,
    restaurant_id: restaurantIds[1],
  },
  // Sushi World
  {
    item_id: "item007",
    name: "Salmon Sushi Roll",
    price: 320.0,
    image_url:
      "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400",
    description: "Fresh salmon with seasoned rice and seaweed.",
    rating: 4.9,
    restaurant_id: restaurantIds[2],
  },
  {
    item_id: "item008",
    name: "Veg Hakka Noodles",
    price: 180.0,
    image_url:
      "https://images.unsplash.com/photo-1555126634-323283e090fa?w=400",
    description: "Stir-fried noodles with fresh vegetables and sauces.",
    rating: 4.5,
    restaurant_id: restaurantIds[2],
  },
  {
    item_id: "item009",
    name: "California Roll",
    price: 280.0,
    image_url:
      "https://images.unsplash.com/photo-1617196034796-73dfa7b1fd56?w=400",
    description: "Crab, avocado, and cucumber roll with sesame seeds.",
    rating: 4.7,
    restaurant_id: restaurantIds[2],
  },
];

async function insertFoodItems() {
  try {
    await mongoose.connect(uri);

    // Clear existing food items first
    await FoodItem.deleteMany({});

    await FoodItem.insertMany(dummyFoodItems);
    console.log("Dummy food items inserted successfully!");
    mongoose.disconnect();
  } catch (err) {
    console.error("Error inserting dummy food items:", err);
    mongoose.disconnect();
  }
}

insertFoodItems();
