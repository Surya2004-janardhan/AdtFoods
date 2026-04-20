# AdtFoods Repository Deep Technical Explanation

## 1) High-Level Product View

AdtFoods is a full-stack food ordering application with:
- **Mobile frontend** built using **Expo + React Native + expo-router**
- **Backend API** built using **Express + MongoDB (Mongoose)**
- **Caching layer** via **Redis** (optional; app degrades gracefully when Redis is not configured)
- **Payments** integrated with **Razorpay**

The project is organized as a monorepo-like single repository where frontend and backend source live together.

---

## 2) Repository Structure and What Each Folder Does

## Root-level folders/files
- `/app`: expo-router screens (route-based UI pages)
- `/components`: reusable UI wrappers/components (layout, nav, notifications)
- `/context`: React Context providers for Auth, Food, Cart, Orders domain state
- `/config`: shared frontend configuration constants
- `/Backend`: Express API server, routes, controllers, models, middleware, config
- `/assets`, `/images`: icons, fonts, static image assets used by mobile UI
- `/global.css`, `tailwind.config.js`, `metro.config.js`, `babel.config.js`: NativeWind/Tailwind + Expo build setup
- `axiosConfig.js`: frontend axios instance with auth interceptors
- `apiConfig.js` + `config/apiConfig.js`: frontend API + Razorpay constants (duplicated location)
- `server-dummy.js`: backend-like server entry without Redis health details (legacy/testing variant)

## Backend subfolders
- `/Backend/config`: DB/Redis/env constants
- `/Backend/controllers`: request handlers implementing business logic
- `/Backend/middleware`: auth, validation, cache, rate-limit, error handlers
- `/Backend/models`: Mongoose schemas for users, tokens, restaurants, food items, orders
- `/Backend/routes`: route-to-controller wiring + middleware chain composition
- `/Backend/scripts`: seed logic to bootstrap restaurants and menu data
- `/Backend/utils`: helper constants/messages (currently effectively unused)

---

## 3) End-to-End Architecture Flow

1. App starts from `app/index.js` splash logic.
2. Authentication state is loaded from local storage by `AuthContext`.
3. `AuthWrapper` routes user to auth or role-specific home screen.
4. `FoodContext`, `CartContext`, `OrdersContext` provide domain APIs + local caching.
5. UI screens call context methods; contexts call backend using axios/fetch.
6. Backend receives requests via routes, passes through middleware (auth/validation/cache/rate-limit), reaches controllers.
7. Controllers use Mongoose models to read/write MongoDB.
8. Responses may be cached by Redis middleware when enabled.
9. Payment flow:
   - frontend creates Razorpay order through backend
   - Razorpay checkout happens in app
   - frontend stores pending payment payload
   - success screen verifies payment signature via backend
   - verified payment creates final order record in DB

---

## 4) Frontend Bootstrapping, Layout, and Navigation

### `app/_layout.js`
**Function: `Layout()`**
- Loads custom font families before rendering app routes.
- Composes providers in this order: `AuthProvider -> FoodProvider -> CartProvider -> OrdersProvider`.
- Wraps route tree in `AuthWrapper` and `MainLayout`.
- Registers all screens in expo-router `<Stack>` and disables default headers.

### `app/index.js`
**Function: `IndexScreen()`**
- Handles startup splash timing and network connectivity listener.
- Reads `userToken` from AsyncStorage after splash completion.
- Role-based redirects:
  - `staff` token -> `/StaffFoodItemsScreen`
  - any token -> `/HomeScreen`
  - no token -> `/AuthScreen`
- Keeps native splash visible until custom delay completes.

### `components/MainLayout.js`
**Function: `MainLayout({ children })`**
- Computes if bottom navigation should render based on active route path.
- Loads user role from storage and decides staff/user nav variant.
- Hides bottom nav while keyboard is visible.

### `components/AuthWrapper.js`
**Function: `AuthWrapper({ children })`**
- Uses `AuthContext` state (`user`, `loading`) and current route segments.
- Redirect rules:
  - logged-in user on auth page -> redirect to role home
  - logged-out user on protected page -> redirect to auth
- Shows loading gate while auth bootstrap is in progress.

