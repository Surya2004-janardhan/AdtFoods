const { getCache, setCache, isRedisAvailable } = require("../config/redis");

// Cache middleware with TTL
const cacheMiddleware = (keyPrefix, ttl = 300) => {
  return async (req, res, next) => {
    // Skip cache if Redis is not available
    if (!isRedisAvailable()) {
      return next();
    }

    try {
      // Generate cache key based on route, params, and query parameters
      let cacheKeySuffix = 
        req.params.id || 
        req.params.restaurantId || 
        req.params.userId || 
        req.query.user_id || 
        "all";
      
      // Include query params if they exist - use sorted keys for deterministic serialization
      const queryString = Object.keys(req.query).length > 0 
        ? `:${JSON.stringify(req.query, Object.keys(req.query).sort())}` 
        : "";
      
      const cacheKey = `${keyPrefix}:${cacheKeySuffix}${queryString}`;

      // Try to get cached data
      const cachedData = await getCache(cacheKey);

      if (cachedData) {
        console.log(`✅ Cache HIT: ${cacheKey}`);
        return res.json(cachedData);
      }

      console.log(`❌ Cache MISS: ${cacheKey}`);

      // Store original json function
      const originalJson = res.json.bind(res);

      // Override json function to cache the response
      res.json = function (data) {
        // Cache the response data
        setCache(cacheKey, data, ttl).catch((err) =>
          console.error("Cache set error:", err)
        );

        // Call original json function
        return originalJson(data);
      };

      next();
    } catch (error) {
      console.error("Cache middleware error:", error);
      next();
    }
  };
};

// Clear specific cache
const clearCache = (keyPattern) => {
  const { deleteCachePattern } = require("../config/redis");
  return async (req, res, next) => {
    try {
      if (isRedisAvailable()) {
        await deleteCachePattern(keyPattern);
        console.log(`🗑️  Cache cleared: ${keyPattern}`);
      }
    } catch (error) {
      console.error("Clear cache error:", error);
    }
    next();
  };
};

module.exports = {
  cacheMiddleware,
  clearCache,
};
