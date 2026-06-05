"use strict";

const { extractPdfTextFromBase64 } = require("./pdfTextExtractor");
const { normalizeText } = require("./textChunker");

function getBase64Payload(document) {
  if (!document) return "";

  if (typeof document.base64 === "string" && document.base64.trim()) {
    return document.base64.trim();
  }

  if (typeof document.dataUrl === "string" && document.dataUrl.includes(",")) {
    return document.dataUrl.split(",").pop().trim();
  }

  return "";
}

function getDocumentExtension(document) {
  return String(document && (document.extension || document.name || document.title || document.path) || "")
    .split(".")
    .pop()
    .toLowerCase();
}

function isMarkdownDocument(document) {
  const mimeType = String(document && document.mimeType || "").toLowerCase();
  const extension = getDocumentExtension(document);
  return mimeType === "text/markdown" || mimeType === "text/plain" || extension === "md" || extension === "markdown" || extension === "txt";
}

function isPdfDocument(document) {
  const mimeType = String(document && document.mimeType || "").toLowerCase();
  const extension = getDocumentExtension(document);
  return mimeType === "application/pdf" || extension === "pdf";
}

async function getDocumentText(document, options = {}) {
  if (!document) {
    return "";
  }

  if (typeof document.text === "string" && document.text.trim()) {
    return document.text;
  }

  if (typeof document.content === "string" && document.content.trim()) {
    return document.content;
  }

  const base64 = getBase64Payload(document);
  if (!base64) {
    return "";
  }

  if (isMarkdownDocument(document)) {
    return Buffer.from(base64, "base64").toString("utf8");
  }

  if (isPdfDocument(document)) {
    const extracted = await extractPdfTextFromBase64(base64, {
      maxPages: options.maxPdfPages,
      pageTextLimit: options.pdfPageTextLimit,
      totalTextLimit: options.maxPdfTextChars,
    });
    return extracted.text;
  }

  return "";
}

async function normalizeDocumentsForAi(documents, options = {}) {
  const normalizedDocuments = [];

  for (const [index, document] of (documents || []).entries()) {
    const text = normalizeText(await getDocumentText(document, options));

    if (!text) {
      continue;
    }

    normalizedDocuments.push({
      id: document && (document.id || document.path || document.title) ? document.id || document.path || document.title : `document-${index + 1}`,
      title: document && (document.title || document.name || document.path) ? document.title || document.name || document.path : `Document ${index + 1}`,
      text,
      mimeType: document && document.mimeType ? document.mimeType : null,
      extension: document && document.extension ? document.extension : null,
      original: document,
    });
  }

  return normalizedDocuments;
}

module.exports = {
  getBase64Payload,
  getDocumentText,
  isMarkdownDocument,
  isPdfDocument,
  normalizeDocumentsForAi,
};
