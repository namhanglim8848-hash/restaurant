<?php
require __DIR__ . '/backend/vendor/autoload.php';
$app = require_once __DIR__ . '/backend/bootstrap/app.php';

// Boot via Console Kernel to avoid HTTP bootstrap issues
$consoleKernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$consoleKernel->bootstrap();

use Illuminate\Http\Request;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Support\Facades\Auth;

echo "=== INTERNAL DISPATCH BENCHMARK ===\n";

try {
    $dbName = \Illuminate\Support\Facades\DB::connection()->getDatabaseName();
    echo "Current DB connection database: " . $dbName . "\n";
} catch (\Exception $e) {
    echo "Failed to connect to DB: " . $e->getMessage() . "\n";
}

$tenantId = 'sajilo';
try {
    echo "Tenant count: " . Tenant::count() . "\n";
    foreach (Tenant::all() as $t) {
        echo " - ID: " . $t->id . "\n";
    }
    $tenant = Tenant::find($tenantId);
} catch (\Exception $e) {
    echo "Tenant query failed: " . $e->getMessage() . "\n";
    $tenant = null;
}
if (!$tenant) {
    die("Tenant not found\n");
}

tenancy()->initialize($tenant);

$user = User::where('email', 'owner-sajilo@growstro.test')->first();
if (!$user) {
    die("User not found\n");
}

// Log the user in
Auth::login($user);

$endpoints = [
    'spaces' => "api/{$tenantId}/spaces",
    'tables' => "api/{$tenantId}/tables",
    'orders' => "api/{$tenantId}/orders",
    'products' => "api/{$tenantId}/products",
    'analytics/overview' => "api/{$tenantId}/analytics/overview",
];

$httpKernel = $app->make(Illuminate\Contracts\Http\Kernel::class);

foreach ($endpoints as $name => $uri) {
    echo "Benchmarking internal $uri ...\n";
    $times = [];
    
    for ($i = 1; $i <= 3; $i++) {
        // Create request
        $request = Request::create($uri, 'GET');
        $request->headers->set('Accept', 'application/json');
        $app->instance('request', $request);
        
        // Dispatched internally
        $start = microtime(true);
        $response = $httpKernel->handle($request);
        $duration = (microtime(true) - $start) * 1000;
        
        $status = $response->getStatusCode();
        $times[] = $duration;
        
        if ($status === 500) {
            echo "    Error Content: " . substr($response->getContent(), 0, 500) . "\n";
        }
        
        if ($i === 1) {
            $content = json_decode($response->getContent(), true);
            $dataCount = count($content['data']['data'] ?? $content['data'] ?? []);
        }
    }
    
    $avgTime = array_sum($times) / count($times);
    echo "  -> Status: $status, Count: $dataCount, Avg: " . round($avgTime, 2) . "ms (Min: " . round(min($times), 2) . "ms, Max: " . round(max($times), 2) . "ms)\n";
}
