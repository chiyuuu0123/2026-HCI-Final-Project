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
    source: path.join(root, "node_modules", "pdf-lib", "dist", "pdf-lib.min.js"),
    target: path.join(targetDir, "pdf-lib.min.js"),
  },
  {
    source: path.join(root, "node_modules", "pdfjs-dist", "legacy", "build", "pdf.min.mjs"),
    target: path.join(targetDir, "pdf.min.js"),
  },
  {
    source: path.join(root, "node_modules", "pdfjs-dist", "legacy", "build", "pdf.worker.min.mjs"),
    target: path.join(targetDir, "pdf.worker.min.js"),
  },
  {
    source: path.join(root, "node_modules", "@mediapipe", "tasks-vision", "vision_bundle.mjs"),
    target: path.join(targetDir, "mediapipe-vision", "vision_bundle.mjs"),
  },
];

fs.mkdirSync(targetDir, { recursive: true });

for (const asset of assets) {
  if (!fs.existsSync(asset.source)) {
    throw new Error(`${path.basename(asset.source)} was not found. Run npm install first.`);
  }

  fs.mkdirSync(path.dirname(asset.target), { recursive: true });
  fs.copyFileSync(asset.source, asset.target);
}

fs.cpSync(
  path.join(root, "node_modules", "@mediapipe", "tasks-vision", "wasm"),
  path.join(targetDir, "mediapipe-vision", "wasm"),
  { recursive: true },
);

console.log("Prepared frontend vendor assets.");