### `components/BottomNavigation.js`
**Functions:**
- `BottomNavigation({ userRole })`: renders role-aware tab bar.
- `handleNavigation(route)`: guarded push/replace fallback navigation.
- `getNavigationItems()`: returns tab set for staff vs user.
- `isActiveRoute(route)`: normalizes route strings and marks active tab.

### `components/CustomNotification.js`
**Functions:**
- `CustomNotification({ message, type, visible })`: UI notification renderer.
- `getNotificationStyle()`: maps notification type to colors/icons.

---

## 5) Frontend Domain State (React Context Layers)

### `context/AuthContext.js`
**Provider: `AuthProvider`**
Key functions:
- `loadAuthState` (inside `useEffect`): restores user/token, validates local expiry, sets axios Authorization header, runs background `/verify`.
- `clearAuthData()`: removes stored auth/session keys and clears axios auth header.
- `login(userId, password)`: calls `/login`, stores profile/token/role/expiry in AsyncStorage, updates context state.
- `signup(userData)`: calls `/signup`, returns success message (no token issued on signup).
- `logout()`: clears auth state and storage.
- `isAuthenticated()`: true if token exists.
- `isStaff()`: true when `user.user_id === "1"`.

### `context/FoodContext.js`
- Implements **restaurant/menu retrieval + cache-aware fetch strategy**.
Key functions:
- `isCacheValid(timestamp)`: TTL validation helper.
- `loadCachedRestaurants()`: reads and validates restaurant cache from AsyncStorage.
- `saveRestaurantsToCache(data)`: persists restaurants + timestamp.
- `clearRestaurantCache()`: cache invalidation utility.
- `fetchRestaurants(forceRefresh)`: cache-first or network fetch for `/restaurants`.
- `fetchFoodItems()`: fetches `/food-items` for staff/global menu list.
- `getFoodItemsByRestaurant(restaurantId, forceRefresh)`: per-restaurant menu fetch with per-restaurant cache keys.
- `getRestaurantById(restaurantId)`: direct `/restaurants/:id` lookup.
- `updateFoodItemAvailability(itemId, available)`: updates backend then invalidates all menu cache keys.

### `context/CartContext.js`
- Manages **multi-restaurant carts** in one state object keyed by restaurant ID.
Key functions:
- `loadCartFromStorage()`, `saveCartToStorage()`: persistent cart hydration/sync.
- `getCartItems(restaurantId)`: returns cart list for restaurant.
- `getCurrentRestaurantInfo(restaurantId)`: returns selected restaurant metadata.
- `setCurrentRestaurant(restaurantId, restaurantInfo)`: sets active restaurant and initializes empty cart bucket.
- `addToCart(item, restaurantId)`: add/update/remove logic by quantity semantics.
- `removeFromCart(itemId, restaurantId)`: hard delete item.
- `updateQuantity(itemId, quantity, restaurantId)`: quantity mutation with auto-remove at zero.
- `calculateTotal(restaurantId)`: sum of `price * quantity`.
- `getItemQuantity(itemId, restaurantId)`: read helper for quantity controls.
- `clearRestaurantCart(restaurantId)`: empties one restaurant cart.
- `clearAllCarts()`: wipes all cart state + storage keys.
- `getCartCount(restaurantId)`, `hasCartItems(restaurantId)`, `getActiveRestaurantIds()`: derived selectors.

### `context/OrdersContext.js`
- Handles order retrieval/mutations with short TTL caching.
Key functions:
- `isCacheValid(timestamp)`, `loadCachedOrders(cacheKey)`, `saveOrdersToCache(cacheKey, data)`, `clearOrdersCache()`.
- `fetchAllOrders(forceRefresh)`: staff/all-orders data path.
- `fetchUserOrders(userId, forceRefresh)`: per-user orders data path.
- `createOrder(orderData)`: creates order then clears order caches.
- `updateOrderStatus(orderId, status)`: updates status and invalidates caches.
- `getOrdersForUser(userId, isStaff)`: role-aware convenience fetch.
- `addOrder(newOrder)`: local state append helper.

---

## 6) Frontend Screens and Their Core Behavior

### `app/AuthScreen.js`
**Components/functions:**
- `InputField(...)`: reusable labeled input with optional password eye-toggle.
- `AuthScreen()`:
  - `showNotification(message, type)`
  - `handleLogin()` with client-side checks then `authContext.login`
  - validators: `validateEmail`, `validatePhoneNumber`, `validatePassword`, `validateUserId`
  - `handleSignup()` with full input validation then `authContext.signup`
