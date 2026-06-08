param(
  [string]$ServiceRoot = "",
  [string]$HostName = "0.0.0.0",
  [int]$Port = 9880,
  [int]$TimeoutSeconds = 60
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

if (-not $ServiceRoot) {
  $repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
  $ServiceRoot = Join-Path $repoRoot "..\LonglongVoiceService"
}

$serviceRootPath = (Resolve-Path $ServiceRoot).Path
$projectRoot = Join-Path $serviceRootPath "GPT-SoVITS"
$python = Join-Path $projectRoot ".venv\Scripts\python.exe"
$apiFile = Join-Path $serviceRootPath "longlong_tts_api.py"
$logs = Join-Path $serviceRootPath "logs"
$stdout = Join-Path $logs "longlong-shared-server.stdout.log"
$stderr = Join-Path $logs "longlong-shared-server.stderr.log"
$localEndpoint = "http://127.0.0.1:$Port"

if (-not (Test-Path -LiteralPath $python)) {
  throw "Cannot find Python runtime: $python"
}

if (-not (Test-Path -LiteralPath $apiFile)) {
  throw "Cannot find Longlong API file: $apiFile"
}

if (Test-LonglongVoiceApi "$localEndpoint/health") {
  Write-Host "Longlong shared voice server is already ready: $localEndpoint"
} else {
  New-Item -ItemType Directory -Force -Path $logs | Out-Null

  $env:NO_PROXY = "*"
  $env:no_proxy = "*"

  $process = Start-Process `
    -FilePath $python `
    -ArgumentList @("-m", "uvicorn", "longlong_tts_api:app", "--host", $HostName, "--port", "$Port", "--log-level", "info") `
    -WorkingDirectory $serviceRootPath `
    -WindowStyle Hidden `
    -RedirectStandardOutput $stdout `
    -RedirectStandardError $stderr `
    -PassThru

  Write-Host "Starting Longlong shared voice server with process $($process.Id)..."

  $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
  while ((Get-Date) -lt $deadline) {
    if (Test-LonglongVoiceApi "$localEndpoint/health") {
      break
    }

    Start-Sleep -Seconds 1
  }
}

if (-not (Test-LonglongVoiceApi "$localEndpoint/health")) {
  throw "Longlong shared voice server did not become ready within $TimeoutSeconds seconds. Check $stderr"
}

Write-Host "Longlong shared voice server is ready."
Write-Host "Local endpoint: $localEndpoint/tts"

$addresses = Get-NetIPAddress -AddressFamily IPv4 -ErrorAction SilentlyContinue |
  Where-Object {
    $_.IPAddress -ne "127.0.0.1" -and
    $_.IPAddress -notlike "169.254.*" -and
    $_.PrefixOrigin -ne "WellKnown"
  } |
  Select-Object -ExpandProperty IPAddress -Unique

foreach ($address in $addresses) {
  Write-Host "LAN endpoint: http://$address`:$Port/tts"
}

Write-Host "If Windows Firewall asks, allow this server on the private network."
