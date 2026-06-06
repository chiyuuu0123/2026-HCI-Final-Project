"use strict";

const { PSM, createWorker } = require("tesseract.js");

const DEFAULT_OCR_LANGUAGES = ["eng", "chi_sim"];
const DEFAULT_TEXT_LIMIT = 12000;
const workerEntries = new Map();

function normalizeOcrText(text) {
  return String(text || "")
    .replace(/\s+\n/g, "\n")
    .replace(/\n\s+/g, "\n")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function normalizeOcrLanguages(options = {}) {
  const rawLanguages = Array.isArray(options.languages)
    ? options.languages
    : typeof options.language === "string"
      ? options.language.split(/[+,]/)
      : DEFAULT_OCR_LANGUAGES;
  const languages = rawLanguages
    .map((language) => String(language || "").trim())
    .filter(Boolean);

  return languages.length ? languages : DEFAULT_OCR_LANGUAGES;
}

function getWorkerKey(languages) {
  return languages.join("+");
}

async function createOcrWorker(languages, options = {}) {
  const workerOptions = {};

  if (options.cachePath) workerOptions.cachePath = options.cachePath;
  if (typeof options.logger === "function") workerOptions.logger = options.logger;
  if (typeof options.errorHandler === "function") workerOptions.errorHandler = options.errorHandler;

  const worker = await createWorker(languages, 1, workerOptions);

  await worker.setParameters({
    preserve_interword_spaces: "1",
    tessedit_pageseg_mode: PSM.AUTO,
  });

  return worker;
}

function getOcrWorkerEntry(languages, options = {}) {
  const key = getWorkerKey(languages);
  const existingEntry = workerEntries.get(key);

  if (existingEntry) return existingEntry;

  const workerPromise = createOcrWorker(languages, options).catch((error) => {
    workerEntries.delete(key);
    throw error;
  });
  const entry = {
    workerPromise,
    queue: Promise.resolve(),
  };

  workerEntries.set(key, entry);
  return entry;
}

async function recognizeWithLanguages(base64, languages, options = {}) {
  const imageBuffer = Buffer.from(String(base64 || ""), "base64");

  if (!imageBuffer.byteLength) {
    throw new Error("OCR requires a base64 image payload.");
  }

  const entry = getOcrWorkerEntry(languages, options);
  const job = entry.queue.then(async () => {
    const worker = await entry.workerPromise;
    const result = await worker.recognize(imageBuffer);
    const textLimit = Math.max(200, Number(options.textLimit) || DEFAULT_TEXT_LIMIT);
    const text = normalizeOcrText(result?.data?.text).slice(0, textLimit);

    return {
      text,
      confidence: Number.isFinite(result?.data?.confidence) ? result.data.confidence : null,
      language: getWorkerKey(languages),
      recognizedAt: Date.now(),
    };
  });

  entry.queue = job.catch(() => {});
  return job;
}

async function recognizeImageTextFromBase64(base64, options = {}) {
  const languages = normalizeOcrLanguages(options);

  try {
    return await recognizeWithLanguages(base64, languages, options);
  } catch (error) {
    if (languages.length > 1 && !options.disableLanguageFallback) {
      const fallback = await recognizeWithLanguages(base64, ["eng"], options);
      return {
        ...fallback,
        warning: error.message || String(error),
        fallbackFrom: getWorkerKey(languages),
      };
    }

    throw error;
  }
}

async function terminateOcrWorkers() {
  const entries = Array.from(workerEntries.values());
  workerEntries.clear();

  await Promise.all(entries.map(async (entry) => {
    const worker = await entry.workerPromise.catch(() => null);
    if (worker && typeof worker.terminate === "function") {
      await worker.terminate();
    }
  }));
}

module.exports = {
  DEFAULT_OCR_LANGUAGES,
  normalizeOcrText,
  recognizeImageTextFromBase64,
  terminateOcrWorkers,
};
