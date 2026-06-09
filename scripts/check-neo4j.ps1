$ErrorActionPreference = "Stop"

& node (Join-Path $PSScriptRoot "check-neo4j.js")
if ($LASTEXITCODE -ne 0) {
  throw "Neo4j check failed. Open Neo4j Desktop, start the MindStudy DBMS, and make sure .local\neo4j.env matches its password."
}
