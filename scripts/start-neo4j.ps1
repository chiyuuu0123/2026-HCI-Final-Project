$ErrorActionPreference = "Stop"

$Root = Resolve-Path (Join-Path $PSScriptRoot "..")
$LocalDir = Join-Path $Root ".local"
$EnvFile = Join-Path $LocalDir "neo4j.env"
$RuntimeDir = Join-Path $env:LOCALAPPDATA "LongMindStudyNeo4j"
$RuntimeJavaHome = Join-Path $RuntimeDir "java17"

function Get-Neo4jDesktopPath {
  $candidates = @(
    (Join-Path $env:LOCALAPPDATA "Programs\Neo4j Desktop\Neo4j Desktop.exe"),
    (Join-Path $env:ProgramFiles "Neo4j Desktop\Neo4j Desktop.exe"),
    (Join-Path ${env:ProgramFiles(x86)} "Neo4j Desktop\Neo4j Desktop.exe")
  )

  foreach ($candidate in $candidates) {
    if ($candidate -and (Test-Path $candidate)) {
      return $candidate
    }
  }

  $command = Get-Command "Neo4j Desktop.exe" -ErrorAction SilentlyContinue
  if ($command) {
    return $command.Source
  }

  return $null
}

function Get-Neo4jDesktopNeo4jZip {
  $zipDir = Join-Path $env:USERPROFILE ".Neo4jDesktop\distributions\neo4j"
  if (-not (Test-Path $zipDir)) {
    return $null
  }

  return Get-ChildItem -Path $zipDir -Filter "neo4j-*-windows.zip" -ErrorAction SilentlyContinue |
    Sort-Object LastWriteTime -Descending |
    Select-Object -First 1 -ExpandProperty FullName
}

function Get-Neo4jDesktopJavaHome {
  $javaDir = Join-Path $env:USERPROFILE ".Neo4jDesktop\distributions\java"
  if (-not (Test-Path $javaDir)) {
    return $null
  }

  return Get-ChildItem -Path $javaDir -Directory -ErrorAction SilentlyContinue |
    Where-Object { $_.Name -like "zulu17*" -and (Test-Path (Join-Path $_.FullName "bin\java.exe")) } |
    Sort-Object LastWriteTime -Descending |
    Select-Object -First 1 -ExpandProperty FullName
}

function Ensure-RuntimeJavaHome($desktopJavaHome) {
  if (Test-Path (Join-Path $RuntimeJavaHome "bin\java.exe")) {
    return $RuntimeJavaHome
  }

  if (-not (Test-Path $RuntimeDir)) {
    New-Item -ItemType Directory -Path $RuntimeDir | Out-Null
  }

  New-Item -ItemType Junction -Path $RuntimeJavaHome -Target $desktopJavaHome | Out-Null
  return $RuntimeJavaHome
}

function Read-LocalNeo4jEnv {
  $values = @{}
  if (-not (Test-Path $EnvFile)) {
    return $values
  }

  Get-Content -Encoding UTF8 -Path $EnvFile | ForEach-Object {
    $line = $_.Trim()
    if (-not $line -or $line.StartsWith("#")) {
      return
    }
    $separator = $line.IndexOf("=")
    if ($separator -gt 0) {
      $values[$line.Substring(0, $separator)] = $line.Substring($separator + 1)
    }
  }
  return $values
}

function Ensure-LocalNeo4jEnv {
  if (-not (Test-Path $LocalDir)) {
    New-Item -ItemType Directory -Path $LocalDir | Out-Null
  }

  if (-not (Test-Path $EnvFile)) {
    $password = if ($env:NEO4J_PASSWORD) { $env:NEO4J_PASSWORD } else { "longmindstudy-local-neo4j" }
    $username = if ($env:NEO4J_USERNAME) { $env:NEO4J_USERNAME } else { "neo4j" }
    $uri = if ($env:NEO4J_URI) { $env:NEO4J_URI } else { "bolt://localhost:7687" }
    $browserUrl = if ($env:NEO4J_BROWSER_URL) { $env:NEO4J_BROWSER_URL } else { "http://localhost:7474" }
    @(
      "NEO4J_URI=$uri",
      "NEO4J_BROWSER_URL=$browserUrl",
      "NEO4J_USERNAME=$username",
      "NEO4J_PASSWORD=$password"
    ) | Set-Content -Encoding UTF8 -Path $EnvFile
    Write-Host "Created local Neo4j config at $EnvFile"
  }
}

Ensure-LocalNeo4jEnv

function Test-Neo4jConnection {
  $previousErrorActionPreference = $ErrorActionPreference
  $ErrorActionPreference = "Continue"
  try {
    & node (Join-Path $PSScriptRoot "check-neo4j.js") --quiet > $null 2> $null
    return $LASTEXITCODE -eq 0
  } finally {
    $ErrorActionPreference = $previousErrorActionPreference
  }
}

