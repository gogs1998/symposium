# Public backend: same supervised server as run_server.ps1, but hardened for a
# publicly-tunnelled domain — admin routes hidden (PUBLIC_MODE) and a per-IP rate
# limit on the generation endpoints so nobody can drain the OpenRouter budget.
# Pair with the cloudflared 'symposium' tunnel (scripts/run_tunnel.ps1).
$env:PUBLIC_MODE = '1'
$env:RATE_LIMIT_PER_MIN = '30'     # per client IP, sliding 60s window
$pidFile = 'C:\SymposiumData\server.pid'

if (Test-Path $pidFile) {
    Get-Content $pidFile | Where-Object { $_ -match '^\d+$' -and [int]$_ -ne $PID } |
        ForEach-Object { try { Stop-Process -Id ([int]$_) -Force -ErrorAction Stop } catch {} }
}
Get-NetTCPConnection -LocalPort 8010 -State Listen -ErrorAction SilentlyContinue |
    ForEach-Object { try { Stop-Process -Id $_.OwningProcess -Force -ErrorAction Stop } catch {} }

Set-Location $PSScriptRoot\..\backend
while ($true) {
    Write-Output "[$(Get-Date -Format 'HH:mm:ss')] starting PUBLIC backend (admin hidden, rate-limited)"
    $child = Start-Process -FilePath "$PWD\venv\Scripts\python.exe" -ArgumentList 'main.py' -NoNewWindow -PassThru
    Set-Content $pidFile "$PID`n$($child.Id)"
    Wait-Process -Id $child.Id
    Write-Output "[$(Get-Date -Format 'HH:mm:ss')] backend exited (code $($child.ExitCode)) - restarting in 3s"
    Start-Sleep -Seconds 3
}
