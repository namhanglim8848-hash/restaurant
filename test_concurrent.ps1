$url = "http://127.0.0.1:8000/api/sajilo/spaces"
$jobs = @()
for ($i = 0; $i -lt 5; $i++) {
    $jobs += Start-Job -ScriptBlock {
        $start = Get-Date
        Invoke-WebRequest -Uri $args[0] -UseBasicParsing -ErrorAction SilentlyContinue | Out-Null
        $end = Get-Date
        ($end - $start).TotalMilliseconds
    } -ArgumentList $url
}
Wait-Job $jobs | Out-Null
Receive-Job $jobs