if (Test-Neo4jConnection) {
  Write-Host "Neo4j is already ready at bolt://localhost:7687."
  exit 0
}

$desktopPath = Get-Neo4jDesktopPath
if (-not $desktopPath) {
  throw "Neo4j Desktop is not installed. Install it with: winget install -e --id Neo4j.Neo4jDesktop"
}

Write-Host "Opening Neo4j Desktop..."
Start-Process -FilePath $desktopPath -WindowStyle Hidden

Write-Host "Waiting for Neo4j Desktop database on bolt://localhost:7687..."
for ($attempt = 1; $attempt -le 15; $attempt += 1) {
  if (Test-Neo4jConnection) {
    Write-Host "Neo4j is ready at bolt://localhost:7687."
    exit 0
  }
  Start-Sleep -Seconds 2
}

Write-Host "No running DBMS found in Neo4j Desktop. Starting LongMindStudy local DBMS from Neo4j Desktop bundled runtime..."

$neo4jZip = Get-Neo4jDesktopNeo4jZip
$javaHome = Get-Neo4jDesktopJavaHome
if (-not $neo4jZip -or -not $javaHome) {
  throw @"
Neo4j Desktop opened, but no running database accepted Bolt connections.

Neo4j Desktop also has not finished unpacking its bundled Neo4j/Java runtime yet.
Open Neo4j Desktop once, let it finish first-run initialization, then run npm run neo4j:start again.
"@
}
$javaHome = Ensure-RuntimeJavaHome $javaHome

if (-not (Test-Path $RuntimeDir)) {
  New-Item -ItemType Directory -Path $RuntimeDir | Out-Null
}

$neo4jHome = Get-ChildItem -Path $RuntimeDir -Directory -Filter "neo4j-*" -ErrorAction SilentlyContinue |
  Select-Object -First 1 -ExpandProperty FullName
if (-not $neo4jHome) {
  Expand-Archive -Path $neo4jZip -DestinationPath $RuntimeDir -Force
  $neo4jHome = Get-ChildItem -Path $RuntimeDir -Directory -Filter "neo4j-*" -ErrorAction SilentlyContinue |
    Select-Object -First 1 -ExpandProperty FullName
}

if (-not $neo4jHome) {
  throw "Could not prepare Neo4j runtime under $RuntimeDir."
}

$envValues = Read-LocalNeo4jEnv
$password = if ($env:NEO4J_PASSWORD) { $env:NEO4J_PASSWORD } elseif ($envValues.ContainsKey("NEO4J_PASSWORD")) { $envValues["NEO4J_PASSWORD"] } else { "longmindstudy-local-neo4j" }
$confPath = Join-Path $neo4jHome "conf\neo4j.conf"
$authPath = Join-Path $neo4jHome "data\dbms\auth.ini"

$configLines = @(
  "server.default_listen_address=127.0.0.1",
  "server.bolt.listen_address=:7687",
  "server.http.listen_address=:7474",
  "dbms.security.auth_enabled=true",
  "server.directories.data=data",
  "server.directories.logs=logs"
)
$confContent = @(Get-Content -Encoding UTF8 -Path $confPath)
foreach ($line in $configLines) {
  $key = $line.Split("=")[0]
  $escapedKey = [Regex]::Escape($key)
  $matched = $false
  $confContent = @($confContent | ForEach-Object {
    if ($_ -match "^\s*#?\s*$escapedKey\s*=") {
      $matched = $true
      $line
    } else {
      $_
    }
  })
  if (-not $matched) {
    $confContent += $line
  }
}
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
[System.IO.File]::WriteAllLines($confPath, $confContent, $utf8NoBom)

if (-not (Test-Path $authPath)) {
  $env:JAVA_HOME = $javaHome
  $env:NEO4J_ACCEPT_LICENSE_AGREEMENT = "yes"
  & (Join-Path $neo4jHome "bin\neo4j-admin.bat") dbms set-initial-password $password
  if ($LASTEXITCODE -ne 0) {
    throw "Failed to set Neo4j initial password."
  }
}

$env:JAVA_HOME = $javaHome
$env:NEO4J_ACCEPT_LICENSE_AGREEMENT = "yes"
Start-Process -FilePath "cmd.exe" -ArgumentList "/c", "`"$neo4jHome\bin\neo4j.bat`" console" -WorkingDirectory $neo4jHome -WindowStyle Hidden

Write-Host "Waiting for LongMindStudy Neo4j runtime on bolt://localhost:7687..."
for ($attempt = 1; $attempt -le 60; $attempt += 1) {
  if (Test-Neo4jConnection) {
    Write-Host "Neo4j is ready at bolt://localhost:7687."
    exit 0
  }
  Start-Sleep -Seconds 2
}

throw "LongMindStudy Neo4j runtime started, but Bolt did not become ready. Check .local\neo4j-desktop-runtime logs."
