"use strict";

const { chunkText, tokenize } = require("./textChunker");

const DEFAULT_MAX_CONTEXT_CHARS = 300000;

function countTerms(tokens) {
  const counts = new Map();

  for (const token of tokens) {
    counts.set(token, (counts.get(token) || 0) + 1);
  }

  return counts;
}

function buildRagIndex(documents, options = {}) {
  const chunkSize = options.chunkSize || 1400;
  const chunks = [];
  const documentFrequency = new Map();

  for (const document of documents || []) {
    const documentChunks = chunkText(document.text, { chunkSize });

    documentChunks.forEach((text, chunkIndex) => {
      const tokens = tokenize(text);
      const termCounts = countTerms(tokens);
      const chunk = {
        id: document.id,
        title: document.title,
        chunkIndex,
        text,
        tokens,
        termCounts,
        tokenCount: Math.max(1, tokens.length),
      };
      chunks.push(chunk);

      for (const token of new Set(tokens)) {
        documentFrequency.set(token, (documentFrequency.get(token) || 0) + 1);
      }
    });
  }

  const averageLength = chunks.length
    ? chunks.reduce((sum, chunk) => sum + chunk.tokenCount, 0) / chunks.length
    : 1;

  return {
    chunks,
    documentFrequency,
    averageLength,
    totalChunks: chunks.length,
    strategy: "local-bm25",
  };
}

function scoreChunk(index, chunk, queryTokens, options = {}) {
  const k1 = options.k1 || 1.2;
  const b = options.b || 0.75;
  let score = 0;

  for (const token of queryTokens) {
    const frequency = chunk.termCounts.get(token) || 0;
    if (!frequency) continue;

    const documentFrequency = index.documentFrequency.get(token) || 0;
    const idf = Math.log(1 + (index.totalChunks - documentFrequency + 0.5) / (documentFrequency + 0.5));
    const lengthNorm = frequency + k1 * (1 - b + b * (chunk.tokenCount / index.averageLength));
    score += idf * ((frequency * (k1 + 1)) / lengthNorm);
  }

  return score;
}

function getChunkKey(chunk) {
  return `${chunk.id || chunk.title || "document"}::${chunk.chunkIndex}`;
}

function getDocumentKey(chunk) {
  return String(chunk.id || chunk.title || "document");
}

function toSelectedChunk(chunk) {
  return {
    id: chunk.id,
    title: chunk.title,
    chunkIndex: chunk.chunkIndex,
    text: chunk.text,
    score: Number(chunk.score.toFixed(4)),
  };
}

function queryRagIndex(index, query, options = {}) {
  const topK = Math.max(1, Number(options.topK || options.maxChunks || 6));
  const maxContextChars = options.maxContextChars || DEFAULT_MAX_CONTEXT_CHARS;
  const queryTokens = tokenize(query);

  if (!index || !Array.isArray(index.chunks) || index.chunks.length === 0) {
    return [];
  }

  const ranked = index.chunks
    .map((chunk) => ({
      ...chunk,
      score: queryTokens.length ? scoreChunk(index, chunk, queryTokens, options) : 0,
    }))
    .sort((left, right) => {
      if (right.score !== left.score) return right.score - left.score;
      if (left.id !== right.id) return String(left.id).localeCompare(String(right.id));
      return left.chunkIndex - right.chunkIndex;
    });

  const selected = [];
  const selectedKeys = new Set();
  let totalChars = 0;

  const trySelect = (chunk) => {
    if (selected.length >= topK) return false;
    const key = getChunkKey(chunk);
    if (selectedKeys.has(key)) return false;
    if (totalChars + chunk.text.length > maxContextChars && selected.length > 0) return false;

    selected.push(toSelectedChunk(chunk));
    selectedKeys.add(key);
    totalChars += chunk.text.length;
    return true;
  };

  if (options.documentCoverage !== false && ranked.length > 1) {
    const bestByDocument = new Map();

    for (const chunk of ranked) {
      const documentKey = getDocumentKey(chunk);
      if (!bestByDocument.has(documentKey)) {
        bestByDocument.set(documentKey, chunk);
      }
    }

    const bestChunks = Array.from(bestByDocument.values());
    const bestScore = bestChunks[0]?.score || 0;
    const minCoverageScore = bestScore > 0
      ? bestScore * (Number.isFinite(Number(options.documentCoverageScoreRatio)) ? Number(options.documentCoverageScoreRatio) : 0.25)
      : 0;
    const coverageLimit = Math.min(
      topK,
      Math.max(0, Number.isFinite(Number(options.documentCoverageLimit)) ? Number(options.documentCoverageLimit) : topK),
    );
    const coverageCandidates = bestScore > 0
      ? bestChunks.filter((chunk) => chunk.score >= minCoverageScore)
      : bestChunks;

    for (const chunk of coverageCandidates) {
      if (selected.length >= coverageLimit) break;
      trySelect(chunk);
    }
  }

  for (const chunk of ranked) {
    if (selected.length >= topK) break;
    trySelect(chunk);
  }

  return selected;
}

module.exports = {
  buildRagIndex,
  queryRagIndex,
};
