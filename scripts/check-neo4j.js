"use strict";

const fs = require("node:fs");
const path = require("node:path");
const neo4j = require("neo4j-driver");

const rootDir = path.resolve(__dirname, "..");
const localEnvPath = path.join(rootDir, ".local", "neo4j.env");

function readDotEnv(filePath) {
  if (!fs.existsSync(filePath)) return {};
  return fs
    .readFileSync(filePath, "utf8")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"))
    .reduce((env, line) => {
      const separator = line.indexOf("=");
      if (separator <= 0) return env;
      env[line.slice(0, separator).trim()] = line.slice(separator + 1).trim();
      return env;
    }, {});
}

function getNeo4jConfig() {
  const localEnv = readDotEnv(localEnvPath);
  return {
    uri: process.env.NEO4J_URI || localEnv.NEO4J_URI || "bolt://localhost:7687",
    username: process.env.NEO4J_USERNAME || localEnv.NEO4J_USERNAME || "neo4j",
    password: process.env.NEO4J_PASSWORD || localEnv.NEO4J_PASSWORD || "longmindstudy-local-neo4j",
    browserUrl: process.env.NEO4J_BROWSER_URL || localEnv.NEO4J_BROWSER_URL || "http://localhost:7474",
  };
}

async function main() {
  const quiet = process.argv.includes("--quiet");
  const config = getNeo4jConfig();
  const driver = neo4j.driver(config.uri, neo4j.auth.basic(config.username, config.password), {
    maxConnectionPoolSize: 2,
    connectionTimeout: 5000,
  });

  try {
    await driver.verifyConnectivity();
    const session = driver.session();
    try {
      const result = await session.run("CALL dbms.components() YIELD name, versions RETURN name, versions[0] AS version LIMIT 1");
      const record = result.records[0];
      if (!quiet) {
        console.log(`Neo4j connected: ${record?.get("name") || "Neo4j"} ${record?.get("version") || ""}`.trim());
        console.log(`Bolt: ${config.uri}`);
        console.log(`Browser: ${config.browserUrl}`);
      }
    } finally {
      await session.close();
    }
  } finally {
    await driver.close();
  }
}

main().catch((error) => {
  console.error(error.message || String(error));
  process.exit(1);
});
