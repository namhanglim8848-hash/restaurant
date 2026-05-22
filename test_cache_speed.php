<?php
require __DIR__ . '/backend/vendor/autoload.php';
$app = require_once __DIR__ . '/backend/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\Cache;

echo "=== CACHE SPEED TEST ===\n";

$start = microtime(true);
Cache::put('test_key', 'test_value', 60);
$time = (microtime(true) - $start) * 1000;
echo "Cache::put took " . round($time, 2) . "ms\n";

$start = microtime(true);
$val = Cache::get('test_key');
$time = (microtime(true) - $start) * 1000;
echo "Cache::get took " . round($time, 2) . "ms (value: $val)\n";

// Run 5 times
for ($i = 1; $i <= 5; $i++) {
    $start = microtime(true);
    Cache::get('test_key');
    $time = (microtime(true) - $start) * 1000;
    echo "Cache::get attempt $i took " . round($time, 2) . "ms\n";
}
