<?php
$harPath = __DIR__ . '/localhost.har';
if (!file_exists($harPath)) {
    die("File not found at: $harPath\n");
}

echo "Reading HAR file...\n";
$data = json_decode(file_get_contents($harPath), true);
if (!$data) {
    die("Failed to parse JSON. Error: " . json_last_error_msg() . "\n");
}

$entries = $data['log']['entries'] ?? [];
echo "Total entries found: " . count($entries) . "\n\n";

$failedOrApiEntries = [];
foreach ($entries as $index => $entry) {
    $req = $entry['request'] ?? [];
    $res = $entry['response'] ?? [];
    $url = $req['url'] ?? '';
    $status = $res['status'] ?? 0;
    
    // We are interested in api requests, php errors, 4xx, 5xx, or localhost requests
    if (strpos($url, '/api/') !== false || strpos($url, ':8000') !== false || $status >= 400 || $status == 0) {
        $failedOrApiEntries[] = [
            'index' => $index,
            'method' => $req['method'] ?? '',
            'url' => $url,
            'status' => $status,
            'time' => $entry['time'] ?? 0,
            'response_text' => $res['content']['text'] ?? '',
            'response_mime' => $res['content']['mimeType'] ?? '',
        ];
    }
}

echo "Found " . count($failedOrApiEntries) . " matching entries.\n\n";

foreach ($failedOrApiEntries as $e) {
    echo "[" . $e['status'] . "] " . $e['method'] . " " . $e['url'] . " (" . round($e['time'], 2) . "ms)\n";
    if ($e['status'] >= 400 || strpos($e['response_text'], 'error') !== false || strpos($e['response_text'], 'exception') !== false) {
        echo "  Response snippet: " . substr($e['response_text'], 0, 300) . "\n";
    }
    // Also log response text if it's api
    if (strpos($e['url'], '/api/') !== false) {
        echo "  API Response: " . substr($e['response_text'], 0, 500) . "\n";
    }
    echo "----------------------------------------\n";
}
