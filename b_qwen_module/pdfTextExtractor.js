"use strict";

function normalizePdfText(text) {
  return String(text || "")
    .replace(/\s+\n/g, "\n")
    .replace(/\n\s+/g, "\n")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function extractTextFromPdfTextContent(textContent) {
  const rows = [];
  let currentY = null;
  let currentLine = [];

  const textItems = (textContent.items || [])
    .map((item) => ({
      text: item.str && item.str.trim ? item.str.trim() : "",
      x: Math.round((item.transform && item.transform[4]) || 0),
      y: Math.round((item.transform && item.transform[5]) || 0),
    }))
    .filter((item) => item.text)
    .sort((left, right) => {
      if (Math.abs(left.y - right.y) > 4) return right.y - left.y;
      return left.x - right.x;
    });

  for (const item of textItems) {
    if (currentY !== null && Math.abs(item.y - currentY) > 4) {
      rows.push(currentLine.join(" ").trim());
      currentLine = [];
    }

    currentY = item.y;
    currentLine.push(item.text);
  }

  if (currentLine.length) {
    rows.push(currentLine.join(" ").trim());
  }

  return normalizePdfText(rows.filter(Boolean).join("\n"));
}

async function loadPdfJs() {
  return import("pdfjs-dist/legacy/build/pdf.mjs");
}

async function extractPdfTextFromBytes(bytes, options = {}) {
  const pdfjsLib = await loadPdfJs();
  const data = bytes instanceof ArrayBuffer
    ? new Uint8Array(bytes.slice(0))
    : Uint8Array.from(bytes || []);
  const loadingTask = pdfjsLib.getDocument({
    data,
    disableWorker: true,
    isEvalSupported: false,
    useSystemFonts: true,
  });
  const pdf = await loadingTask.promise;
  const pageCount = pdf.numPages;
  const maxPages = Math.min(pageCount, options.maxPages || pageCount);
  const pageTextLimit = options.pageTextLimit || 8000;
  const totalTextLimit = options.totalTextLimit || 60000;
  const pages = [];
  let totalLength = 0;

  try {
    for (let pageNumber = 1; pageNumber <= maxPages; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber);
      const textContent = await page.getTextContent();
      const pageText = extractTextFromPdfTextContent(textContent).slice(0, pageTextLimit);

      if (!pageText) {
        continue;
      }

      if (totalLength + pageText.length > totalTextLimit && pages.length > 0) {
        break;
      }

      pages.push({
        pageNumber,
        text: pageText,
      });
      totalLength += pageText.length;
    }
  } finally {
    if (typeof pdf.destroy === "function") {
      await pdf.destroy();
    }
  }

  const text = normalizePdfText(
    pages
      .map((page) => `Page ${page.pageNumber}\n${page.text}`)
      .join("\n\n"),
  ).slice(0, totalTextLimit);

  return {
    pageCount,
    extractedPageCount: pages.length,
    pages,
    text,
    extractedAt: Date.now(),
  };
}

async function extractPdfTextFromBase64(base64, options = {}) {
  const bytes = Buffer.from(String(base64 || ""), "base64");
  return extractPdfTextFromBytes(bytes, options);
}

module.exports = {
  extractPdfTextFromBase64,
  extractPdfTextFromBytes,
  extractTextFromPdfTextContent,
  normalizePdfText,
};
