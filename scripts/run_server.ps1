# Supervised backend: restarts uvicorn if it exits for any reason.
# The bare process has died silently several times (Windows console signals,
# concurrent-write hiccups); this keeps the API up until explicitly stopped.
#
# Killing this shell does NOT kill the python child, so a naive loop leaves
# orphans that race for port 8010 (we accumulated five of them once). This
# version records supervisor+child PIDs and, on start, kills whatever a
# previous run left behind — so the newest supervisor always takes over and
# there is exactly one server. Stop cleanly with scripts\stop_server.ps1.
$pidFile = 'C:\SymposiumData\server.pid'

if (Test-Path $pidFile) {
    Get-Content $pidFile | Where-Object { $_ -match '^\d+$' -and [int]$_ -ne $PID } |
        ForEach-Object { try { Stop-Process -Id ([int]$_) -Force -ErrorAction Stop } catch {} }
}
Get-NetTCPConnection -LocalPort 8010 -State Listen -ErrorAction SilentlyContinue |
    ForEach-Object { try { Stop-Process -Id $_.OwningProcess -Force -ErrorAction Stop } catch {} }

Set-Location $PSScriptRoot\..\backend
while ($true) {
    Write-Output "[$(Get-Date -Format 'HH:mm:ss')] starting backend"
    $child = Start-Process -FilePath "$PWD\venv\Scripts\python.exe" -ArgumentList 'main.py' `
        -NoNewWindow -PassThru
    Set-Content $pidFile "$PID`n$($child.Id)"
    Wait-Process -Id $child.Id
    Write-Output "[$(Get-Date -Format 'HH:mm:ss')] backend exited (code $($child.ExitCode)) - restarting in 3s"
    Start-Sleep -Seconds 3
}
