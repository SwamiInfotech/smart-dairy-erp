package com.smartdairy.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.cache.interceptor.CacheErrorHandler;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.cache.concurrent.ConcurrentMapCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.cache.RedisCacheWriter;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.StringRedisSerializer;

import java.time.Duration;
import java.util.Collection;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;
import java.util.concurrent.atomic.AtomicBoolean;

@Configuration
@EnableCaching
@Slf4j
public class CacheConfig {

    @Bean
    public CacheManager cacheManager(RedisConnectionFactory connectionFactory) {
        return new ResilientCacheManager(
                buildRedisCacheManager(connectionFactory),
                new ConcurrentMapCacheManager());
    }

    private RedisCacheManager buildRedisCacheManager(RedisConnectionFactory connectionFactory) {
        RedisCacheConfiguration cacheConfiguration = RedisCacheConfiguration.defaultCacheConfig()
                .entryTtl(Duration.ofMinutes(15))
                .disableCachingNullValues()
                .serializeKeysWith(
                        RedisSerializationContext.SerializationPair.fromSerializer(new StringRedisSerializer()))
                .serializeValuesWith(
                        RedisSerializationContext.SerializationPair.fromSerializer(new GenericJackson2JsonRedisSerializer()));

        return RedisCacheManager.builder(RedisCacheWriter.nonLockingRedisCacheWriter(connectionFactory))
                .cacheDefaults(cacheConfiguration)
                .build();
    }

    @Bean
    public CacheErrorHandler cacheErrorHandler() {
        return new CacheErrorHandler() {
            @Override
            public void handleCacheGetError(RuntimeException exception, Cache cache, Object key) {
                log.warn("Cache GET failed for cache={} key={}. Falling back to database.", cache.getName(), key, exception);
            }

            @Override
            public void handleCachePutError(RuntimeException exception, Cache cache, Object key, Object value) {
                log.warn("Cache PUT failed for cache={} key={}.", cache.getName(), key, exception);
            }

            @Override
            public void handleCacheEvictError(RuntimeException exception, Cache cache, Object key) {
                log.warn("Cache EVICT failed for cache={} key={}.", cache.getName(), key, exception);
            }

            @Override
            public void handleCacheClearError(RuntimeException exception, Cache cache) {
                log.warn("Cache CLEAR failed for cache={}.", cache.getName(), exception);
            }
        };
    }

    private static final class ResilientCacheManager implements CacheManager {

        private final CacheManager delegate;
        private final CacheManager fallback;
        private final ConcurrentMap<String, Cache> caches = new ConcurrentHashMap<>();
        private final AtomicBoolean redisHealthy = new AtomicBoolean(true);

        private ResilientCacheManager(CacheManager delegate, CacheManager fallback) {
            this.delegate = delegate;
            this.fallback = fallback;
        }

        @Override
        public Cache getCache(String name) {
            return caches.computeIfAbsent(name, this::createCache);
        }

        @Override
        public Collection<String> getCacheNames() {
            return delegate.getCacheNames();
        }

        private Cache createCache(String name) {
            Cache cache = delegate.getCache(name);
            if (cache == null) {
                return null;
            }
            Cache fallbackCache = fallback.getCache(name);
            return new ResilientCache(cache, fallbackCache, redisHealthy);
        }
    }

    private static final class ResilientCache implements Cache {

        private final Cache delegate;
        private final Cache fallback;
        private final AtomicBoolean redisHealthy;

        private ResilientCache(Cache delegate, Cache fallback, AtomicBoolean redisHealthy) {
            this.delegate = delegate;
            this.fallback = fallback;
            this.redisHealthy = redisHealthy;
        }

        @Override
        public String getName() {
            return delegate.getName();
        }

        @Override
        public Object getNativeCache() {
            return delegate.getNativeCache();
        }

        @Override
        public ValueWrapper get(Object key) {
            if (!redisHealthy.get()) {
                return fallback.get(key);
            }
            try {
                return delegate.get(key);
            } catch (RuntimeException exception) {
                disableRedis(exception);
                return fallback.get(key);
            }
        }

        @Override
        public <T> T get(Object key, Class<T> type) {
            if (!redisHealthy.get()) {
                return fallback.get(key, type);
            }
            try {
                return delegate.get(key, type);
            } catch (RuntimeException exception) {
                disableRedis(exception);
                return fallback.get(key, type);
            }
        }

        @Override
        @SuppressWarnings("unchecked")
        public <T> T get(Object key, java.util.concurrent.Callable<T> valueLoader) {
            if (!redisHealthy.get()) {
                return fallback.get(key, valueLoader);
            }
            try {
                return delegate.get(key, valueLoader);
            } catch (RuntimeException exception) {
                disableRedis(exception);
                return fallback.get(key, valueLoader);
            }
        }

        @Override
        public void put(Object key, Object value) {
            if (!redisHealthy.get()) {
                fallback.put(key, value);
                return;
            }
            try {
                delegate.put(key, value);
            } catch (RuntimeException exception) {
                disableRedis(exception);
                fallback.put(key, value);
            }
        }

        @Override
        public ValueWrapper putIfAbsent(Object key, Object value) {
            if (!redisHealthy.get()) {
                return fallback.putIfAbsent(key, value);
            }
            try {
                return delegate.putIfAbsent(key, value);
            } catch (RuntimeException exception) {
                disableRedis(exception);
                return fallback.putIfAbsent(key, value);
            }
        }

        @Override
        public void evict(Object key) {
            if (!redisHealthy.get()) {
                fallback.evict(key);
                return;
            }
            try {
                delegate.evict(key);
            } catch (RuntimeException exception) {
                disableRedis(exception);
                fallback.evict(key);
            }
        }

        @Override
        public boolean evictIfPresent(Object key) {
            if (!redisHealthy.get()) {
                return fallback.evictIfPresent(key);
            }
            try {
                return delegate.evictIfPresent(key);
            } catch (RuntimeException exception) {
                disableRedis(exception);
                return fallback.evictIfPresent(key);
            }
        }

        @Override
        public void clear() {
            if (!redisHealthy.get()) {
                fallback.clear();
                return;
            }
            try {
                delegate.clear();
            } catch (RuntimeException exception) {
                disableRedis(exception);
                fallback.clear();
            }
        }

        @Override
        public boolean invalidate() {
            if (!redisHealthy.get()) {
                return fallback.invalidate();
            }
            try {
                return delegate.invalidate();
            } catch (RuntimeException exception) {
                disableRedis(exception);
                return fallback.invalidate();
            }
        }

        private void disableRedis(RuntimeException exception) {
            if (redisHealthy.compareAndSet(true, false)) {
                log.warn("Redis cache is unavailable. Switching cache '{}' to local fallback: {}", getName(), exception.getMessage());
            }
        }
    }
}
