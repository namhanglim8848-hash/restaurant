<?php
require __DIR__ . '/backend/vendor/autoload.php';
$app = require_once __DIR__ . '/backend/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;
use App\Models\Tenant;

$tenant = Tenant::find('sajilo');
if (!$tenant) {
    die("Tenant sajilo not found!\n");
}

tenancy()->initialize($tenant);

$tables = [
    'users',
    'categories',
    'customers',
    'products',
    'services',
    'menu_items',
    'restaurant_spaces',
    'restaurant_tables',
    'orders',
    'invoices',
    'payments',
];

echo "=== sajilo Tenant DB Record Counts ===\n";
foreach ($tables as $table) {
    if (Schema::hasTable($table)) {
        $count = DB::table($table)->count();
        echo "$table: $count records\n";
        if ($count > 0) {
            $first = DB::table($table)->first();
            echo "  First: " . json_encode($first) . "\n";
        }
    } else {
        echo "$table: Table does not exist!\n";
    }
}
