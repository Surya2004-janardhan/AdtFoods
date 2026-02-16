# 🍽️ AdtFoods - Campus Food Ordering System

Welcome to **AdtFoods**, a modern full-stack food ordering application designed specifically for campus environments. Built with React Native (Expo) for the mobile frontend and Node.js/Express for the backend, this platform makes ordering food from campus restaurants a breeze!

## ✨ Features

### 🎯 For Students
- **Browse Restaurants**: Explore all available campus restaurants and their menus
- **Smart Menu Discovery**: View detailed food items with prices, descriptions, and availability
- **Easy Ordering**: Add items to cart and place orders with just a few taps
- **Order Tracking**: Monitor your order status in real-time with OTP verification
- **Secure Payments**: Integrated with Razorpay for safe online transactions
- **Order History**: Keep track of all your past orders

### 👨‍🍳 For Staff
- **Menu Management**: Update food item availability on the fly
- **Order Management**: View and process incoming orders
- **Status Updates**: Mark orders as ready for pickup

### ⚡ Performance Features
- **Redis Caching**: Lightning-fast response times for frequently accessed data
- **Optimized Queries**: Efficient database operations with MongoDB
- **Graceful Degradation**: App works seamlessly even without Redis

## 🏗️ Architecture

### Technology Stack

#### Frontend (Mobile App)
- **Framework**: React Native with Expo
- **Navigation**: Expo Router
- **State Management**: React Context API
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **HTTP Client**: Axios

#### Backend (API Server)
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Caching**: Redis (optional but recommended)
- **Authentication**: JWT (JSON Web Tokens)
- **Payment Gateway**: Razorpay

### System Design

