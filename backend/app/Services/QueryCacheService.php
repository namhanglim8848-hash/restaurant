<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Database\Eloquent\Collection;

class QueryCacheService
{
    private int $ttl = 300; // 5 minutes default

    /**
     * Cache a query result
     */
    public function remember(string $key, callable $callback, int $ttl = null): mixed
    {
        return Cache::remember($key, $ttl ?? $this->ttl, $callback);
    }

    /**
     * Flush cache by pattern
     */
    public function flush(string $pattern): void
    {
        Cache::forget($pattern);
    }

    /**
     * Get menu items cache key
     */
    public static function menuItemsCacheKey(array $filters = []): string
    {
        $key = 'menu_items';
        if (!empty($filters)) {
            $key .= ':' . hash('md5', json_encode($filters));
        }
        return $key;
    }

    /**
     * Get spaces cache key
     */
    public static function spacesCacheKey(array $filters = []): string
    {
        $key = 'restaurant_spaces';
        if (!empty($filters)) {
            $key .= ':' . hash('md5', json_encode($filters));
        }
        return $key;
    }

    /**
     * Get tables cache key
     */
    public static function tablesCacheKey(array $filters = []): string
    {
        $key = 'restaurant_tables';
        if (!empty($filters)) {
            $key .= ':' . hash('md5', json_encode($filters));
        }
        return $key;
    }
}
