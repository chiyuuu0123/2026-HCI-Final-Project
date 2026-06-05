"use strict";

const { DeepSeekClient } = require("./deepseekClient");
const { collectLeadingChunks } = require("./textChunker");
const { normalizeDocumentsForAi } = require("./documentNormalizer");
const { buildRagIndex, queryRagIndex } = require("./ragIndex");

function buildContext(chunks) {
  return chunks
    .map((chunk, index) => {
      const label = `S${index + 1}`;
      return `[${label}] ${chunk.title} (chunk ${chunk.chunkIndex + 1})\n${chunk.text}`;
    })
    .join("\n\n---\n\n");
}

function buildSources(chunks) {
  return chunks.map((chunk, index) => ({
    id: chunk.id,
    title: chunk.title,
    chunkIndex: chunk.chunkIndex,
    label: `S${index + 1}`,
    score: chunk.score,
  }));
}

function buildRetrievalMetadata(strategy, index, chunks) {
  return {
    strategy,
    totalChunks: index && Number.isFinite(index.totalChunks) ? index.totalChunks : chunks.length,
    selectedChunks: chunks.length,
    sourceDocuments: new Set(chunks.map((chunk) => chunk.id)).size,
  };
}

function getRequestOptions(request) {
  return request && request.options ? request.options : {};
}

function selectRagChunks(query, documents, options = {}) {
  const index = buildRagIndex(documents, options);
  const chunks = queryRagIndex(index, query, options);

  return {
    chunks,
    index,
    retrieval: buildRetrievalMetadata(index.strategy || "local-bm25", index, chunks),
  };
}

function buildQuestionMessages(question, chunks) {
  const context = buildContext(chunks);

  return [
    {
      role: "system",
      content: [
        "You are the B module for an HCI course project.",
        "Answer only from the provided course context when possible.",
        "If the context is insufficient, say what is missing.",
        "Cite sources with labels such as [S1] or [S2].",
        "Keep the answer concise and helpful for study.",
      ].join(" "),
    },
    {
      role: "user",
      content: `Question:\n${question}\n\nCourse context:\n${context || "(No course context was provided.)"}`,
    },
  ];
}

function buildSummarizeMessages(topic, chunks) {
  const context = buildContext(chunks);
  const requestTopic = topic ? String(topic).trim() : "overall course material";

  return [
    {
      role: "system",
      content: [
        "You are a course material analyst.",
        "Return strict JSON only.",
        "The JSON object must contain summary, keywords, outline, and takeaways.",
        "summary must be a string.",
        "keywords must be an array of short strings.",
        "outline must be an array of objects with heading and points fields.",
        "takeaways must be an array of short strings.",
      ].join(" "),
    },
    {
      role: "user",
      content: `Topic:\n${requestTopic}\n\nCourse context:\n${context || "(No course context was provided.)"}`,
    },
  ];
}

function extractJsonPayload(text) {
  const raw = String(text || "").trim();

  if (!raw) {
    return null;
  }

  const fencedMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fencedMatch ? fencedMatch[1].trim() : raw;
  const firstBrace = candidate.indexOf("{");
  const lastBrace = candidate.lastIndexOf("}");
  const jsonText = firstBrace >= 0 && lastBrace >= 0 ? candidate.slice(firstBrace, lastBrace + 1) : candidate;

  try {
    return JSON.parse(jsonText);
  } catch (error) {
    return null;
  }
}

function createStudyAiService(options = {}) {
  const client = options.client || new DeepSeekClient(options.clientOptions);

  return {
    getStatus() {
      return client.getStatus();
    },

    async askCourseQuestion(request) {
      if (!request || !request.question || !String(request.question).trim()) {
        throw new Error("askCourseQuestion requires a non-empty question.");
      }

      const options = getRequestOptions(request);
      const normalizedDocuments = await normalizeDocumentsForAi(request.documents, options);
      const { chunks, retrieval } = selectRagChunks(request.question, normalizedDocuments, options);
      const response = await client.chat({
        messages: buildQuestionMessages(request.question, chunks),
        model: options.model,
        temperature: options.temperature != null ? options.temperature : 0.2,
        maxTokens: options.maxTokens != null ? options.maxTokens : 900,
        signal: options.signal,
      });

      return {
        answer: response.content,
        sources: buildSources(chunks),
        retrieval,
        model: response.model,
        usage: response.usage,
      };
    },

    async summarizeDocuments(request) {
      const options = getRequestOptions(request);
      const topic = request && request.topic ? String(request.topic).trim() : "";
      const normalizedDocuments = await normalizeDocumentsForAi(request && request.documents, options);
      const index = buildRagIndex(normalizedDocuments, options);
      const chunks = topic
        ? queryRagIndex(index, topic, { ...options, topK: options.topK || options.maxChunks || 8 })
        : collectLeadingChunks(normalizedDocuments, options);
      const retrieval = buildRetrievalMetadata(topic ? index.strategy || "local-bm25" : "leading-chunks", index, chunks);
      const response = await client.chat({
        messages: buildSummarizeMessages(topic, chunks),
        model: options.model,
        temperature: options.temperature != null ? options.temperature : 0.2,
        maxTokens: options.maxTokens != null ? options.maxTokens : 1200,
        signal: options.signal,
      });

      const parsed = extractJsonPayload(response.content);

      return {
        summary: parsed && typeof parsed.summary === "string" ? parsed.summary : response.content,
        keywords: parsed && Array.isArray(parsed.keywords) ? parsed.keywords : [],
        outline: parsed && Array.isArray(parsed.outline) ? parsed.outline : [],
        takeaways: parsed && Array.isArray(parsed.takeaways) ? parsed.takeaways : [],
        sources: buildSources(chunks),
        retrieval,
        model: response.model,
        usage: response.usage,
        raw: response.content,
      };
    },
  };
}

async function askCourseQuestion(request, dependencies = {}) {
  return createStudyAiService(dependencies).askCourseQuestion(request);
}

async function summarizeDocuments(request, dependencies = {}) {
  return createStudyAiService(dependencies).summarizeDocuments(request);
}

function getStudyAiStatus(options = {}) {
  return (options.client || new DeepSeekClient(options.clientOptions)).getStatus();
}

module.exports = {
  askCourseQuestion,
  buildContext,
  buildQuestionMessages,
  buildSummarizeMessages,
  createStudyAiService,
  extractJsonPayload,
  getStudyAiStatus,
  summarizeDocuments,
};
