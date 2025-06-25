const NodeCache = require('node-cache');
require('dotenv').config();

// Cache com TTL do .env ou padrão de 1 hora
const cache = new NodeCache({ stdTTL: process.env.CACHE_TTL || 3600 });

class CacheService {
    static async getOrSet(key, fetchData) {
        const cachedData = cache.get(key);
        
        if (cachedData) {
            return cachedData;
        }

        const freshData = await fetchData();
        cache.set(key, freshData);
        
        return freshData;
    }

    static invalidate(key) {
        cache.del(key);
    }

    static clear() {
        cache.flushAll();
    }
}

module.exports = CacheService; 