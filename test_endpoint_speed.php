<?php
require __DIR__ . '/backend/vendor/autoload.php';
$app = require_once __DIR__ . '/backend/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\Http;
use App\Models\Tenant;

echo "=== ENDPOINT SPEED TEST ===\n";

$tenantId = 'sajilo';
$email = 'owner-sajilo@growstro.test';
$password = 'SajiloStoreOwner2026!';

// 1. Authenticate to get a token
echo "Logging in to get token...\n";
$loginStart = microtime(true);
$loginResponse = Http::post("http://127.0.0.1:8000/api/auth/login", [
    'email' => $email,
    'password' => $password,
    'tenant' => $tenantId,
]);
$loginDuration = (microtime(true) - $loginStart) * 1000;
echo "Login status: " . $loginResponse->status() . " (took " . round($loginDuration, 2) . "ms)\n";

if ($loginResponse->failed()) {
    echo "Login failed! Response: " . $loginResponse->body() . "\n";
    
    // Let's try logging in via tenant context/directly if that failed
    // Wait, let's check AuthController to see what credentials it accepts
    die("Cannot proceed without successful login\n");
}

$token = $loginResponse->json('data.access_token') ?? $loginResponse->json('access_token');
if (!$token) {
    die("Token not found in response: " . $loginResponse->body() . "\n");
}
echo "Token obtained successfully.\n\n";

// Helper to test endpoint
$testUrl = function($urlPath) use ($token, $tenantId) {
    $url = "http://127.0.0.1:8000/api/{$tenantId}/{$urlPath}";
    echo "Testing GET $url ...\n";
    
    // Run 3 times to see warm/cold times
    for ($i = 1; $i <= 3; $i++) {
        $start = microtime(true);
        $response = Http::withToken($token)
            ->withHeaders(['Connection' => 'close'])
            ->get($url);
        $duration = (microtime(true) - $start) * 1000;
        echo "  Attempt $i: status=" . $response->status() . " time=" . round($duration, 2) . "ms dataCount=" . count($response->json('data.data') ?? []) . "\n";
    }
    echo "\n";
};

$testUrl('spaces');
$testUrl('tables');
$testUrl('orders');
$testUrl('products');
$testUrl('customers');
$testUrl('categories');
$testUrl('services');
$testUrl('menu-items');
$testUrl('invoices');
$testUrl('payments');
$testUrl('staff');
$testUrl('whatsapp-settings');
$testUrl('daily-reports');
$testUrl('settings');
$testUrl('analytics/overview');