- Implements dual-mode login/signup UX and success/error notifications.

### `app/HomeScreen.js`
**Function: `HomeScreen()`**
- Loads user role and restaurants via `FoodContext` with cache-awareness.
- Fetches menu preview for each restaurant (`fetchMenusForRestaurants`).
- Supports pull-to-refresh (`onRefresh`) and cache reset (`handleClearCache`).
- Search filter on restaurant name/cuisine/location.
- `handleBrowseMenu(restaurant)` navigates to restaurant menu page.
- `renderRestaurantCard` builds rich visual card with image/metadata/preview CTA.

### `app/UserFoodItemsScreen.js`
**Function: `UserFoodItemsScreen()`**
- Reads `restaurantId` from route params.
- Fetches restaurant + menu and sets current cart restaurant.
- `handleAddToCart`, `handleQuantityChange`, `navigateToCart` control cart behavior.
- `renderFoodItem` renders availability and quantity controls.

### `app/UserCartScreen.js`
**Function: `UserCartScreen()`**
- Displays active restaurant cart.
- `getTotalPrice`, `handleUpdateQuantity`, `handleClearCart`, `handleCheckout`.
- Computes subtotal + delivery + tax and transitions to payment.

### `app/PaymentScreen.js`
**Function: `PaymentScreen()`**
- Computes payment totals from cart + fees.
- `getNextOrderId()` fetches `/orders/count` fallback to timestamp-based number.
- `showNotification(...)` UI helper.
- `placeOrder()`:
  - validates token/user/cart
  - creates Razorpay order via backend `/create-order`
  - opens native Razorpay checkout
  - on success stores `pendingPayment` payload in AsyncStorage
  - routes to `/PaymentSuccessScreen`
  - on failure/cancel shows message then routes back to cart
- `renderCartItem` shows ordered items in summary.

### `app/PaymentSuccessScreen.js`
**Function: `PaymentSuccessScreen()`**
- On mount `processPayment()`:
  - reads `pendingPayment`
  - verifies signature via `/verify-payment`
  - creates final order via `OrdersContext.createOrder`
  - clears cart and pending payment marker
- `viewOrders()` resets stack by replacing to home then pushing orders.

### `app/OrdersScreen.js`
**Function: `OrdersScreen()`**
- Loads staff or user orders via `getOrdersForUser`.
- Search filters by order id, order number, restaurant, and item names.
- `getStatusColor`, `getStatusText` map statuses.
- `handleUpdateOrderStatus` allows staff updates.
- `renderOrderItem` renders full order details including OTP and items.

### `app/StaffFoodItemsScreen.js`
**Function: `StaffFoodItemsScreen()`**
- Loads all food items.
- `toggleAvailability(itemId)` updates item availability with in-flight lock per item.
- `renderFoodItem` shows switch and item details.

### `app/StaffOrdersScreen.js`
**Function: `StaffOrdersScreen()`**
- Loads all orders and supports filter tabs.
- `getStatusColor`, `getStatusText`, `getFilteredOrders`.
- `updateOrderStatus(orderId, newStatus)` with per-order in-flight lock.
- `formatFoodItemDisplay(foodItem)` handles both string/object item formats.
- `renderOrder` displays operational order card and action buttons.

### `app/NotificationsScreen.js`
**Function: `NotificationsScreen()`**
- Placeholder “coming soon” UI.
- `getUserRole` read and `handleGoBack` navigation utility.

### `app/AccountScreen.js`
**Function: `AccountScreen()`**
- Loads profile from local storage and role metadata.
- `handleLogout()` confirms then calls context logout.
- Local components:
  - `ProfileItem(...)` info row renderer
  - `MenuButton(...)` action row renderer

### `app/PaymentScreen_clean.js`
- Legacy/alternate payment screen implementation.
- Same concept as `PaymentScreen`, but different endpoint/token conventions and direct order creation within Razorpay success callback.
- Main helpers: `calculateSubtotal`, `getNextOrderId`, `placeOrder`, `renderCartItem`.

---

## 7) Networking and Config Layer

### `axiosConfig.js`
- Creates axios instance with base URL.
- Request interceptor attaches `authToken` from AsyncStorage.
- Response interceptor on 401/403 clears auth token and sets `authRedirect` marker.

