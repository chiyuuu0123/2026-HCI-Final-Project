param(
  [string]$ServerHost = "",
  [string]$Endpoint = "",
  [switch]$NoTest
)

$ErrorActionPreference = "Stop"

if (-not $Endpoint) {
  if (-not $ServerHost) {
    throw "Please provide -ServerHost, for example: npm run voice:client -- -ServerHost 192.168.1.23"
  }

  if ($ServerHost.StartsWith("http://") -or $ServerHost.StartsWith("https://")) {
    $Endpoint = $ServerHost
  } else {
    $Endpoint = "http://$ServerHost`:9880/tts"
  }
}

if (-not $Endpoint.EndsWith("/tts")) {
  $Endpoint = $Endpoint.TrimEnd("/") + "/tts"
}

$configDir = Join-Path $env:APPDATA "longmindstudy-desktop"
$configPath = Join-Path $configDir "longlong-voice-config.json"
New-Item -ItemType Directory -Force -Path $configDir | Out-Null

if ((Test-Path -LiteralPath $configPath)) {
  $config = Get-Content -LiteralPath $configPath -Raw | ConvertFrom-Json
} else {
  $config = [PSCustomObject]@{}
}

$config | Add-Member -NotePropertyName endpoint -NotePropertyValue $Endpoint -Force
$config | Add-Member -NotePropertyName provider -NotePropertyValue "gpt-sovits" -Force
$config | Add-Member -NotePropertyName autoStartService -NotePropertyValue $false -Force
$config | Add-Member -NotePropertyName textLang -NotePropertyValue "zh" -Force
$config | Add-Member -NotePropertyName promptLang -NotePropertyValue "zh" -Force
$config | Add-Member -NotePropertyName timeoutMs -NotePropertyValue 45000 -Force

if ($config.PSObject.Properties.Name -contains "referenceAudioPath") {
  $config.PSObject.Properties.Remove("referenceAudioPath")
}

$config | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath $configPath -Encoding UTF8
Write-Host "Longlong voice client endpoint saved: $Endpoint"
Write-Host "Config: $configPath"

if (-not $NoTest) {
  $health = $Endpoint -replace "/tts$", "/health"
  try {
    $response = Invoke-RestMethod -Uri $health -Method Get -TimeoutSec 5
    if ($response.ok) {
      Write-Host "Server health check passed: $health"
    } else {
      Write-Host "Server responded, but health payload was unexpected: $health"
    }
  } catch {
    Write-Host "Could not reach server health endpoint yet: $health"
    Write-Host "Make sure the server computer has run npm run voice:server and allowed Windows Firewall."
  }
}
