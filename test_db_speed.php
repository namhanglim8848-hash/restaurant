<?php
require __DIR__ . '/backend/vendor/autoload.php';
$app = require_once __DIR__ . '/backend/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;
use App\Models\Tenant;

$start = microtime(true);
$tenant = Tenant::find('sajilo');
$time = (microtime(true) - $start) * 1000;
echo "Tenant::find('sajilo') took " . round($time, 2) . "ms\n";

$start = microtime(true);
tenancy()->initialize($tenant);
$time = (microtime(true) - $start) * 1000;
echo "tenancy()->initialize() took " . round($time, 2) . "ms\n";

// Run spaces query 5 times
for ($i = 1; $i <= 5; $i++) {
    $start = microtime(true);
    $spaces = DB::table('restaurant_spaces')->get();
    $time = (microtime(true) - $start) * 1000;
    echo "Query restaurant_spaces attempt $i took " . round($time, 2) . "ms (count: " . count($spaces) . ")\n";
}

// Run tables query 5 times
for ($i = 1; $i <= 5; $i++) {
    $start = microtime(true);
    $tables = DB::table('restaurant_tables')->get();
    $time = (microtime(true) - $start) * 1000;
    echo "Query restaurant_tables attempt $i took " . round($time, 2) . "ms (count: " . count($tables) . ")\n";
}