### `config/apiConfig.js` and root `apiConfig.js`
- API URL and endpoint path constants.
- Razorpay key and branding metadata.
- Duplicated config file location indicates technical debt / consolidation opportunity.

### `config/constants.js` and `config/database.js` (root)
- Node-style env constants and DB connect helper at root level mirror backend equivalents.

---

## 8) Backend Server Lifecycle

### `Backend/server.js`
- Loads env via dotenv.
- Connects MongoDB and Redis (`connectDB`, `connectRedis`).
- Registers middleware (`json`, `urlencoded`, `cors`, `morgan`).
- Mounts all routes on `/`.
- Exposes `/` welcome and `/health` diagnostic endpoint.
- Applies `notFoundHandler` then `errorHandler`.
- Starts listening on port 3500 and handles unhandled promise rejections.

### `server-dummy.js`
- Simpler server variant without Redis integration and detailed health endpoint.
- Useful as fallback/local template.

---

## 9) Backend Middleware (Cross-Cutting Concerns)

### `Backend/middleware/auth.js`
**Function: `auth(req,res,next)`**
- Extracts Bearer token and verifies JWT.
- Sets `req.user` on success.
- Rejects missing/invalid/expired sessions.

### `Backend/middleware/validateRequest.js`
**Functions:**
- `basicValidation(...)`: checks body existence for mutation requests.
- `validateRequest(schema)`: schema-driven validation for required, type, pattern, minLength, enum.

### `Backend/middleware/cache.js`
**Functions:**
- `cacheMiddleware(keyPrefix, ttl)`: Redis cache read-through and response write-back.
- `clearCache(keyPattern)`: invalidates keys by pattern after mutating operations.

### `Backend/middleware/rateLimiter.js`
- `authLimiter`: strict auth endpoint throttling.
- `apiLimiter`: broader API throttling.
- `strictLimiter`: tighter sensitive-operation throttling.

### `Backend/middleware/errorHandler.js`
- Uniform server error serializer, with JWT-specific messaging.

### `Backend/middleware/notFoundHandler.js`
- Standard JSON 404 handler.

---

## 10) Backend Routes (HTTP Contract Layer)

### `Backend/routes/authRoutes.js`
- `POST /login` (authLimiter)
- `POST /signup` (authLimiter + cache clear)
- `GET /verify`
- `GET /get-token` (apiLimiter + cache)
- `POST /save-token` (schema validate + strictLimiter + cache clear)

### `Backend/routes/foodRoutes.js`
- `GET /food-items` (cache)
- `PUT /food-items/:id` (auth + validate + cache clear)
- `GET /restaurants` (cache)
- `GET /restaurants/:id` (cache)
- `GET /restaurants/:restaurantId/menu` (cache)

### `Backend/routes/orderRoutes.js`
- `GET /orders/count` (auth + cache)
- `GET /orders` (auth + cache)
- `GET /orders/:userId` (auth + cache)
- `POST /orders` (auth + validate + clear multiple caches)
- `PUT /orders/:id/status` (auth + validate + clear caches)

### `Backend/routes/paymentRoutes.js`
- `POST /create-order` (auth)
- `POST /verify-payment` (auth)

---

## 11) Backend Controllers (Business Logic)

### `Backend/controllers/authController.js`
**Functions:**
- `login(req,res)`: validates credentials, finds user, signs JWT, returns profile+token.
- `signup(req,res)`: validates registration payload, deduplicates by user_id/email, creates user.
- `getToken(req,res)`: fetches stored device token.
- `saveToken(req,res)`: stores/updates device token for push-notification style integration.
- `verifyToken(req,res)`: validates JWT and returns canonical user profile.

### `Backend/controllers/foodController.js`
**Functions:**
- `getAllFoodItems`: list all items with restaurant refs populated.
- `updateFoodItem`: toggles menu availability by ID.
- `getAllRestaurants`: list active restaurants and auto-seed when empty.
- `getRestaurantById`: fetch single restaurant.
- `getFoodItemsByRestaurant`: menu listing for specific restaurant.

### `Backend/controllers/orderController.js`
**Functions:**
- `getTotalOrderCount`: count orders.
- `getAllOrders`: staff/all order listing with populated references.
- `getOrdersByUserId`: user-specific order listing.
- `createOrder`: validates payload, generates OTP and sequential orderNumber, saves and returns populated order.
- `updateOrderStatus`: validates status, updates and returns populated order.

