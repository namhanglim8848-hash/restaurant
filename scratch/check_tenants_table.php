<?php
$pdo = new PDO("pgsql:host=127.0.0.1;port=5432;dbname=growstro_central", "postgres", "pppppppp10");
$stmt = $pdo->query("SELECT * FROM tenants");
var_dump($stmt->fetchAll(PDO::FETCH_ASSOC));

$stmt2 = $pdo->query("SELECT * FROM domains");
var_dump($stmt2->fetchAll(PDO::FETCH_ASSOC));
