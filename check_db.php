<?php
require __DIR__ . '/backend/vendor/autoload.php';
$app = require_once __DIR__ . '/backend/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;
use App\Models\Tenant;

echo "=== DATABASE STATUS SCRIPT ===\n";

try {
    // 1. Central database test
    $centralDb = DB::connection('central')->getDatabaseName();
    echo "Connected to Central DB: $centralDb\n";
    
    // Check tables in central db
    $tables = DB::connection('central')->select("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
    echo "Central DB Tables count: " . count($tables) . "\n";
    foreach ($tables as $t) {
        echo " - " . $t->table_name . "\n";
    }
    
    // Check tenants
    $tenants = Tenant::all();
    echo "Total tenants in central DB: " . $tenants->count() . "\n";
    foreach ($tenants as $tenant) {
        echo "Tenant ID: " . $tenant->id . "\n";
        echo "  - Data: " . json_encode($tenant->getAttributes()) . "\n";
        echo "  - Domains: " . json_encode($tenant->domains->pluck('domain')) . "\n";
        
        // Try initializing tenancy for this tenant to see if we can query tenant-specific tables
        try {
            tenancy()->initialize($tenant);
            echo "  Successfully initialized tenancy for tenant: " . $tenant->id . "\n";
            $tenantDb = DB::connection()->getDatabaseName();
            echo "  Current connection database name: $tenantDb\n";
            
            // Check counts of tables, spaces, products, etc.
            $tenantTables = DB::select("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
            echo "  Tenant DB Tables count: " . count($tenantTables) . "\n";
            foreach ($tenantTables as $tb) {
                echo "    - " . $tb->table_name . "\n";
            }
            
            // Check spaces
            if (Schema::hasTable('spaces')) {
                echo "  Spaces count: " . DB::table('spaces')->count() . "\n";
            } else {
                echo "  Spaces table DOES NOT EXIST!\n";
            }
            
            // Check tables
            if (Schema::hasTable('tables')) {
                echo "  Tables count: " . DB::table('tables')->count() . "\n";
            } else {
                echo "  Tables table DOES NOT EXIST!\n";
            }

            // Check users/staff
            if (Schema::hasTable('users')) {
                echo "  Users count: " . DB::table('users')->count() . "\n";
                $users = DB::table('users')->get();
                foreach ($users as $u) {
                    echo "    * User: " . $u->email . " (Role: " . ($u->role ?? 'N/A') . ")\n";
                }
            }
            
            tenancy()->end();
        } catch (\Exception $e) {
            echo "  Failed to initialize tenancy or query tenant DB: " . $e->getMessage() . "\n";
        }
    }
} catch (\Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