```
┌─────────────────┐
│  Mobile App     │
│  (React Native) │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   API Server    │
│   (Express.js)  │
└────┬───────┬────┘
     │       │
     ▼       ▼
┌─────────┐ ┌──────────┐
│ MongoDB │ │  Redis   │
│ (Data)  │ │ (Cache)  │
└─────────┘ └──────────┘
```

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **MongoDB** (v5 or higher) - [Download](https://www.mongodb.com/try/download/community)
- **Redis** (optional) - [Download](https://redis.io/download)
- **Expo CLI** - Install with: `npm install -g expo-cli`
- **Git** - [Download](https://git-scm.com/downloads)

### Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/Surya2004-janardhan/AdtFoods.git
   cd AdtFoods
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Set Up Environment Variables**
   ```bash
   # Copy the example environment file
   cp .env.example .env
   
   # Edit .env with your actual configuration
   # Use your favorite text editor (nano, vim, or VS Code)
   nano .env
   ```

   **Important Configuration Notes:**
   - Set `MONGO_URI` to your MongoDB connection string
   - Set `JWT_SECRET` to a strong random string
   - Configure Redis (optional but recommended for better performance)
   - Add your Razorpay credentials for payment functionality

4. **Start MongoDB** (if running locally)
   ```bash
   # On macOS/Linux
   mongod
   
   # On Windows
   # Start MongoDB service from Services panel
   ```

5. **Start Redis** (optional but recommended)
   ```bash
   # On macOS/Linux
   redis-server
   
   # On Windows
   # Start Redis service or use WSL
   ```

6. **Start the Backend Server**
   ```bash
   # From the project root
   node Backend/server.js
   
   # Or use nodemon for auto-restart during development
   npx nodemon Backend/server.js
   ```

   The server will start on `http://localhost:3500`

7. **Start the Mobile App**
   ```bash
   # In a new terminal, from the project root
   npm start
   
   # Then choose your platform:
   # - Press 'a' for Android
   # - Press 'i' for iOS
   # - Press 'w' for Web
   ```

## 🔧 Configuration

### Environment Variables

All configuration is done through environment variables. See `.env.example` for a complete list of available options.

#### Required Variables
- `MONGO_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT token generation

#### Optional Variables (Recommended)
- `REDIS_URL` or `REDIS_HOST`: Redis connection details for caching
- `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`: Payment gateway credentials
- `PORT`: Server port (default: 3500)

### Redis Caching (Performance Optimization)

Redis caching is **optional** but **highly recommended** for production use. The application intelligently handles Redis availability:

- ✅ **With Redis**: Faster response times, reduced database load
- ✅ **Without Redis**: Full functionality, direct database queries

#### What Gets Cached?

| Data Type | Cache Duration | Why? |
|-----------|----------------|------|
| Food Items | 5 minutes | Menu items don't change frequently |
| Restaurants | 5 minutes | Restaurant list is relatively static |
| Restaurant Menus | 2 minutes | Balance between freshness and performance |
| User Orders | 30 seconds | Recent orders, moderate freshness |
| Order Count | 1 minute | Quick statistics lookup |
| Device Tokens | 10 minutes | Infrequently changing notification data |

#### Cache Invalidation Strategy

The system automatically clears relevant caches when data changes:
- Creating/updating orders → Clears order and order-count caches
- Updating food availability → Clears food items and menu caches
- Saving device tokens → Clears token caches

This ensures users always see accurate information while maintaining optimal performance!

## 📁 Project Structure

```
AdtFoods/
├── Backend/                    # Backend API Server
│   ├── config/                # Configuration files
│   │   ├── database.js       # MongoDB connection
│   │   ├── redis.js          # Redis cache setup
│   │   └── constants.js      # Environment constants
│   ├── controllers/          # Business logic
│   │   ├── authController.js # Authentication
│   │   ├── foodController.js # Food & restaurant management
│   │   ├── orderController.js # Order processing
│   │   └── paymentController.js # Payment handling
│   ├── middleware/           # Express middleware
│   │   ├── auth.js          # JWT authentication
│   │   ├── cache.js         # Redis caching logic
│   │   ├── errorHandler.js  # Error handling
│   │   └── validateRequest.js # Input validation
│   ├── models/              # Database schemas
│   │   ├── User.js
│   │   ├── FoodItem.js
│   │   ├── Restaurant.js
│   │   ├── Order.js
│   │   └── Token.js
│   ├── routes/              # API routes
│   │   ├── authRoutes.js
│   │   ├── foodRoutes.js
│   │   ├── orderRoutes.js
│   │   └── paymentRoutes.js
│   └── server.js            # Entry point
├── app/                     # React Native app screens
├── components/              # Reusable UI components
├── context/                # React Context providers
├── .env.example            # Environment template
├── package.json            # Dependencies
└── README.md              # You are here!
```

## 🔌 API Endpoints

### Authentication
- `POST /login` - User login
- `POST /signup` - User registration
- `GET /verify` - Verify JWT token
- `GET /get-token` - Get device token (cached)
- `POST /save-token` - Save device token

### Restaurants & Food
- `GET /restaurants` - List all restaurants (cached 5 min)
- `GET /restaurants/:id` - Get restaurant details (cached 5 min)
- `GET /restaurants/:restaurantId/menu` - Get restaurant menu (cached 2 min)
- `GET /food-items` - List all food items (cached 5 min)
- `PUT /food-items/:id` - Update food item (staff only)

### Orders
- `GET /orders` - Get all orders (staff only, cached 30 sec)
- `GET /orders/:userId` - Get user orders (cached 30 sec)
- `POST /orders` - Create new order
- `PUT /orders/:id/status` - Update order status (staff only)
- `GET /orders/count` - Get total order count (cached 1 min)

### Payments
- `POST /create-order` - Create Razorpay order
- `POST /verify-payment` - Verify payment signature

### Health Check
- `GET /health` - System health status (includes Redis status)

## 🧪 Testing

### Backend Health Check
```bash
curl http://localhost:3500/health
```

This returns comprehensive system information including:
- Server status and uptime
- MongoDB connection status
- Redis cache status
- Memory usage
- Request details

### Testing Redis Cache

1. **Make a request** to a cached endpoint:
   ```bash
   curl http://localhost:3500/restaurants
   ```

2. **Check the server logs** - You should see:
   ```
   ❌ Cache MISS: restaurants:all
   ```

3. **Make the same request again** - You should see:
   ```
   ✅ Cache HIT: restaurants:all
   ```

The second request will be significantly faster!

## 🎓 How It Works

### Caching Flow

```
Request → Is Redis Available?
           │
           ├─ No → Fetch from Database → Return to User
           │
           └─ Yes → Check Cache
                     │
                     ├─ Cache HIT → Return Cached Data ✨ (Fast!)
                     │
                     └─ Cache MISS → Fetch from Database
                                   → Store in Cache
                                   → Return to User
```

### Authentication Flow

1. User signs up → Account created in MongoDB
2. User logs in → JWT token generated and returned
3. User makes requests → Token verified by middleware
4. Protected routes → Require valid JWT token

### Order Flow

1. User browses menu (cached for performance)
2. User adds items to cart
3. User proceeds to checkout
4. Payment processed via Razorpay
5. Order created with OTP
6. Staff sees order
7. Staff marks as ready
8. User picks up order with OTP verification

## 🚨 Troubleshooting

### Common Issues

**"MongoDB connection error"**
- Ensure MongoDB is running: `mongod` or check your cloud MongoDB service
- Verify `MONGO_URI` in `.env` is correct

**"Redis not configured - running without cache"**
- This is just a warning! The app works fine without Redis
- To enable Redis: Install and start Redis, then configure in `.env`

**"Port 3500 already in use"**
- Change the `PORT` in `.env` to another port like 3501
- Or kill the process using port 3500

**Mobile app can't connect to backend**
- If using physical device, ensure both devices are on the same network
- Update API URL in mobile app configuration to use your computer's IP
- Check firewall settings

## 🔒 Security Best Practices

1. **Never commit `.env` file** - It's in `.gitignore` for a reason!
2. **Use strong JWT secrets** - Generate random strings for production
3. **Enable Redis authentication** - Set `REDIS_PASSWORD` in production
4. **Use HTTPS** - Always use SSL/TLS in production
5. **Sanitize inputs** - The app includes input validation middleware
6. **Regular updates** - Keep dependencies up to date

## 📦 Dependencies

### Backend
- **express** - Web framework
- **mongoose** - MongoDB ODM
- **redis** - Redis client for caching
- **jsonwebtoken** - JWT authentication
- **razorpay** - Payment gateway
- **dotenv** - Environment variable management
- **cors** - Cross-origin resource sharing
- **morgan** - HTTP request logger

### Frontend
- **expo** - React Native framework
- **expo-router** - File-based navigation
- **axios** - HTTP client
- **nativewind** - Tailwind CSS for React Native
- **react-native-razorpay** - Payment integration

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is part of an academic/campus initiative. Please check with the repository owner for licensing details.

## 🙏 Acknowledgments

- Built with ❤️ for campus food lovers
- Powered by open-source technologies
- Inspired by the need for better campus food ordering

## 📞 Support

Having issues? Here's how to get help:
1. Check the [Troubleshooting](#-troubleshooting) section
2. Review the [API documentation](#-api-endpoints)
3. Open an issue on GitHub
4. Check server logs for detailed error messages

---

**Happy Ordering! 🎉**

Made with 🍕 by the AdtFoods Team
