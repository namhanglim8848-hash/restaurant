<?php
require __DIR__ . '/backend/vendor/autoload.php';
$app = require_once __DIR__ . '/backend/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\Http;
use App\Models\Tenant;

echo "=== GLOBAL ENDPOINT BENCHMARK ===\n";

$tenantId = 'sajilo';
$email = 'owner-sajilo@growstro.test';
$password = 'SajiloStoreOwner2026!';

echo "Logging in...\n";
$loginResponse = Http::post("http://127.0.0.1:8000/api/auth/login", [
    'email' => $email,
    'password' => $password,
    'tenant' => $tenantId,
]);

if ($loginResponse->failed()) {
    die("Login failed! " . $loginResponse->body() . "\n");
}

$token = $loginResponse->json('data.access_token');
echo "Login successful. Token: " . substr($token, 0, 10) . "...\n\n";

$endpoints = [
    'spaces' => 'spaces',
    'tables' => 'tables',
    'customers' => 'customers',
    'categories' => 'categories',
    'products' => 'products',
    'services' => 'services',
    'menu-items' => 'menu-items',
    'orders' => 'orders',
    'kitchen-tickets' => 'kitchen-tickets',
    'invoices' => 'invoices',
    'payments' => 'payments',
    'analytics/overview' => 'analytics/overview',
    'analytics/sales' => 'analytics/sales',
    'analytics/payments' => 'analytics/payments',
    'analytics/customers' => 'analytics/customers',
    'analytics/products' => 'analytics/products',
    'analytics/expenses' => 'analytics/expenses',
    'analytics/due-summary' => 'analytics/due-summary',
    'analytics/top-products' => 'analytics/top-products',
    'analytics/daily-report' => 'analytics/daily-report',
    'daily-reports' => 'daily-reports',
    'staff' => 'staff',
    'staff-invitations' => 'staff-invitations',
];

$slowEndpoints = [];

foreach ($endpoints as $name => $path) {
    $url = "http://127.0.0.1:8000/api/{$tenantId}/{$path}";
    echo "Benchmarking GET $url ...\n";
    
    $times = [];
    $dataCount = 0;
    $status = 0;
    
    // Run 3 attempts
    for ($i = 1; $i <= 3; $i++) {
        // Sleep a bit to make sure requests don't overlap or hit built-in server throttle
        usleep(50000); 
        $start = microtime(true);
        $response = Http::withToken($token)->get($url);
        $duration = (microtime(true) - $start) * 1000;
        
        $status = $response->status();
        $times[] = $duration;
        
        if ($i === 1) {
            $json = $response->json();
            $dataCount = count($json['data']['data'] ?? $json['data'] ?? []);
        }
    }
    
    $avgTime = array_sum($times) / count($times);
    $minTime = min($times);
    $maxTime = max($times);
    
    echo "  -> Status: $status, Count: $dataCount, Avg: " . round($avgTime, 2) . "ms (Min: " . round($minTime, 2) . "ms, Max: " . round($maxTime, 2) . "ms)\n";
    
    if ($avgTime > 100) {
        $slowEndpoints[] = [
            'name' => $name,
            'avg' => $avgTime,
            'min' => $minTime,
            'max' => $maxTime,
        ];
    }
}

echo "\n=== BENCHMARK COMPLETE ===\n";
if (count($slowEndpoints) > 0) {
    echo "WARNING: The following endpoints are slower than 100ms on average:\n";
    foreach ($slowEndpoints as $se) {
        echo " - " . $se['name'] . ": Avg " . round($se['avg'], 2) . "ms\n";
    }
} else {
    echo "SUCCESS: All tested endpoints are running under 100ms!\n";
}
