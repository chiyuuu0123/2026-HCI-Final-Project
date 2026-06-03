const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const source = path.join(root, "node_modules", "lucide", "dist", "umd", "lucide.min.js");
const targetDir = path.join(root, "frontend", "vendor");
const target = path.join(targetDir, "lucide.min.js");

if (!fs.existsSync(source)) {
  throw new Error("lucide.min.js was not found. Run npm install first.");
}

fs.mkdirSync(targetDir, { recursive: true });
fs.copyFileSync(source, target);

console.log("Prepared frontend vendor assets.");
