# Restore Grok portraits if Gemini overwrites again
$src = "D:\Claude\Symposium\assets\portraits\grok"
$dst = "D:\Claude\Symposium\frontend\public\portraits"
Get-ChildItem "$src\*.png" | ForEach-Object {
  $target = Join-Path $dst $_.Name
  if (Test-Path $target) { attrib -R $target }
  Copy-Item $_.FullName $target -Force
  attrib +R $target
  Write-Host "restored $($_.Name)"
}
