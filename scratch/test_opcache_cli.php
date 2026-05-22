<?php
echo "CLI OPcache Loaded: " . (function_exists('opcache_get_status') ? 'Yes' : 'No') . "\n";
if (function_exists('opcache_get_status')) {
    $status = opcache_get_status(false);
    echo "CLI OPcache Enabled: " . ($status['opcache_enabled'] ? 'Yes' : 'No') . "\n";
}