### `Backend/controllers/paymentController.js`
**Functions:**
- `createRazorpayOrder`: validates amount and creates Razorpay order.
- `verifyRazorpayPayment`: verifies HMAC signature from Razorpay callback payload.

---

## 12) Data Models and Persistence Design

### `Backend/models/User.js`
- Basic user identity model (`user_id`, `name`, `password`, `email`, `phone_number`, `device_token`).

### `Backend/models/Token.js`
- Separate token collection linking `user_id` to a device token.

### `Backend/models/Restaurant.js`
- Rich restaurant metadata: identity, cuisine/location, contact, delivery constraints, rating, active state.

### `Backend/models/FoodItem.js`
- Menu item model linked to `Restaurant` via ObjectId ref.
- Availability, vegetarian flag, spice level, nutrition fields, timestamps.

### `Backend/models/Order.js`
- Embedded `orderItemSchema` for line items (`food ref`, `quantity`, `price`).
- Order-level metadata: user/customer, restaurant linkage, totals, payment mode, OTP, status lifecycle, Razorpay IDs.
- pre-save hook updates `updatedAt`.

---

## 13) Seed Script and Initialization Behavior

### `Backend/scripts/seedRestaurants.js`
**Function: `seedRestaurants()`**
- Clears existing `Restaurant` and `FoodItem` data.
- Inserts predefined restaurant dataset.
- Slices predefined menu data in groups of 3 per restaurant.
- Inserts generated menu records linked by `restaurant._id`.
- Called automatically from `foodController.getAllRestaurants` when restaurant collection is empty.

This means first restaurant fetch can self-heal an empty database by bootstrapping baseline content.

---

## 14) Operational Notes and Important Implementation Characteristics

1. **Role model is simplified**:
   - Frontend and backend both infer staff role from `user_id === "1"`.
2. **Mixed API clients**:
   - Most frontend calls use axios instance; payment flow also uses native `fetch` directly.
3. **Dual payment screen files**:
   - `PaymentScreen.js` appears active; `PaymentScreen_clean.js` is alternate/legacy code.
4. **Cache strategy split**:
   - Frontend caches restaurants/menu/orders in AsyncStorage.
   - Backend optionally caches HTTP responses in Redis.
5. **Order status vocabulary mismatch risk**:
   - Some UI uses statuses like `in_progress`, while backend enum currently allows only `pending`, `ready_to_pick`, `cancelled`.
6. **Validation layering**:
   - Frontend has UX validation; backend repeats hard validation for security/data integrity.
7. **Security baseline**:
   - JWT auth middleware protects food update, order, and payment endpoints.
   - Rate-limiters help protect auth/sensitive APIs.

---

## 15) File-by-File Function Index (Quick Reference)

