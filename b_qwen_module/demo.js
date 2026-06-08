"use strict";

const fs = require("node:fs/promises");
const path = require("node:path");
const { createStudyAiService } = require("./qaService");

async function readDocument(filePath) {
  const extension = path.extname(filePath).toLowerCase();

  if (![".md", ".markdown", ".txt"].includes(extension)) {
    throw new Error("Standalone demo currently supports Markdown or text files.");
  }

  return {
    id: path.resolve(filePath),
    title: path.basename(filePath),
    text: await fs.readFile(filePath, "utf8"),
  };
}

async function main() {
  const [, , filePath, ...questionParts] = process.argv;
  const question = questionParts.join(" ").trim();

  if (!filePath || !question) {
    console.error("Usage: node b_qwen_module/demo.js <file.md|file.txt> <question>");
    process.exitCode = 1;
    return;
  }

  const service = createStudyAiService();
  const document = await readDocument(filePath);
  const result = await service.askCourseQuestion({
    question,
    documents: [document],
    options: {
      maxChunks: 6,
      maxContextChars: 12000,
    },
  });

  console.log("\nAnswer:\n");
  console.log(result.answer);
  console.log("\nSources:\n");
  console.log(JSON.stringify(result.sources, null, 2));

  if (result.usage) {
    console.log("\nUsage:\n");
    console.log(JSON.stringify(result.usage, null, 2));
  }
}

main().catch((error) => {
  console.error(error && error.stack ? error.stack : error);
  process.exitCode = 1;
});
