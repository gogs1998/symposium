# Stop the supervised backend: kills the supervisor loop AND its python child
# (killing only the shell orphans the child — the bug run_server.ps1 guards
# against). Also sweeps anything still listening on 8010 as a belt-and-braces.
$pidFile = 'C:\SymposiumData\server.pid'

if (Test-Path $pidFile) {
    Get-Content $pidFile | Where-Object { $_ -match '^\d+$' } |
        ForEach-Object { try { Stop-Process -Id ([int]$_) -Force -ErrorAction Stop } catch {} }
    Remove-Item $pidFile -Confirm:$false
}
Get-NetTCPConnection -LocalPort 8010 -State Listen -ErrorAction SilentlyContinue |
    ForEach-Object { try { Stop-Process -Id $_.OwningProcess -Force -ErrorAction Stop } catch {} }
Write-Output "backend stopped"
