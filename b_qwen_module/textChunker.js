"use strict";

function normalizeText(text) {
  return String(text || "")
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function tokenize(text) {
  return (String(text || "").toLowerCase().match(/[a-z0-9]+|[\u4e00-\u9fff]/g) || []).filter(Boolean);
}

function coerceDocumentText(document) {
  if (!document) {
    return "";
  }

  if (typeof document.text === "string" && document.text.trim()) {
    return document.text;
  }

  if (typeof document.content === "string" && document.content.trim()) {
    return document.content;
  }

  if (typeof document.base64 === "string" && document.base64.trim()) {
    const mimeType = String(document.mimeType || "").toLowerCase();
    const extension = String(document.extension || "").toLowerCase();

    if (mimeType === "text/markdown" || mimeType === "text/plain" || extension === "md" || extension === "txt") {
      return Buffer.from(document.base64, "base64").toString("utf8");
    }

    if (mimeType === "application/pdf" || extension === "pdf") {
      throw new Error("PDF content needs extracted text before it can be sent to the B module.");
    }
  }

  return "";
}

function chunkText(text, options = {}) {
  const chunkSize = options.chunkSize || 1400;
  const normalized = normalizeText(text);

  if (!normalized) {
    return [];
  }

  const paragraphs = normalized.split(/\n\s*\n/);
  const chunks = [];
  let current = "";

  for (const paragraph of paragraphs) {
    const candidate = current ? `${current}\n\n${paragraph}` : paragraph;

    if (candidate.length <= chunkSize) {
      current = candidate;
      continue;
    }

    if (current) {
      chunks.push(current);
      current = "";
    }

    if (paragraph.length <= chunkSize) {
      current = paragraph;
      continue;
    }

    for (let index = 0; index < paragraph.length; index += chunkSize) {
      chunks.push(paragraph.slice(index, index + chunkSize));
    }
  }

  if (current) {
    chunks.push(current);
  }

  return chunks;
}

function scoreText(questionTokens, text) {
  if (questionTokens.length === 0) {
    return 0;
  }

  const haystack = String(text || "").toLowerCase();
  let score = 0;

  for (const token of questionTokens) {
    if (haystack.includes(token)) {
      score += token.length > 1 ? 2 : 1;
    }
  }

  return score;
}

function toNormalizedDocuments(documents) {
  return (documents || [])
    .map((document, index) => {
      const text = normalizeText(coerceDocumentText(document));

      return {
        id: document && (document.id || document.path || document.title) ? document.id || document.path || document.title : `document-${index + 1}`,
        title: document && (document.title || document.name || document.path) ? document.title || document.name || document.path : `Document ${index + 1}`,
        text,
        mimeType: document && document.mimeType ? document.mimeType : null,
        extension: document && document.extension ? document.extension : null,
        original: document,
      };
    })
    .filter((document) => document.text.length > 0);
}

function collectLeadingChunks(documents, options = {}) {
  const maxChunks = options.maxChunks || 8;
  const maxContextChars = options.maxContextChars || 12000;
  const chunkSize = options.chunkSize || 1400;
  const normalizedDocuments = toNormalizedDocuments(documents);
  const selected = [];
  let totalChars = 0;

  for (const document of normalizedDocuments) {
    const chunks = chunkText(document.text, { chunkSize });

    for (let chunkIndex = 0; chunkIndex < chunks.length; chunkIndex += 1) {
      const chunk = chunks[chunkIndex];

      if (selected.length >= maxChunks) {
        return selected;
      }

      if (totalChars + chunk.length > maxContextChars && selected.length > 0) {
        return selected;
      }

      selected.push({
        id: document.id,
        title: document.title,
        chunkIndex,
        text: chunk,
        score: 0,
      });
      totalChars += chunk.length;
    }
  }

  return selected;
}

function selectRelevantChunks(question, documents, options = {}) {
  const maxChunks = options.maxChunks || 6;
  const maxContextChars = options.maxContextChars || 12000;
  const chunkSize = options.chunkSize || 1400;
  const questionTokens = tokenize(question);
  const normalizedDocuments = toNormalizedDocuments(documents);
  const candidates = [];

  for (const document of normalizedDocuments) {
    const chunks = chunkText(document.text, { chunkSize });

    chunks.forEach((chunk, chunkIndex) => {
      candidates.push({
        id: document.id,
        title: document.title,
        chunkIndex,
        text: chunk,
        score: scoreText(questionTokens, chunk),
      });
    });
  }

  candidates.sort((left, right) => {
    if (right.score !== left.score) {
      return right.score - left.score;
    }

    if (left.id !== right.id) {
      return String(left.id).localeCompare(String(right.id));
    }

    return left.chunkIndex - right.chunkIndex;
  });

  const selected = [];
  let totalChars = 0;

  for (const candidate of candidates) {
    if (selected.length >= maxChunks) {
      break;
    }

    if (totalChars + candidate.text.length > maxContextChars && selected.length > 0) {
      continue;
    }

    selected.push(candidate);
    totalChars += candidate.text.length;
  }

  return selected;
}

module.exports = {
  chunkText,
  collectLeadingChunks,
  coerceDocumentText,
  normalizeText,
  selectRelevantChunks,
  tokenize,
  toNormalizedDocuments,
};
