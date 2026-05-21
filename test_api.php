<?php

// Bootstrap Laravel
require __DIR__.'/backend/vendor/autoload.php';
$app = require_once __DIR__.'/backend/bootstrap/app.php';

$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

try {
    $dbName = DB::connection()->getDatabaseName();
    echo "Connected to Database: " . $dbName . "\n";
    
    // Check if tables exist
    $tables = DB::select("SELECT table_name FROM information_schema.tables WHERE table_schema='public'");
    echo "Tables in public schema:\n";
    foreach ($tables as $table) {
        echo " - " . $table->table_name . "\n";
    }
    
    // Check tenant and user count
    if (Schema::hasTable('tenants')) {
        $tenantCount = DB::table('tenants')->count();
        echo "Tenants Count: " . $tenantCount . "\n";
        
        $tenants = DB::table('tenants')->get();
        foreach ($tenants as $t) {
            echo "  Tenant: " . json_encode($t) . "\n";
        }
    } else {
        echo "Tenants table does not exist!\n";
    }
    
    if (Schema::hasTable('users')) {
        $userCount = DB::table('users')->count();
        echo "Users Count: " . $userCount . "\n";
    } else {
        echo "Users table does not exist!\n";
    }
} catch (\Exception $e) {
    echo "DB Connection Error: " . $e->getMessage() . "\n";
}
