# Supervised backend: restarts uvicorn if it exits for any reason.
# The bare process has died silently several times (Windows console signals,
# concurrent-write hiccups); this keeps the API up until explicitly stopped.
Set-Location $PSScriptRoot\..\backend
while ($true) {
    Write-Output "[$(Get-Date -Format 'HH:mm:ss')] starting backend"
    & venv\Scripts\python.exe main.py
    Write-Output "[$(Get-Date -Format 'HH:mm:ss')] backend exited (code $LASTEXITCODE) - restarting in 3s"
    Start-Sleep -Seconds 3
}
