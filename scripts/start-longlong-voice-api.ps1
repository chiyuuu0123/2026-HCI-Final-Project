param(
  [string]$Endpoint = "http://127.0.0.1:9880",
  [string]$ServiceScript = "",
  [int]$TimeoutSeconds = 45
)

$ErrorActionPreference = "Stop"

function Test-LonglongVoiceApi {
  param([string]$HealthUrl)

  try {
    $response = Invoke-RestMethod -Uri $HealthUrl -Method Get -TimeoutSec 2
    return [bool]$response.ok
  } catch {
    return $false
  }
}

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$defaultServiceScript = Join-Path $repoRoot "..\LonglongVoiceService\start-longlong-tts.ps1"
$healthUrl = "$Endpoint/health"

if (Test-LonglongVoiceApi $healthUrl) {
  Write-Host "Longlong voice API is ready: $Endpoint"
  exit 0
}

if (-not $ServiceScript) {
  $ServiceScript = $env:LONGLONG_TTS_SERVICE_SCRIPT
}

if (-not $ServiceScript) {
  $ServiceScript = $defaultServiceScript
}

if (-not (Test-Path -LiteralPath $ServiceScript)) {
  throw "Cannot find Longlong voice service script: $ServiceScript"
}

$process = Start-Process `
  -FilePath "powershell.exe" `
  -ArgumentList @("-NoProfile", "-ExecutionPolicy", "Bypass", "-File", $ServiceScript) `
  -WorkingDirectory (Split-Path -Parent $ServiceScript) `
  -WindowStyle Hidden `
  -PassThru

Write-Host "Starting Longlong voice API with process $($process.Id)..."

$deadline = (Get-Date).AddSeconds($TimeoutSeconds)
while ((Get-Date) -lt $deadline) {
  if (Test-LonglongVoiceApi $healthUrl) {
    Write-Host "Longlong voice API is ready: $Endpoint"
    exit 0
  }

  Start-Sleep -Seconds 1
}

throw "Longlong voice API did not become ready within $TimeoutSeconds seconds."
