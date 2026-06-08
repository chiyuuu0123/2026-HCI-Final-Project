$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

$root = Resolve-Path (Join-Path $PSScriptRoot "..")
$voiceDir = Join-Path $root "frontend\assets\longlong-voice"
$apiUrl = "https://huggingface.co/api/datasets/pengyichen/NaiLong-Voice-Clone/tree/main?recursive=1"
$sourceBaseUrl = "https://huggingface.co/datasets/pengyichen/NaiLong-Voice-Clone/resolve/main/"
$modelReferenceUrl = "https://huggingface.co/pengyichen/NaiLong-Voice-Clone/resolve/main/reference.wav?download=true"
$defaultPromptText = [Text.Encoding]::UTF8.GetString([Convert]::FromBase64String("5ZWK77yM5oiR5omN5LiN6KaB6L+Z5qC377yM5aW95a6z576e5ZWK44CC"))
$subset = "nailong_selected/32kHz, 16-bit, Mono (1-channel)"

New-Item -ItemType Directory -Force -Path $voiceDir | Out-Null

$items = Invoke-RestMethod -Uri $apiUrl
$files = @(
  $items |
    Where-Object { $_.type -eq "file" -and $_.path -like "$subset/*.wav" } |
    Sort-Object path
)

if ($files.Count -eq 0) {
  throw "No NaiLong selected voice files were found on Hugging Face."
}

$downloaded = 0

foreach ($file in $files) {
  $name = Split-Path $file.path -Leaf
  $target = Join-Path $voiceDir $name

  if ((Test-Path $target) -and ((Get-Item $target).Length -eq [int64]$file.size)) {
    continue
  }

  $encodedPath = $file.path `
    -replace " ", "%20" `
    -replace ",", "%2C" `
    -replace "\(", "%28" `
    -replace "\)", "%29"
  $url = "$sourceBaseUrl$encodedPath`?download=true"

  Invoke-WebRequest -Uri $url -OutFile $target
  $downloaded += 1
}

$referenceTarget = Join-Path $voiceDir "reference.wav"
if (-not (Test-Path $referenceTarget)) {
  Invoke-WebRequest -Uri $modelReferenceUrl -OutFile $referenceTarget
  $downloaded += 1
}

$manifestItems = @(
  $files | ForEach-Object {
    $name = Split-Path $_.path -Leaf
    [pscustomobject]@{
      file = $name
      sourcePath = $_.path
      size = [int64]$_.size
      sampleRate = 32000
      channels = 1
      bits = 16
    }
  }
)

$manifest = [ordered]@{
  name = "NaiLong selected voice references"
  source = "https://huggingface.co/datasets/pengyichen/NaiLong-Voice-Clone"
  license = "cc-by-nc-sa-4.0"
  subset = $subset
  modelReference = @{
    file = "reference.wav"
    source = "https://huggingface.co/pengyichen/NaiLong-Voice-Clone"
    promptText = $defaultPromptText
  }
  downloadedAt = (Get-Date).ToUniversalTime().ToString("s") + "Z"
  totalFiles = $manifestItems.Count
  totalBytes = [int64](($manifestItems | Measure-Object -Property size -Sum).Sum)
  files = $manifestItems
}

$manifest | ConvertTo-Json -Depth 6 | Set-Content -Path (Join-Path $voiceDir "manifest.json") -Encoding UTF8

Write-Host "Prepared $($files.Count) NaiLong selected voice files ($downloaded downloaded) in $voiceDir."
