const express = require('express');
const app = express();

// Define the maximum cache size
const maxCacheSize = 10; // Set this to your desired limit

// Create an in-memory cache using a Map
const cache = new Map();

// Create a map to keep track of the number of consecutive hits for each item
const consecutiveHits = new Map();

// Middleware to check the cache before fetching data
function checkCache(req, res, next) {
    const key = req.url;
    if (cache.has(key)) {
        // Check if  the item has been consecutive hits
        if (consecutiveHits.has(key) && consecutiveHits.get(key) >= 2) {
            //Data is in the cache
            const cachedData = cache.get(key);
            res.send(`Cached Data: ${cachedData}`);

        } else {
            // Data is not in the cache,but not consecutively hit enough times, continue to the next middleware
            consecutiveHits.delete(key);
            next();
        }
    }
    else {
        // Data is not in the cache, continue to the next middleware
        consecutiveHits.delete(key);
        next();

    }
}


// Simulated expensive data retrieval function
function fetchData() {
    // Replace this with your actual data retrieval logic
    return 'Data from the database or an API';
}
// Middleware to update the cache after fetching data
function updateCache(req, data) {
    const key = req.url;

    if (cache.size >= maxCacheSize) {
        // If the cache has reached its maximum size, remove the oldest entry
        const firstKey = cache.keys().next().value;
        cache.delete(firstKey);
        consecutiveHits.delete(firstKey);
    }
    // Update the consecutive hits count or initialize it
    if (consecutiveHits.has(key)) {
        consecutiveHits.set(key, consecutiveHits.get(key) + 1);
    } else {
        consecutiveHits.set(key, 1);
    }

    // Store the new data in the cache
    cache.set(key, data);
}

app.get('/data', checkCache, (req, res) => {
    // If data is not in the cache, fetch and store it
    const data = fetchData();
    updateCache(req, data);

    res.send(`Fresh Data: ${data}`);
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