### App + Components + Context
- `app/_layout.js`: `Layout`
- `app/index.js`: `IndexScreen`, inner `handleNavigation`
- `app/AuthScreen.js`: `InputField`, `AuthScreen`, `showNotification`, `handleLogin`, `validateEmail`, `validatePhoneNumber`, `validatePassword`, `validateUserId`, `handleSignup`
- `app/HomeScreen.js`: `HomeScreen`, `fetchInitialData`, `fetchMenusForRestaurants`, `onRefresh`, `handleClearCache`, `handleBrowseMenu`, `renderRestaurantCard`
- `app/UserFoodItemsScreen.js`: `UserFoodItemsScreen`, `fetchFoodItems`, `onRefresh`, `handleAddToCart`, `handleQuantityChange`, `navigateToCart`, `renderFoodItem`
- `app/UserCartScreen.js`: `UserCartScreen`, `getTotalPrice`, `handleUpdateQuantity`, `handleClearCart`, `handleCheckout`, `renderCartItem`, `EmptyCart`
- `app/PaymentScreen.js`: `PaymentScreen`, `calculateSubtotal`, `getNextOrderId`, `showNotification`, `placeOrder`, `renderCartItem`
- `app/PaymentSuccessScreen.js`: `PaymentSuccessScreen`, `processPayment`, `viewOrders`
- `app/OrdersScreen.js`: `OrdersScreen`, `fetchOrders`, `getStatusColor`, `getStatusText`, `handleUpdateOrderStatus`, `renderOrderItem`
- `app/StaffFoodItemsScreen.js`: `StaffFoodItemsScreen`, `loadFoodItems`, `toggleAvailability`, `renderFoodItem`
- `app/StaffOrdersScreen.js`: `StaffOrdersScreen`, `loadOrders`, `getStatusColor`, `getStatusText`, `updateOrderStatus`, `getFilteredOrders`, `getOrderId`, `formatFoodItemDisplay`, `FilterButton`, `renderOrder`
- `app/NotificationsScreen.js`: `NotificationsScreen`, `getUserRole`, `handleGoBack`
- `app/AccountScreen.js`: `AccountScreen`, `getUserProfile`, `handleLogout`, `ProfileItem`, `MenuButton`
- `app/PaymentScreen_clean.js`: `PaymentScreen`, `calculateSubtotal`, `getNextOrderId`, `placeOrder`, `renderCartItem`
- `components/MainLayout.js`: `MainLayout`, `getUserRole`
- `components/AuthWrapper.js`: `AuthWrapper`
- `components/BottomNavigation.js`: `BottomNavigation`, `handleNavigation`, `getNavigationItems`, `isActiveRoute`
- `components/CustomNotification.js`: `CustomNotification`, `getNotificationStyle`
- `context/AuthContext.js`: `AuthProvider`, `loadAuthState`, `clearAuthData`, `login`, `signup`, `logout`, `isAuthenticated`, `isStaff`
- `context/FoodContext.js`: `FoodProvider`, `isCacheValid`, `loadCachedRestaurants`, `saveRestaurantsToCache`, `clearRestaurantCache`, `fetchRestaurants`, `fetchFoodItems`, `getFoodItemsByRestaurant`, `getRestaurantById`, `updateFoodItemAvailability`
- `context/CartContext.js`: `CartProvider`, `loadCartFromStorage`, `saveCartToStorage`, `getCartItems`, `getCurrentRestaurantInfo`, `setCurrentRestaurant`, `addToCart`, `removeFromCart`, `updateQuantity`, `calculateTotal`, `getItemQuantity`, `clearRestaurantCart`, `clearAllCarts`, `getCartCount`, `hasCartItems`, `getActiveRestaurantIds`
- `context/OrdersContext.js`: `OrdersProvider`, `isCacheValid`, `loadCachedOrders`, `saveOrdersToCache`, `clearOrdersCache`, `fetchAllOrders`, `fetchUserOrders`, `createOrder`, `updateOrderStatus`, `getOrdersForUser`, `addOrder`

### Backend
- `Backend/server.js`: app bootstrap + `/health`
- `Backend/config/database.js`: `connectDB`
- `Backend/config/redis.js`: `connectRedis`, `getRedisClient`, `isRedisAvailable`, `setCache`, `getCache`, `deleteCache`, `deleteCachePattern`, `clearAllCache`
- `Backend/controllers/authController.js`: `login`, `signup`, `getToken`, `saveToken`, `verifyToken`
- `Backend/controllers/foodController.js`: `getAllFoodItems`, `updateFoodItem`, `getAllRestaurants`, `getRestaurantById`, `getFoodItemsByRestaurant`
- `Backend/controllers/orderController.js`: `getTotalOrderCount`, `getAllOrders`, `getOrdersByUserId`, `createOrder`, `updateOrderStatus`
- `Backend/controllers/paymentController.js`: `createRazorpayOrder`, `verifyRazorpayPayment`
- `Backend/middleware/auth.js`: `auth`
- `Backend/middleware/cache.js`: `cacheMiddleware`, `clearCache`
- `Backend/middleware/validateRequest.js`: `basicValidation`, `validateRequest`
- `Backend/middleware/rateLimiter.js`: limiter factory object declarations
- `Backend/middleware/errorHandler.js`: `errorHandler`
- `Backend/middleware/notFoundHandler.js`: `notFoundHandler`
- `Backend/scripts/seedRestaurants.js`: `seedRestaurants`

---

## 16) Conclusion

This repository is a complete mobile ordering platform with clear domain separation (auth, food/catalog, cart, orders, payment), role-aware UX, caching at both client and server tiers, and payment verification safeguards. The core architecture is practical and modular, with most business behavior centralized in context providers (frontend) and controllers (backend), while middleware handles reusable API concerns like authentication, validation, caching, and throttling.
