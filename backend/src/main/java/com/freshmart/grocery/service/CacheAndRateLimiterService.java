package com.freshmart.grocery.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Resilient Cache and Rate Limiting Service.
 * Attempts Redis first; if Redis is unavailable or disconnected, seamlessly
 * falls back to high-performance thread-safe in-memory caching and token bucket rate limiting.
 */
@Service
public class CacheAndRateLimiterService {

    private static final Logger logger = LoggerFactory.getLogger(CacheAndRateLimiterService.class);

    private final StringRedisTemplate redisTemplate;
    private boolean redisAvailable = true;

    // In-memory fallback cache entry
    private static class CacheEntry {
        final String value;
        final Instant expiry;

        CacheEntry(String value, long ttlSeconds) {
            this.value = value;
            this.expiry = Instant.now().plus(Duration.ofSeconds(ttlSeconds));
        }

        boolean isExpired() {
            return Instant.now().isAfter(expiry);
        }
    }

    // In-memory rate limiting entry
    private static class RateLimitEntry {
        final AtomicInteger count = new AtomicInteger(0);
        final Instant windowReset;

        RateLimitEntry(long windowSeconds) {
            this.windowReset = Instant.now().plus(Duration.ofSeconds(windowSeconds));
        }

        boolean isExpired() {
            return Instant.now().isAfter(windowReset);
        }
    }

    private final Map<String, CacheEntry> inMemoryCache = new ConcurrentHashMap<>();
    private final Map<String, RateLimitEntry> inMemoryRateLimits = new ConcurrentHashMap<>();

    public CacheAndRateLimiterService(@Autowired(required = false) StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
        if (this.redisTemplate == null) {
            this.redisAvailable = false;
            logger.info("RedisTemplate not configured; using In-Memory Fallback Cache & Rate Limiter.");
        }
    }

    // Cache operations
    public void putCache(String key, String value, long ttlSeconds) {
        if (redisAvailable && redisTemplate != null) {
            try {
                redisTemplate.opsForValue().set(key, value, ttlSeconds, TimeUnit.SECONDS);
                return;
            } catch (Exception ex) {
                logger.warn("Redis write failed for key '{}', falling back to In-Memory: {}", key, ex.getMessage());
                redisAvailable = false;
            }
        }
        inMemoryCache.put(key, new CacheEntry(value, ttlSeconds));
    }

    public String getCache(String key) {
        if (redisAvailable && redisTemplate != null) {
            try {
                return redisTemplate.opsForValue().get(key);
            } catch (Exception ex) {
                logger.warn("Redis read failed for key '{}', falling back to In-Memory: {}", key, ex.getMessage());
                redisAvailable = false;
            }
        }
        CacheEntry entry = inMemoryCache.get(key);
        if (entry != null) {
            if (entry.isExpired()) {
                inMemoryCache.remove(key);
                return null;
            }
            return entry.value;
        }
        return null;
    }

    public void evictCache(String key) {
        if (redisAvailable && redisTemplate != null) {
            try {
                redisTemplate.delete(key);
            } catch (Exception ignored) {
                redisAvailable = false;
            }
        }
        inMemoryCache.remove(key);
    }

    /**
     * Rate Limiter: checks if the caller (identified by key, e.g. IP or userId) has exceeded maxRequests in windowSeconds.
     * @return true if request is ALLOWED, false if RATE LIMITED.
     */
    public boolean allowRequest(String key, int maxRequests, long windowSeconds) {
        String rateLimitKey = "ratelimit:" + key;
        if (redisAvailable && redisTemplate != null) {
            try {
                Long count = redisTemplate.opsForValue().increment(rateLimitKey);
                if (count != null && count == 1) {
                    redisTemplate.expire(rateLimitKey, windowSeconds, TimeUnit.SECONDS);
                }
                return count != null && count <= maxRequests;
            } catch (Exception ex) {
                redisAvailable = false;
            }
        }

        // In-memory fallback
        RateLimitEntry entry = inMemoryRateLimits.compute(rateLimitKey, (k, existing) -> {
            if (existing == null || existing.isExpired()) {
                return new RateLimitEntry(windowSeconds);
            }
            return existing;
        });

        int current = entry.count.incrementAndGet();
        return current <= maxRequests;
    }
}
