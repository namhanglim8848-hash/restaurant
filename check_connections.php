<?php
require __DIR__ . '/backend/vendor/autoload.php';
$app = require_once __DIR__ . '/backend/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;

try {
    $maxConns = DB::select("SHOW max_connections");
    echo "=== POSTGRESQL MAX CONNECTIONS ===\n";
    echo "Max connections: " . $maxConns[0]->max_connections . "\n\n";
    
    $connections = DB::select("SELECT pid, usename, datname, client_addr, state, query FROM pg_stat_activity WHERE datname IS NOT NULL");
    echo "=== ACTIVE POSTGRESQL CONNECTIONS ===\n";
    echo "Total connections: " . count($connections) . "\n\n";
    
    // Group by database
    $grouped = [];
    foreach ($connections as $conn) {
        $grouped[$conn->datname][] = $conn;
    }
    
    foreach ($grouped as $db => $conns) {
        echo "Database: $db (Count: " . count($conns) . ")\n";
        foreach ($conns as $c) {
            echo "  - PID: {$c->pid} | User: {$c->usename} | State: {$c->state} | Query: " . substr(trim($c->query), 0, 50) . "\n";
        }
        echo "\n";
    }
} catch (\Exception $e) {
    echo "Error querying pg_stat_activity: " . $e->getMessage() . "\n";
}
