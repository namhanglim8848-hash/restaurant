<?php
try {
    $pdo = new PDO('pgsql:host=127.0.0.1;port=5432;dbname=growstro_central', 'postgres', 'pppppppp10');
    // Check if it already exists
    $stmt = $pdo->query("SELECT 1 FROM pg_database WHERE datname = 'growstro_central_test'");
    if ($stmt->fetch()) {
        echo "Database growstro_central_test already exists.\n";
    } else {
        $pdo->exec("CREATE DATABASE growstro_central_test");
        echo "Database growstro_central_test created successfully!\n";
    }
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
