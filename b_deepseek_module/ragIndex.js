"use strict";

const { chunkText, tokenize } = require("./textChunker");

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

function queryRagIndex(index, query, options = {}) {
  const topK = options.topK || options.maxChunks || 6;
  const maxContextChars = options.maxContextChars || 12000;
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
  let totalChars = 0;

  for (const chunk of ranked) {
    if (selected.length >= topK) break;
    if (totalChars + chunk.text.length > maxContextChars && selected.length > 0) continue;

    selected.push({
      id: chunk.id,
      title: chunk.title,
      chunkIndex: chunk.chunkIndex,
      text: chunk.text,
      score: Number(chunk.score.toFixed(4)),
    });
    totalChars += chunk.text.length;
  }

  return selected;
}

module.exports = {
  buildRagIndex,
  queryRagIndex,
};
