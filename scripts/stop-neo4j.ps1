$ErrorActionPreference = "Stop"

$Root = Resolve-Path (Join-Path $PSScriptRoot "..")
$RuntimeDir = Join-Path $env:LOCALAPPDATA "MSNeo4j"

$runtimeProcesses = Get-CimInstance Win32_Process |
  Where-Object { $_.CommandLine -and $_.CommandLine.Contains($RuntimeDir) }
foreach ($process in $runtimeProcesses) {
  Stop-Process -Id $process.ProcessId -Force
}

$processes = Get-Process | Where-Object { $_.ProcessName -like "Neo4j Desktop*" }
if ($processes) {
  $processes | Stop-Process -Force
  Write-Host "Neo4j Desktop process stopped."
} else {
  Write-Host "Neo4j Desktop is not running."
}

if ($runtimeProcesses) {
  Write-Host "MindStudy Neo4j runtime stopped."
}
