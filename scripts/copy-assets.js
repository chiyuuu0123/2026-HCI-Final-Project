const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const targetDir = path.join(root, "frontend", "vendor");
const assets = [
  {
    source: path.join(root, "node_modules", "lucide", "dist", "umd", "lucide.min.js"),
    target: path.join(targetDir, "lucide.min.js"),
  },
  {
    source: path.join(root, "node_modules", "jszip", "dist", "jszip.min.js"),
    target: path.join(targetDir, "jszip.min.js"),
  },
  {
    source: path.join(root, "node_modules", "pdf-lib", "dist", "pdf-lib.min.js"),
    target: path.join(targetDir, "pdf-lib.min.js"),
  },
];

fs.mkdirSync(targetDir, { recursive: true });

for (const asset of assets) {
  if (!fs.existsSync(asset.source)) {
    throw new Error(`${path.basename(asset.source)} was not found. Run npm install first.`);
  }

  fs.copyFileSync(asset.source, asset.target);
}

console.log("Prepared frontend vendor assets.");
