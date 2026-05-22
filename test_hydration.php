<?php
require __DIR__ . '/backend/vendor/autoload.php';
$app = require_once __DIR__ . '/backend/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Tenant;
use Illuminate\Support\Facades\DB;

echo "=== TEST HYDRATION AND TENANCY INITIALIZE ===\n";

try {
    $tenantId = 'sajilo';
    $dbTenant = Tenant::find($tenantId);
    if (!$dbTenant) {
        die("Tenant $tenantId not found in DB\n");
    }

    $attributes = $dbTenant->getAttributes();
    echo "Tenant attributes: " . json_encode($attributes) . "\n";

    // Create a new model instance and set attributes (simulate hydration from cache)
    $hydratedTenant = new Tenant();
    $hydratedTenant->setRawAttributes($attributes);
    $hydratedTenant->exists = true;

    echo "Initializing tenancy with hydrated tenant...\n";
    tenancy()->initialize($hydratedTenant);
    echo "Tenancy initialized successfully! Current database: " . DB::connection()->getDatabaseName() . "\n";

    // Query a tenant table to verify the connection is active and working
    $spacesCount = DB::table('restaurant_spaces')->count();
    echo "Spaces count inside tenant DB: $spacesCount\n";

    tenancy()->end();
    echo "Tenancy ended successfully.\n";

} catch (\Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n" . $e->getTraceAsString() . "\n";
}
