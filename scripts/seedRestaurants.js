const mongoose = require("mongoose");
const Restaurant = require("../models/Restaurant");
const FoodItem = require("../models/FoodItem");

const restaurantData = [
  {
    name: "The Royal Kitchen",
    description: "Authentic Indian cuisine with traditional flavors",
    location: "MG Road, Bangalore",
    cuisine: "Indian, North Indian",
    rating: 4.8,
    deliveryTime: "25-35 mins",
    image:
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=600&fit=crop",
    contactNumber: "+91 9876543210",
    email: "info@royalkitchen.com",
    openingHours: "11:00 AM - 11:30 PM",
    minimumOrder: 150,
    deliveryFee: 25,
  },
  {
    name: "Pizza Corner",
    description: "Wood-fired authentic Italian pizzas",
    location: "Koramangala, Bangalore",
    cuisine: "Italian, Fast Food",
    rating: 4.6,
    deliveryTime: "20-30 mins",
    image:
      "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&h=600&fit=crop",
    contactNumber: "+91 9876543211",
    email: "hello@pizzacorner.com",
    openingHours: "12:00 PM - 12:00 AM",
    minimumOrder: 200,
    deliveryFee: 35,
  },
  {
    name: "Spice Garden",
    description: "Fresh South Indian dishes",
    location: "BTM Layout, Bangalore",
    cuisine: "South Indian, Vegetarian",
    rating: 4.7,
    deliveryTime: "30-40 mins",
    image:
      "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&h=600&fit=crop",
    contactNumber: "+91 9876543212",
    email: "contact@spicegarden.com",
    openingHours: "8:00 AM - 10:00 PM",
    minimumOrder: 120,
    deliveryFee: 20,
  },
];

const foodItemsData = [
  // Royal Kitchen items
  {
    name: "Butter Chicken",
    description: "Creamy tomato-based chicken curry",
    price: 320,
    category: "Main Course",
    isVeg: false,
    spiceLevel: "medium",
    image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=400",
  },
  {
    name: "Dal Makhani",
    description: "Rich black lentil curry",
    price: 280,
    category: "Main Course",
    isVeg: true,
    spiceLevel: "mild",
    image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400",
  },
  {
    name: "Naan",
    description: "Fresh baked Indian bread",
    price: 80,
    category: "Bread",
    isVeg: true,
    spiceLevel: "mild",
    image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400",
  },

  // Pizza Corner items
  {
    name: "Margherita Pizza",
    description: "Classic tomato and mozzarella",
    price: 450,
    category: "Pizza",
    isVeg: true,
    spiceLevel: "mild",
    image: "https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?w=400",
  },
  {
    name: "Pepperoni Pizza",
    description: "Spicy pepperoni with cheese",
    price: 550,
    category: "Pizza",
    isVeg: false,
    spiceLevel: "medium",
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400",
  },
  {
    name: "Garlic Bread",
    description: "Buttery garlic bread sticks",
    price: 180,
    category: "Appetizer",
    isVeg: true,
    spiceLevel: "mild",
    image: "https://images.unsplash.com/photo-1573821663912-6df460f9c684?w=400",
  },

  // Spice Garden items
  {
    name: "Masala Dosa",
    description: "Crispy rice crepe with potato filling",
    price: 180,
    category: "South Indian",
    isVeg: true,
    spiceLevel: "medium",
    image: "https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=400",
  },
  {
    name: "Idli Sambar",
    description: "Steamed rice cakes with lentil curry",
    price: 120,
    category: "South Indian",
    isVeg: true,
    spiceLevel: "mild",
    image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=400",
  },
  {
    name: "Filter Coffee",
    description: "Traditional South Indian coffee",
    price: 60,
    category: "Beverages",
    isVeg: true,
    spiceLevel: "mild",
    image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400",
  },
];

const seedRestaurants = async () => {
  try {
    console.log("Starting restaurant seeding...");

    await Restaurant.deleteMany({});
    await FoodItem.deleteMany({});
    console.log("Cleared existing data");

    const createdRestaurants = await Restaurant.insertMany(restaurantData);
    console.log(`Created ${createdRestaurants.length} restaurants`);

    const foodItemsWithRestaurants = [];

    createdRestaurants.forEach((restaurant, index) => {
      const startIndex = index * 3;
      const endIndex = startIndex + 3;
      const restaurantFoodItems = foodItemsData
        .slice(startIndex, endIndex)
        .map((item) => ({
          ...item,
          restaurant: restaurant._id,
        }));
      foodItemsWithRestaurants.push(...restaurantFoodItems);
    });

    const createdFoodItems = await FoodItem.insertMany(
      foodItemsWithRestaurants
    );
    console.log(`Created ${createdFoodItems.length} food items`);

    return {
      success: true,
      restaurants: createdRestaurants,
      foodItems: createdFoodItems,
    };
  } catch (error) {
    console.error("Error seeding restaurants:", error);
    return { success: false, error: error.message };
  }
};

module.exports = { seedRestaurants };
