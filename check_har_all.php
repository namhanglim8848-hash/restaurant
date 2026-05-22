<?php
$harPath = __DIR__ . '/localhost.har';
if (!file_exists($harPath)) {
    die("File not found\n");
}
$data = json_decode(file_get_contents($harPath), true);
$entries = $data['log']['entries'] ?? [];
$apiEntries = [];
foreach ($entries as $entry) {
    $req = $entry['request'] ?? [];
    $res = $entry['response'] ?? [];
    $url = $req['url'] ?? '';
    if (strpos($url, '/api/') !== false) {
        $apiEntries[] = [
            'method' => $req['method'] ?? '',
            'url' => $url,
            'status' => $res['status'] ?? 0,
            'time' => $entry['time'] ?? 0,
            'started' => $entry['startedDateTime'] ?? '',
            'response' => $res['content']['text'] ?? '',
        ];
    }
}
usort($apiEntries, function($a, $b) {
    return $b['time'] <=> $a['time']; // Sort by duration descending
});
foreach ($apiEntries as $e) {
    echo "[" . $e['status'] . "] " . $e['method'] . " " . $e['url'] . " (" . round($e['time'], 2) . "ms) at " . $e['started'] . "\n";
    echo "  Response: " . substr($e['response'], 0, 200) . "\n";
    echo "--------------------------------------------------\n";
}
