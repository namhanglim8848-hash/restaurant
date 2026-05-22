<?php
try {
    $pdo = new PDO('pgsql:host=127.0.0.1;port=5432;dbname=growstro_central', 'postgres', 'pppppppp10');
    $stmt = $pdo->query("SELECT datname FROM pg_database WHERE datistemplate = false");
    $dbs = $stmt->fetchAll(PDO::FETCH_COLUMN);
    echo "Databases found:\n";
    foreach ($dbs as $db) {
        echo " - $db\n";
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
