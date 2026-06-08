param(
  [Parameter(Position = 0, ValueFromRemainingArguments = $true)]
  [string[]]$TextParts,
  [Parameter()]
  [string]$Endpoint = "http://127.0.0.1:9880",
  [Parameter()]
  [string]$OutFile = ""
)

$ErrorActionPreference = "Stop"

$text = ($TextParts -join " ").Trim()
if (-not $text) {
  $text = [System.Text.Encoding]::UTF8.GetString(
    [System.Convert]::FromBase64String("6b6Z6b6Z5rWL6K+V5LiA5LiL77yM5LuK5aSp5Lmf6Zmq5L2g5a2m5Lmg44CC")
  )
}

if (-not $OutFile) {
  $repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
  $OutFile = Join-Path $repoRoot "frontend\assets\longlong-voice\longlong-api-test.wav"
}

& (Join-Path $PSScriptRoot "start-longlong-voice-api.ps1") -Endpoint $Endpoint

$payload = @{
  text = $text
} | ConvertTo-Json -Depth 5

$bytes = [System.Text.Encoding]::UTF8.GetBytes($payload)
Invoke-WebRequest `
  -Uri "$Endpoint/tts" `
  -Method Post `
  -ContentType "application/json; charset=utf-8" `
  -Body $bytes `
  -OutFile $OutFile

$file = Get-Item -LiteralPath $OutFile
Write-Host "Saved Longlong voice sample: $($file.FullName) ($([math]::Round($file.Length / 1KB, 1)) KB)"
