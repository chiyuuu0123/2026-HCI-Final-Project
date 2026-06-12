const { app, BrowserWindow, desktopCapturer, dialog, ipcMain, Menu, screen, session, shell } = require("electron");
const fs = require("node:fs/promises");
const fsSync = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const { spawn } = require("node:child_process");
const { pathToFileURL } = require("node:url");
const {
  DEFAULT_BASE_URL,
  DEFAULT_MODEL,
  DEFAULT_MULTIMODAL_MODEL,
  DEFAULT_ASR_MODEL,
  QwenClient,
  createStudyAiService,
  createKnowledgeGraphService,
  DEFAULT_NEO4J_URI,
  DEFAULT_NEO4J_USERNAME,
  DEFAULT_NEO4J_PASSWORD,
  extractPdfTextFromBase64,
  recognizeImageTextFromBase64,
  terminateOcrWorkers,
} = require("../b_qwen_module");

const isWindows = process.platform === "win32";
const maxImportBytes = 80 * 1024 * 1024;
const supportedExtensions = new Set([".pdf", ".md"]);
const companionPetSize = { width: 248, height: 312 };
const companionChatSize = { width: 440, height: 568 };
const longlongVoiceProvider = "gpt-sovits";
const longlongVoiceTextLimit = 420;
const longlongVoiceStartupTimeoutMs = 30000;
const longlongStudyCoinSeconds = 10 * 60;
const longlongDailyCoinCap = 18;
const longlongBondLevels = [
  { threshold: 0, name: "初识", detail: "龙龙刚刚探头" },
  { threshold: 20, name: "熟悉", detail: "龙龙开始认得你的脚步" },
  { threshold: 60, name: "贴贴", detail: "龙龙愿意把肚皮露出来" },
  { threshold: 120, name: "信赖", detail: "龙龙把今天的勇气分你一半" },
  { threshold: 220, name: "小七候选", detail: "龙龙开始认真等你" },
  { threshold: 360, name: "龙龙的小七", detail: "龙龙找到自己的小七了" },
];
const longlongGiftCatalog = [
  {
    id: "breath-pillow",
    name: "呼吸抱枕",
    price: 3,
    affection: 8,
    icon: "cloud",
    line: "谢谢你的呼吸抱枕。龙龙吞咽了太多意义，但其实生命只需要呼吸。",
    audio: "./assets/longlong-voice/gift-01.wav",
  },
  {
    id: "tear-marble",
    name: "眼泪玻璃珠",
    price: 4,
    affection: 10,
    icon: "droplets",
    line: "这颗眼泪玻璃珠好亮。你欠龙龙的眼泪太多，龙龙数不清。",
    audio: "./assets/longlong-voice/gift-02.wav",
  },
  {
    id: "blue-cape",
    name: "蓝色小斗篷",
    price: 5,
    affection: 12,
    icon: "shirt",
    line: "蓝色小斗篷收到。如果忧郁是一种天赋，那我龙龙将天赋异禀。",
    audio: "./assets/longlong-voice/gift-03.wav",
  },
  {
    id: "tiny-scale",
    name: "迷你体重秤",
    price: 2,
    affection: 6,
    icon: "scale",
    line: "体重秤就放远一点。龙龙不胖，龙龙只有两吨。",
    audio: "./assets/longlong-voice/gift-04.wav",
  },
  {
    id: "star-lamp",
    name: "星星夜灯",
    price: 6,
    affection: 14,
    icon: "star",
    line: "星星夜灯亮啦。今夜星光闪闪，我爱你的心满满！",
    audio: "./assets/longlong-voice/gift-05.wav",
  },
  {
    id: "little-seven-doll",
    name: "小七玩偶",
    price: 8,
    affection: 18,
    icon: "heart",
    line: "小七玩偶到龙龙怀里啦。每只龙龙都一定会找到自己的小七哦！",
    audio: "./assets/longlong-voice/gift-06.wav",
  },
  {
    id: "cream-cloud",
    name: "奶油云朵",
    price: 4,
    affection: 9,
    icon: "sparkles",
    line: "奶油云朵软软的，龙龙今天也被你好好接住了。",
    audio: "./assets/longlong-voice/gift-07.wav",
  },
  {
    id: "study-bookmark",
    name: "学习书签",
    price: 2,
    affection: 5,
    icon: "bookmark",
    line: "学习书签收到，龙龙会把你努力的这一页好好夹住。",
    audio: "./assets/longlong-voice/gift-08.wav",
  },
];
let mainWindow = null;
let companionWindow = null;
let companionSnapshot = null;
let companionShouldShow = false;
let companionMode = "pet";
const ragAbortControllers = new Map();
let lastMainWindowBounds = null;
let companionCustomBounds = null;
let companionLastMotionBounds = null;
let studyTimerState = null;
let studyTimerInterval = null;
let studyTimerLastSaveAt = 0;
let longlongVoiceServiceProcess = null;
let longlongVoiceServiceStartPromise = null;
let longlongBondState = null;
let longlongMemoryState = null;

function getQwenConfigPath() {
  return path.join(app.getPath("userData"), "qwen-config.json");
}

function readQwenLocalConfig() {
  try {
    return JSON.parse(fsSync.readFileSync(getQwenConfigPath(), "utf8"));
  } catch {
    return {};
  }
}

function writeQwenLocalConfig(config) {
  const configPath = getQwenConfigPath();
  fsSync.mkdirSync(path.dirname(configPath), { recursive: true });
  fsSync.writeFileSync(configPath, JSON.stringify(config, null, 2), "utf8");
}

function getProjectLocalDir() {
  return path.join(__dirname, "..", ".local");
}

function getNeo4jLocalConfigPath() {
  return path.join(getProjectLocalDir(), "neo4j.env");
}

function parseDotEnvFile(filePath) {
  try {
    return fsSync
      .readFileSync(filePath, "utf8")
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#"))
      .reduce((env, line) => {
        const separator = line.indexOf("=");
        if (separator <= 0) return env;
        env[line.slice(0, separator).trim()] = line.slice(separator + 1).trim();
        return env;
      }, {});
  } catch {
    return {};
  }
}

function writeNeo4jLocalConfig(config = {}) {
  const configPath = getNeo4jLocalConfigPath();
  fsSync.mkdirSync(path.dirname(configPath), { recursive: true });
  const current = parseDotEnvFile(configPath);
  const next = {
    NEO4J_URI: config.uri || current.NEO4J_URI || DEFAULT_NEO4J_URI,
    NEO4J_BROWSER_URL: config.browserUrl || current.NEO4J_BROWSER_URL || "http://localhost:7474",
    NEO4J_USERNAME: config.username || current.NEO4J_USERNAME || DEFAULT_NEO4J_USERNAME,
    NEO4J_PASSWORD: config.password || current.NEO4J_PASSWORD || DEFAULT_NEO4J_PASSWORD,
  };
  fsSync.writeFileSync(
    configPath,
    Object.entries(next).map(([key, value]) => `${key}=${value}`).join("\n"),
    "utf8",
  );
  return next;
}

function getLonglongVoiceConfigPath() {
  return path.join(app.getPath("userData"), "longlong-voice-config.json");
}

function getLonglongVoiceCacheDir() {
  return path.join(app.getPath("userData"), "longlong-voice-cache");
}

function readLonglongVoiceLocalConfig() {
  try {
    return JSON.parse(fsSync.readFileSync(getLonglongVoiceConfigPath(), "utf8"));
  } catch {
    return {};
  }
}

function readBooleanOption(value, fallback = true) {
  if (typeof value === "boolean") return value;
  if (value === undefined || value === null || value === "") return fallback;
  const normalized = String(value).trim().toLowerCase();
  if (["0", "false", "no", "off"].includes(normalized)) return false;
  if (["1", "true", "yes", "on"].includes(normalized)) return true;
  return fallback;
}

function getLonglongVoiceAssetsDir() {
  return path.join(__dirname, "..", "frontend", "assets", "longlong-voice");
}

function getLonglongVoiceDefaultServiceScriptPath() {
  return path.join(__dirname, "..", "..", "LonglongVoiceService", "start-longlong-tts.ps1");
}

function getLonglongVoiceServiceScriptPath(localConfig = readLonglongVoiceLocalConfig()) {
  return String(
    process.env.LONGLONG_TTS_SERVICE_SCRIPT ||
      localConfig.serviceScriptPath ||
      getLonglongVoiceDefaultServiceScriptPath()
  ).trim();
}

function isLonglongVoiceEndpointLocal(endpoint) {
  try {
    const { hostname } = new URL(endpoint);
    return ["localhost", "127.0.0.1", "::1", "[::1]"].includes(hostname.toLowerCase());
  } catch {
    return true;
  }
}

function readLonglongVoiceManifest() {
  try {
    return JSON.parse(fsSync.readFileSync(path.join(getLonglongVoiceAssetsDir(), "manifest.json"), "utf8"));
  } catch {
    return { files: [] };
  }
}

function getLonglongReferenceAudioPath(preferredFile = "") {
  const manifest = readLonglongVoiceManifest();
  const files = Array.isArray(manifest.files) ? manifest.files : [];
  const selected =
    files.find((file) => file.file === preferredFile) ||
    (preferredFile && fsSync.existsSync(path.join(getLonglongVoiceAssetsDir(), preferredFile)) ? { file: preferredFile } : null) ||
    (fsSync.existsSync(path.join(getLonglongVoiceAssetsDir(), "reference.wav")) ? { file: "reference.wav" } : null) ||
    files.find((file) => file.file === "record136.wav") ||
    files[0];

  if (!selected?.file) return "";
  return path.join(getLonglongVoiceAssetsDir(), selected.file);
}

function getLonglongVoiceConfig() {
  const localConfig = readLonglongVoiceLocalConfig();
  const endpoint = process.env.LONGLONG_TTS_ENDPOINT || localConfig.endpoint || "http://127.0.0.1:9880/tts";
  const referenceFile = process.env.LONGLONG_TTS_REFERENCE_FILE || localConfig.referenceFile || "";
  const serviceScriptPath = getLonglongVoiceServiceScriptPath(localConfig);
  const endpointIsLocal = isLonglongVoiceEndpointLocal(endpoint);
  const localReferenceAudioPath = process.env.LONGLONG_TTS_REFERENCE_PATH || localConfig.referenceAudioPath || "";
  const serverReferenceAudioPath = process.env.LONGLONG_TTS_SERVER_REFERENCE_PATH || localConfig.serverReferenceAudioPath || "";
  const configuredReferenceAudioPath = endpointIsLocal ? localReferenceAudioPath : serverReferenceAudioPath;
  const referenceAudioPath = configuredReferenceAudioPath || (endpointIsLocal ? getLonglongReferenceAudioPath(referenceFile) : "");

  return {
    endpoint: String(endpoint).trim(),
    endpointIsLocal,
    provider: process.env.LONGLONG_TTS_PROVIDER || localConfig.provider || longlongVoiceProvider,
    referenceAudioPath,
    promptText:
      process.env.LONGLONG_TTS_PROMPT_TEXT ||
      localConfig.promptText ||
      "啊，我才不要这样，好害羞啊。",
    promptLang: process.env.LONGLONG_TTS_PROMPT_LANG || localConfig.promptLang || "zh",
    textLang: process.env.LONGLONG_TTS_TEXT_LANG || localConfig.textLang || "zh",
    autoStartService: readBooleanOption(process.env.LONGLONG_TTS_AUTO_START ?? localConfig.autoStartService, true),
    serviceScriptPath,
    timeoutMs: Math.min(45000, Math.max(3000, Number(process.env.LONGLONG_TTS_TIMEOUT_MS || localConfig.timeoutMs) || 18000)),
    extraPayload: localConfig.extraPayload && typeof localConfig.extraPayload === "object" ? localConfig.extraPayload : {},
  };
}

function getLonglongVoiceHealthUrl(endpoint) {
  try {
    const url = new URL(endpoint);
    url.pathname = url.pathname.replace(/\/tts\/?$/, "/health") || "/health";
    if (!url.pathname.endsWith("/health")) {
      url.pathname = "/health";
    }
    url.search = "";
    return url.toString();
  } catch {
    return "";
  }
}

function getLonglongVoiceCacheKey(text, config, payload) {
  const cachePayload = {
    provider: config.provider,
    endpoint: config.endpoint,
    text,
    format: payload.media_type || "",
    textLang: payload.text_lang || payload.textLang || "",
    promptText: payload.prompt_text || payload.promptText || "",
    promptLang: payload.prompt_lang || payload.promptLang || "",
    referenceAudioPath: payload.ref_audio_path || payload.prompt_audio_path || "",
  };

  return crypto.createHash("sha1").update(JSON.stringify(cachePayload)).digest("hex");
}

function getLonglongVoiceAudioFormat(format = "wav", contentType = "") {
  const normalizedFormat = String(format || "").toLowerCase();
  const normalizedType = String(contentType || "").toLowerCase();

  if (normalizedFormat.includes("mp3") || normalizedType.includes("mpeg") || normalizedType.includes("mp3")) return "mp3";
  if (normalizedFormat.includes("opus") || normalizedType.includes("opus")) return "opus";
  if (normalizedFormat.includes("wav") || normalizedType.includes("wav")) return "wav";
  return "wav";
}

function getLonglongVoiceContentType(format = "wav") {
  const audioFormat = getLonglongVoiceAudioFormat(format);
  if (audioFormat === "mp3") return "audio/mpeg";
  if (audioFormat === "opus") return "audio/opus";
  return "audio/wav";
}

function getLonglongVoiceCacheFormat(payload = {}, contentType = "") {
  return getLonglongVoiceAudioFormat(payload.format || payload.media_type || "wav", contentType);
}

function getLonglongVoiceCachePath(cacheKey, format = "wav") {
  return path.join(getLonglongVoiceCacheDir(), `${cacheKey}.${getLonglongVoiceAudioFormat(format)}`);
}

function readLonglongVoiceCachedAudio(cacheKey, format = "wav") {
  const audioFormat = getLonglongVoiceAudioFormat(format);
  const filePath = getLonglongVoiceCachePath(cacheKey, audioFormat);
  if (!fsSync.existsSync(filePath)) return null;

  return {
    available: true,
    mode: "clone",
    cached: true,
    contentType: getLonglongVoiceContentType(audioFormat),
    fileUrl: pathToFileURL(filePath).toString(),
  };
}

function writeLonglongVoiceCachedAudio(cacheKey, audioBuffer, format = "wav") {
  const filePath = getLonglongVoiceCachePath(cacheKey, format);
  fsSync.mkdirSync(path.dirname(filePath), { recursive: true });
  fsSync.writeFileSync(filePath, audioBuffer);
  return pathToFileURL(filePath).toString();
}

function getLonglongVoiceStatus() {
  const config = getLonglongVoiceConfig();
  const manifest = readLonglongVoiceManifest();
  const files = Array.isArray(manifest.files) ? manifest.files : [];

  return {
    configured: Boolean(config.endpoint),
    provider: config.provider,
    endpoint: config.endpoint,
    endpointIsLocal: config.endpointIsLocal,
    referenceAudioPath: config.referenceAudioPath,
    referenceAudioName: config.referenceAudioPath ? path.basename(config.referenceAudioPath) : "",
    referenceCount: files.length,
    autoStartService: config.autoStartService,
    serviceScriptPath: config.serviceScriptPath,
    serviceScriptExists: Boolean(config.serviceScriptPath && fsSync.existsSync(config.serviceScriptPath)),
    healthUrl: getLonglongVoiceHealthUrl(config.endpoint),
    source: manifest.source || "https://huggingface.co/datasets/pengyichen/NaiLong-Voice-Clone",
    license: manifest.license || "cc-by-nc-sa-4.0",
  };
}

async function isLonglongVoiceServiceHealthy(config = getLonglongVoiceConfig(), timeoutMs = 1600) {
  const healthUrl = getLonglongVoiceHealthUrl(config.endpoint);
  if (!healthUrl) return false;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(healthUrl, { method: "GET", signal: controller.signal });
    return response.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timeout);
  }
}

function launchLonglongVoiceService(config = getLonglongVoiceConfig()) {
  if (!isWindows || !config.serviceScriptPath || !fsSync.existsSync(config.serviceScriptPath)) {
    return false;
  }

  try {
    longlongVoiceServiceProcess = spawn(
      "powershell.exe",
      ["-NoProfile", "-ExecutionPolicy", "Bypass", "-File", config.serviceScriptPath],
      {
        cwd: path.dirname(config.serviceScriptPath),
        detached: true,
        stdio: "ignore",
        windowsHide: true,
        env: {
          ...process.env,
          NO_PROXY: process.env.NO_PROXY || "*",
          no_proxy: process.env.no_proxy || "*",
        },
      }
    );
    longlongVoiceServiceProcess.unref();
    return true;
  } catch {
    return false;
  }
}

async function waitForLonglongVoiceService(config, timeoutMs = longlongVoiceStartupTimeoutMs) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    if (await isLonglongVoiceServiceHealthy(config, 1800)) {
      return true;
    }
    await new Promise((resolve) => setTimeout(resolve, 1200));
  }
  return false;
}

async function ensureLonglongVoiceServiceStarted({ wait = false } = {}) {
  const config = getLonglongVoiceConfig();
  if (!config.endpoint || !config.endpointIsLocal || !config.autoStartService) {
    return false;
  }

  if (await isLonglongVoiceServiceHealthy(config)) {
    return true;
  }

  if (!longlongVoiceServiceStartPromise) {
    const launched = launchLonglongVoiceService(config);
    if (!launched) {
      return false;
    }
    longlongVoiceServiceStartPromise = waitForLonglongVoiceService(config).finally(() => {
      longlongVoiceServiceStartPromise = null;
    });
  }

  return wait ? longlongVoiceServiceStartPromise : false;
}

function buildLonglongTtsPayload(text, config, request = {}) {
  const options = request.options && typeof request.options === "object" ? request.options : {};

  const payload = {
    text,
    text_lang: options.textLang || config.textLang,
    ref_audio_path: options.referenceAudioPath || config.referenceAudioPath,
    prompt_text: options.promptText || config.promptText,
    prompt_lang: options.promptLang || config.promptLang,
    text_split_method: options.textSplitMethod || "cut5",
    batch_size: 1,
    media_type: options.mediaType || "wav",
    streaming_mode: false,
    ...config.extraPayload,
    ...(request.payload && typeof request.payload === "object" ? request.payload : {}),
  };

  if (!payload.ref_audio_path) {
    delete payload.ref_audio_path;
  }

  if (config.provider === "cosyvoice") {
    return {
      text,
      prompt_audio_path: payload.ref_audio_path,
      prompt_text: payload.prompt_text,
      text_lang: payload.text_lang,
      prompt_lang: payload.prompt_lang,
      ...config.extraPayload,
      ...(request.payload && typeof request.payload === "object" ? request.payload : {}),
    };
  }

  return payload;
}

function buildLonglongTtsHeaders() {
  return {
    "Content-Type": "application/json",
    Accept: "audio/wav,audio/mpeg,audio/mp3,audio/opus,audio/*,application/json",
  };
}

async function synthesizeLonglongVoice(request = {}) {
  const text = String(request.text || request.content || "").trim().slice(0, longlongVoiceTextLimit);

  if (!text) {
    throw new Error("龙龙语音需要先有要朗读的文字。");
  }

  const config = getLonglongVoiceConfig();

  if (!config.endpoint) {
    return {
      available: false,
      mode: "fallback",
      reason: "local-voice-service-missing",
      status: getLonglongVoiceStatus(),
    };
  }

  await ensureLonglongVoiceServiceStarted({ wait: true });

  const payload = buildLonglongTtsPayload(text, config, request);
  const cacheKey = getLonglongVoiceCacheKey(text, config, payload);
  const cacheFormat = getLonglongVoiceCacheFormat(payload);
  const cachedAudio = readLonglongVoiceCachedAudio(cacheKey, cacheFormat);
  if (cachedAudio) {
    return {
      ...cachedAudio,
      provider: config.provider,
      referenceAudioName: config.referenceAudioPath ? path.basename(config.referenceAudioPath) : "",
    };
  }

  if (config.endpointIsLocal && (!config.referenceAudioPath || !fsSync.existsSync(config.referenceAudioPath))) {
    throw new Error("没有找到龙龙的本地参考音频，请先准备奶龙精选语音素材。");
  }

  const headers = buildLonglongTtsHeaders();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.timeoutMs);

  try {
    const response = await fetch(config.endpoint, {
      method: "POST",
      signal: controller.signal,
      headers,
      body: JSON.stringify(payload),
    });
    const contentType = response.headers.get("content-type") || "audio/wav";

    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      throw new Error(`龙龙语音合成失败：${response.status}${detail ? ` ${detail.slice(0, 180)}` : ""}`);
    }

    if (contentType.includes("application/json")) {
      const data = await response.json();
      const dataUrl = data.dataUrl || data.audioDataUrl || data.audio_url || data.url || "";
      const base64 = data.audio || data.audio_base64 || data.base64 || "";

      if (dataUrl) {
        return {
          available: true,
          mode: "clone",
          provider: config.provider,
          dataUrl,
          referenceAudioName: path.basename(config.referenceAudioPath),
        };
      }

      if (base64) {
        return {
          available: true,
          mode: "clone",
          provider: config.provider,
          dataUrl: `data:audio/wav;base64,${base64}`,
          referenceAudioName: path.basename(config.referenceAudioPath),
        };
      }

      throw new Error("龙龙语音服务返回了 JSON，但里面没有音频数据。");
    }

    const audioBuffer = Buffer.from(await response.arrayBuffer());
    if (!audioBuffer.length) {
      throw new Error("Longlong voice service returned an empty audio buffer.");
    }
    const responseFormat = getLonglongVoiceCacheFormat(payload, contentType);
    const fileUrl = writeLonglongVoiceCachedAudio(cacheKey, audioBuffer, responseFormat);

    return {
      available: true,
      mode: "clone",
      provider: config.provider,
      contentType,
      fileUrl,
      dataUrl: `data:${contentType};base64,${audioBuffer.toString("base64")}`,
      referenceAudioName: path.basename(config.referenceAudioPath),
    };
  } finally {
    clearTimeout(timeout);
  }
}

function getStudyTimerPath() {
  return path.join(app.getPath("userData"), "study-timer.json");
}

function getTodayStudyDateKey(date = new Date()) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function formatStudyDuration(totalSeconds) {
  const seconds = Math.max(0, Math.floor(Number(totalSeconds) || 0));
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const restSeconds = seconds % 60;

  return [hours, minutes, restSeconds].map((value) => String(value).padStart(2, "0")).join(":");
}

function readStudyTimerState() {
  try {
    return JSON.parse(fsSync.readFileSync(getStudyTimerPath(), "utf8"));
  } catch {
    return {};
  }
}

function writeStudyTimerState(state) {
  const statePath = getStudyTimerPath();
  fsSync.mkdirSync(path.dirname(statePath), { recursive: true });
  fsSync.writeFileSync(statePath, JSON.stringify(state, null, 2), "utf8");
}

function getLonglongBondPath() {
  return path.join(app.getPath("userData"), "longlong-bond.json");
}

function normalizeLonglongNumber(value, fallback = 0) {
  const numericValue = Math.floor(Number(value));
  return Number.isFinite(numericValue) ? Math.max(0, numericValue) : fallback;
}

function normalizeLonglongCounterMap(value = {}) {
  if (!value || typeof value !== "object") return {};
  return Object.fromEntries(
    Object.entries(value)
      .map(([key, count]) => [String(key), normalizeLonglongNumber(count)])
      .filter(([key]) => key),
  );
}

function normalizeLonglongBondState(raw = {}) {
  return {
    affection: normalizeLonglongNumber(raw.affection),
    coins: normalizeLonglongNumber(raw.coins),
    gifted: normalizeLonglongCounterMap(raw.gifted),
    claimedStudyBlocksByDate: normalizeLonglongCounterMap(raw.claimedStudyBlocksByDate),
    chatCount: normalizeLonglongNumber(raw.chatCount),
    updatedAt: normalizeLonglongNumber(raw.updatedAt),
  };
}

function readLonglongBondState() {
  try {
    return normalizeLonglongBondState(JSON.parse(fsSync.readFileSync(getLonglongBondPath(), "utf8")));
  } catch {
    return normalizeLonglongBondState();
  }
}

function writeLonglongBondState(state) {
  const statePath = getLonglongBondPath();
  fsSync.mkdirSync(path.dirname(statePath), { recursive: true });
  fsSync.writeFileSync(statePath, JSON.stringify(state, null, 2), "utf8");
}

function ensureLonglongBondState() {
  if (!longlongBondState) longlongBondState = readLonglongBondState();
  return longlongBondState;
}

function getLonglongBondLevel(affection) {
  const total = normalizeLonglongNumber(affection);
  const currentIndex = longlongBondLevels.reduce(
    (bestIndex, level, index) => (total >= level.threshold ? index : bestIndex),
    0,
  );
  const current = longlongBondLevels[currentIndex];
  const next = longlongBondLevels[currentIndex + 1] || null;
  const currentThreshold = current.threshold;
  const nextThreshold = next?.threshold || currentThreshold;
  const progress = next
    ? Math.round(((total - currentThreshold) / Math.max(1, nextThreshold - currentThreshold)) * 100)
    : 100;

  return {
    ...current,
    nextName: next?.name || "",
    nextThreshold,
    progress: Math.min(100, Math.max(0, progress)),
    isMax: !next,
  };
}

function getLonglongBondSnapshot(state = ensureLonglongBondState()) {
  const normalized = normalizeLonglongBondState(state);
  const level = getLonglongBondLevel(normalized.affection);
  return {
    ...normalized,
    level,
    coinRule: {
      secondsPerCoin: longlongStudyCoinSeconds,
      dailyCoinCap: longlongDailyCoinCap,
    },
    giftCatalog: longlongGiftCatalog,
  };
}

function sendLonglongBondToWindow(targetWindow) {
  if (!targetWindow || targetWindow.isDestroyed()) return;
  targetWindow.webContents.send("longlong-bond:update", getLonglongBondSnapshot());
}

function broadcastLonglongBond() {
  sendLonglongBondToWindow(mainWindow);
  sendLonglongBondToWindow(companionWindow);
}

function saveLonglongBondAndBroadcast() {
  const state = ensureLonglongBondState();
  state.updatedAt = Date.now();
  writeLonglongBondState(state);
  broadcastLonglongBond();
  return getLonglongBondSnapshot(state);
}

function addLonglongAffection(amount = 0, reason = "") {
  const value = normalizeLonglongNumber(amount);
  if (!value) return getLonglongBondSnapshot();

  const state = ensureLonglongBondState();
  state.affection += Math.min(50, value);
  if (reason === "chat") state.chatCount += 1;
  return saveLonglongBondAndBroadcast();
}

function claimLonglongStudyCoins({ seconds = 0, date = "" } = {}) {
  const state = ensureLonglongBondState();
  const dateKey = /^\d{4}-\d{2}-\d{2}$/.test(String(date)) ? String(date) : getTodayStudyDateKey();
  const earnedBlocks = Math.min(
    longlongDailyCoinCap,
    Math.floor(normalizeLonglongNumber(seconds) / longlongStudyCoinSeconds),
  );
  const claimedBlocks = normalizeLonglongNumber(state.claimedStudyBlocksByDate[dateKey]);
  const newBlocks = Math.max(0, earnedBlocks - claimedBlocks);

  if (!newBlocks) {
    return {
      ...getLonglongBondSnapshot(state),
      claimedCoins: 0,
      earnedBlocks,
      claimedBlocks,
      date: dateKey,
    };
  }

  state.coins += newBlocks;
  state.claimedStudyBlocksByDate[dateKey] = earnedBlocks;
  const snapshot = saveLonglongBondAndBroadcast();
  return {
    ...snapshot,
    claimedCoins: newBlocks,
    earnedBlocks,
    claimedBlocks: earnedBlocks,
    date: dateKey,
  };
}

function buyLonglongGift(giftId = "") {
  const gift = longlongGiftCatalog.find((item) => item.id === String(giftId));
  const state = ensureLonglongBondState();

  if (!gift) {
    return {
      ok: false,
      reason: "unknown-gift",
      snapshot: getLonglongBondSnapshot(state),
    };
  }

  if (state.coins < gift.price) {
    return {
      ok: false,
      reason: "insufficient-coins",
      missingCoins: gift.price - state.coins,
      gift,
      snapshot: getLonglongBondSnapshot(state),
    };
  }

  state.coins -= gift.price;
  state.affection += gift.affection;
  state.gifted[gift.id] = normalizeLonglongNumber(state.gifted[gift.id]) + 1;
  const snapshot = saveLonglongBondAndBroadcast();
  return {
    ok: true,
    gift,
    gainedAffection: gift.affection,
    snapshot,
  };
}

function getLonglongMemoryPath() {
  return path.join(app.getPath("userData"), "longlong-memory.json");
}

function normalizeLonglongText(value = "", limit = 8000) {
  return String(value || "").replace(/\s+/g, " ").trim().slice(0, limit);
}

function createLonglongId(prefix = "longlong") {
  return `${prefix}-${Date.now().toString(36)}-${crypto.randomBytes(3).toString("hex")}`;
}

function normalizeLonglongChatMessage(message = {}) {
  const role = ["user", "assistant"].includes(message.role) ? message.role : "";
  const content = normalizeLonglongText(message.content, 8000);
  if (!role || !content) return null;
  return {
    id: normalizeLonglongText(message.id, 80) || createLonglongId("chat"),
    role,
    content,
    source: ["main", "pet", "system"].includes(message.source) ? message.source : "system",
    createdAt: normalizeLonglongNumber(message.createdAt || Date.now()),
    meta: message.meta && typeof message.meta === "object" ? message.meta : {},
  };
}

function normalizeLonglongMemoryEntry(entry = {}) {
  const text = normalizeLonglongText(entry.text, 500);
  if (!text) return null;
  return {
    id: normalizeLonglongText(entry.id, 80) || createLonglongId("memory"),
    text,
    source: ["main", "pet", "system"].includes(entry.source) ? entry.source : "system",
    createdAt: normalizeLonglongNumber(entry.createdAt || Date.now()),
    updatedAt: normalizeLonglongNumber(entry.updatedAt || entry.createdAt || Date.now()),
    count: normalizeLonglongNumber(entry.count || 1, 1),
  };
}

function normalizeLonglongMemoryState(raw = {}) {
  const history = (Array.isArray(raw.history) ? raw.history : [])
    .map(normalizeLonglongChatMessage)
    .filter(Boolean)
    .slice(-40);
  const memories = (Array.isArray(raw.memories) ? raw.memories : [])
    .map(normalizeLonglongMemoryEntry)
    .filter(Boolean)
    .slice(-80);

  return {
    history,
    memories,
    updatedAt: normalizeLonglongNumber(raw.updatedAt),
  };
}

function readLonglongMemoryState() {
  try {
    return normalizeLonglongMemoryState(JSON.parse(fsSync.readFileSync(getLonglongMemoryPath(), "utf8")));
  } catch {
    return normalizeLonglongMemoryState();
  }
}

function writeLonglongMemoryState(state) {
  const statePath = getLonglongMemoryPath();
  fsSync.mkdirSync(path.dirname(statePath), { recursive: true });
  fsSync.writeFileSync(statePath, JSON.stringify(normalizeLonglongMemoryState(state), null, 2), "utf8");
}

function ensureLonglongMemoryState() {
  if (!longlongMemoryState) longlongMemoryState = readLonglongMemoryState();
  return longlongMemoryState;
}

function getLonglongMemorySnapshot(state = ensureLonglongMemoryState()) {
  const normalized = normalizeLonglongMemoryState(state);
  return {
    ...normalized,
    memoryCount: normalized.memories.length,
    historyCount: normalized.history.length,
  };
}

function sendLonglongMemoryToWindow(targetWindow) {
  if (!targetWindow || targetWindow.isDestroyed()) return;
  targetWindow.webContents.send("longlong-chat:update", getLonglongMemorySnapshot());
}

function broadcastLonglongMemory() {
  sendLonglongMemoryToWindow(mainWindow);
  sendLonglongMemoryToWindow(companionWindow);
}

function saveLonglongMemoryAndBroadcast() {
  const state = ensureLonglongMemoryState();
  state.updatedAt = Date.now();
  writeLonglongMemoryState(state);
  broadcastLonglongMemory();
  return getLonglongMemorySnapshot(state);
}

function appendLonglongSharedMessage(role, content, source = "system", meta = {}) {
  const state = ensureLonglongMemoryState();
  const message = normalizeLonglongChatMessage({
    role,
    content,
    source,
    createdAt: Date.now(),
    meta,
  });
  if (!message) return null;
  state.history.push(message);
  state.history = state.history.slice(-40);
  saveLonglongMemoryAndBroadcast();
  return message;
}

function normalizeLonglongMemoryComparable(text = "") {
  return normalizeLonglongText(text, 500)
    .toLowerCase()
    .replace(/[，。！？、,.!?;；:：“”"'`~\s]/g, "");
}

function upsertLonglongMemory(text, source = "system") {
  const normalizedText = normalizeLonglongText(text, 500);
  if (!normalizedText) return null;
  const state = ensureLonglongMemoryState();
  const comparable = normalizeLonglongMemoryComparable(normalizedText);
  const existing = state.memories.find((entry) => normalizeLonglongMemoryComparable(entry.text) === comparable);
  if (existing) {
    existing.text = normalizedText;
    existing.source = source;
    existing.updatedAt = Date.now();
    existing.count = normalizeLonglongNumber(existing.count, 1) + 1;
    saveLonglongMemoryAndBroadcast();
    return existing;
  }

  const entry = normalizeLonglongMemoryEntry({
    text: normalizedText,
    source,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    count: 1,
  });
  state.memories.push(entry);
  state.memories = state.memories.slice(-80);
  saveLonglongMemoryAndBroadcast();
  return entry;
}

function deleteLonglongMemory(memoryId = "") {
  const state = ensureLonglongMemoryState();
  const before = state.memories.length;
  state.memories = state.memories.filter((entry) => entry.id !== String(memoryId));
  if (state.memories.length !== before) saveLonglongMemoryAndBroadcast();
  return getLonglongMemorySnapshot(state);
}

function clearLonglongChatHistory() {
  const state = ensureLonglongMemoryState();
  state.history = [];
  return saveLonglongMemoryAndBroadcast();
}

function extractLonglongMemoryCandidates(message = "") {
  const text = normalizeLonglongText(message, 1000);
  if (!text) return [];
  const candidates = [];
  const explicitPatterns = [
    /(?:请|帮我|替我|你要|龙龙)?(?:记住|记一下|记下来|记一笔|以后记得|以后要记得|加入记忆库)[:：,，\s]*(.+)$/i,
    /(?:把|将)(.+?)(?:记住|记下来|加入记忆库)$/i,
    /(?:remember|memorize|note)\s*[:：]?\s*(.+)$/i,
  ];

  for (const pattern of explicitPatterns) {
    const match = text.match(pattern);
    if (match?.[1]) candidates.push(match[1]);
  }

  const nameMatch = text.match(/(?:我叫|我的名字是|你可以叫我|叫我)([\u4e00-\u9fa5A-Za-z0-9_-]{1,24})/);
  if (nameMatch?.[1]) candidates.push(`用户的名字是 ${nameMatch[1]}`);

  const preferenceMatch = text.match(/我(?:最)?(?:喜欢|偏好|爱|讨厌|不喜欢)(.{1,80})/);
  if (preferenceMatch?.[0]) candidates.push(`用户${preferenceMatch[0]}`);

  return [...new Set(candidates.map((item) => normalizeLonglongText(item, 500)).filter((item) => item.length >= 2))].slice(0, 4);
}

function rememberLonglongUserMessage(message = "", source = "system") {
  const memories = extractLonglongMemoryCandidates(message).map((candidate) => upsertLonglongMemory(candidate, source)).filter(Boolean);
  return memories;
}

function getLonglongRelevantMemories(query = "", limit = 8) {
  const state = ensureLonglongMemoryState();
  const normalizedQuery = normalizeLonglongMemoryComparable(query);
  const scored = state.memories.map((entry, index) => {
    const comparable = normalizeLonglongMemoryComparable(entry.text);
    let score = index / 1000;
    if (normalizedQuery && comparable && (normalizedQuery.includes(comparable) || comparable.includes(normalizedQuery))) score += 10;
    for (const token of normalizedQuery.match(/[\u4e00-\u9fa5]{2,}|[a-z0-9]{2,}/gi) || []) {
      if (comparable.includes(token)) score += 1;
    }
    score += Math.min(3, normalizeLonglongNumber(entry.count, 1) * 0.2);
    return { entry, score };
  });

  return scored
    .sort((a, b) => b.score - a.score || b.entry.updatedAt - a.entry.updatedAt)
    .slice(0, limit)
    .map((item) => item.entry);
}

function getLonglongRecentChatHistory(limit = 12) {
  return ensureLonglongMemoryState().history.slice(-limit).map(({ role, content }) => ({ role, content }));
}

function normalizeLonglongChatHistory(history = []) {
  return (Array.isArray(history) ? history : [])
    .filter((message) => message && ["user", "assistant"].includes(message.role))
    .slice(-12)
    .map((message) => ({
      role: message.role,
      content: String(message.content || "").slice(0, 2000),
    }))
    .filter((message) => message.content.trim());
}

function ensureStudyTimerState() {
  const now = Date.now();
  const today = getTodayStudyDateKey(new Date(now));

  if (!studyTimerState) {
    const stored = readStudyTimerState();
    const storedDays = stored.days && typeof stored.days === "object" ? stored.days : {};
    if (/^\d{4}-\d{2}-\d{2}$/.test(stored.date) && Number(stored.accumulatedMs) > 0) {
      storedDays[stored.date] = Math.max(
        Number(storedDays[stored.date]) || 0,
        Number(stored.accumulatedMs) || 0,
      );
    }
    studyTimerState = {
      date: stored.date === today ? stored.date : today,
      accumulatedMs: stored.date === today ? Math.max(0, Number(stored.accumulatedMs) || 0) : 0,
      days: Object.fromEntries(
        Object.entries(storedDays)
          .map(([dateKey, milliseconds]) => [dateKey, Math.max(0, Number(milliseconds) || 0)])
          .filter(([dateKey]) => /^\d{4}-\d{2}-\d{2}$/.test(dateKey)),
      ),
      runningSince: now,
    };
  }

  if (studyTimerState.date !== today) {
    const previousElapsedMs = studyTimerState.accumulatedMs + Math.max(0, now - studyTimerState.runningSince);
    studyTimerState.days[studyTimerState.date] = Math.max(
      Number(studyTimerState.days[studyTimerState.date]) || 0,
      previousElapsedMs,
    );
    studyTimerState = {
      date: today,
      accumulatedMs: 0,
      days: studyTimerState.days,
      runningSince: now,
    };
    studyTimerLastSaveAt = 0;
    writeStudyTimerState(studyTimerState);
  }

  return studyTimerState;
}

function getStudyTimerSnapshot() {
  const state = ensureStudyTimerState();
  const now = Date.now();
  const elapsedMs = state.accumulatedMs + Math.max(0, now - state.runningSince);
  const seconds = Math.floor(elapsedMs / 1000);
  const dailySeconds = Object.fromEntries(
    Object.entries(state.days || {}).map(([dateKey, milliseconds]) => [
      dateKey,
      Math.floor(Math.max(0, Number(milliseconds) || 0) / 1000),
    ]),
  );
  dailySeconds[state.date] = seconds;

  return {
    date: state.date,
    seconds,
    formatted: formatStudyDuration(seconds),
    label: `今日学习 ${formatStudyDuration(seconds)}`,
    dailySeconds,
    updatedAt: now,
  };
}

function persistStudyTimerState() {
  const state = ensureStudyTimerState();
  const now = Date.now();
  state.accumulatedMs += Math.max(0, now - state.runningSince);
  state.runningSince = now;
  state.days[state.date] = state.accumulatedMs;
  studyTimerLastSaveAt = now;
  writeStudyTimerState({
    date: state.date,
    accumulatedMs: state.accumulatedMs,
    days: state.days,
    updatedAt: now,
  });
}

function sendStudyTimerToWindow(targetWindow) {
  if (!targetWindow || targetWindow.isDestroyed()) return;
  targetWindow.webContents.send("study-timer:update", getStudyTimerSnapshot());
}

function broadcastStudyTimer() {
  const snapshot = getStudyTimerSnapshot();

  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send("study-timer:update", snapshot);
  }

  if (companionWindow && !companionWindow.isDestroyed()) {
    companionWindow.webContents.send("study-timer:update", snapshot);
  }

  if (Date.now() - studyTimerLastSaveAt > 15000) {
    persistStudyTimerState();
  }
}

function startStudyTimer() {
  ensureStudyTimerState();
  if (studyTimerInterval) return;
  broadcastStudyTimer();
  studyTimerInterval = setInterval(broadcastStudyTimer, 1000);
}

function getQwenRuntimeConfig() {
  const localConfig = readQwenLocalConfig();
  const envApiKey = process.env.DASHSCOPE_API_KEY || process.env.QWEN_API_KEY || "";
  const localApiKey = typeof localConfig.apiKey === "string" ? localConfig.apiKey : "";

  return {
    apiKey: envApiKey || localApiKey,
    baseUrl: process.env.DASHSCOPE_BASE_URL || process.env.QWEN_BASE_URL || localConfig.baseUrl || DEFAULT_BASE_URL,
    model: process.env.QWEN_MODEL || process.env.DASHSCOPE_MODEL || localConfig.model || DEFAULT_MODEL,
    multimodalModel: process.env.QWEN_MULTIMODAL_MODEL || localConfig.multimodalModel || DEFAULT_MULTIMODAL_MODEL,
    asrModel: process.env.QWEN_ASR_MODEL || process.env.DASHSCOPE_ASR_MODEL || localConfig.asrModel || DEFAULT_ASR_MODEL,
    source: envApiKey ? "environment" : localApiKey ? "app-settings" : "missing",
  };
}

function getQwenStatus() {
  const config = getQwenRuntimeConfig();

  return {
    configured: Boolean(config.apiKey),
    baseUrl: config.baseUrl,
    model: config.model,
    multimodalModel: config.multimodalModel,
    asrModel: config.asrModel,
    provider: "qwen",
    source: config.source,
  };
}

function createCurrentStudyAiService() {
  const config = getQwenRuntimeConfig();

  return createStudyAiService({
    clientOptions: {
      apiKey: config.apiKey,
      baseUrl: config.baseUrl,
      model: config.model,
      multimodalModel: config.multimodalModel,
      asrModel: config.asrModel,
    },
  });
}

function getMusicRecommendationRuntimeConfig() {
  const baseConfig = getQwenRuntimeConfig();
  const apiKey = process.env.Music_Recommand_Key || "";
  return {
    apiKey,
    baseUrl: process.env.MUSIC_RECOMMAND_BASE_URL || baseConfig.baseUrl,
    model: process.env.MUSIC_RECOMMAND_MODEL || baseConfig.model,
    multimodalModel: baseConfig.multimodalModel,
    asrModel: baseConfig.asrModel,
  };
}

function createMusicRecommendationAiService() {
  const config = getMusicRecommendationRuntimeConfig();

  return createStudyAiService({
    clientOptions: {
      apiKey: config.apiKey,
      baseUrl: config.baseUrl,
      model: config.model,
      multimodalModel: config.multimodalModel,
      asrModel: config.asrModel,
    },
  });
}

function createCurrentQwenClient() {
  const config = getQwenRuntimeConfig();

  return new QwenClient({
    apiKey: config.apiKey,
    baseUrl: config.baseUrl,
    model: config.model,
    multimodalModel: config.multimodalModel,
    asrModel: config.asrModel,
  });
}

let currentKnowledgeGraphService = null;
let currentKnowledgeGraphConfigKey = "";

function getNeo4jRuntimeConfig() {
  const localConfig = parseDotEnvFile(getNeo4jLocalConfigPath());
  return {
    uri: process.env.NEO4J_URI || localConfig.NEO4J_URI || DEFAULT_NEO4J_URI,
    browserUrl: process.env.NEO4J_BROWSER_URL || localConfig.NEO4J_BROWSER_URL || "http://localhost:7474",
    username: process.env.NEO4J_USERNAME || localConfig.NEO4J_USERNAME || DEFAULT_NEO4J_USERNAME,
    password: process.env.NEO4J_PASSWORD || localConfig.NEO4J_PASSWORD || DEFAULT_NEO4J_PASSWORD,
    source: process.env.NEO4J_URI || process.env.NEO4J_PASSWORD ? "environment" : localConfig.NEO4J_PASSWORD ? "local" : "default",
  };
}

function createCurrentKnowledgeGraphService() {
  const neo4jConfig = getNeo4jRuntimeConfig();
  const qwenConfig = getQwenRuntimeConfig();
  const configKey = JSON.stringify({
    neo4jUri: neo4jConfig.uri,
    neo4jUsername: neo4jConfig.username,
    neo4jPassword: neo4jConfig.password,
    qwenBaseUrl: qwenConfig.baseUrl,
    qwenModel: qwenConfig.model,
    qwenApiKey: Boolean(qwenConfig.apiKey),
  });

  if (!currentKnowledgeGraphService || currentKnowledgeGraphConfigKey !== configKey) {
    currentKnowledgeGraphService?.close?.().catch(() => {});
    currentKnowledgeGraphService = createKnowledgeGraphService({
      neo4jConfig,
      qwenClientOptions: {
        apiKey: qwenConfig.apiKey,
        baseUrl: qwenConfig.baseUrl,
        model: qwenConfig.model,
        multimodalModel: qwenConfig.multimodalModel,
        asrModel: qwenConfig.asrModel,
      },
    });
    currentKnowledgeGraphConfigKey = configKey;
  }

  return currentKnowledgeGraphService;
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildCodingAssistantMessages(request = {}) {
  const problem = String(request.problem || request.question || "").trim().slice(0, 12000);
  const code = String(request.code || "").trim().slice(0, 40000);
  const language = String(request.language || "auto").trim() || "auto";
  const hasCode = Boolean(code);
  const mode = hasCode ? "analyze-code" : "solve-problem";

  if (!problem && !code) {
    throw new Error("请至少输入题目或代码。");
  }

  const system = [
    "你是 MindStudy 的龙龙，正在作为“阿龙在 Coding”助手陪用户写代码。",
    "回答中要自然自称“龙龙”，语气亲和、耐心，但不要影响技术判断的准确性。",
    "请用中文回答，面向正在刷题或写项目的学生。",
    "如果用户提供了代码，重点分析代码意图、可行性、潜在 bug、时间复杂度、空间复杂度和优化建议。",
    "如果用户只提供题目，先给出你认为最稳妥的算法思路，再写一版高质量代码，并说明复杂度。",
    "回答要结构清晰，代码必须放在 Markdown 代码块中。",
    "不要编造题目没有给出的约束；约束缺失时说明你的合理假设。",
  ].join(" ");
  const sections = hasCode
    ? "请按以下结构回答：功能判断、可行性与风险、时间复杂度、空间复杂度、优化建议、必要时给出改进版代码。"
    : "请按以下结构回答：题意理解、核心思路、最佳代码、时间复杂度、空间复杂度、边界情况。";

  return {
    mode,
    messages: [
      {
        role: "system",
        content: system,
      },
      {
        role: "user",
        content: [
          sections,
          `\n语言偏好：${language}`,
          problem ? `\n题目：\n${problem}` : "\n题目：未提供",
          code ? `\n代码：\n\`\`\`${language === "auto" ? "" : language}\n${code}\n\`\`\`` : "\n代码：未提供",
        ].join("\n"),
      },
    ],
  };
}

async function askCodingAssistant(request = {}) {
  const { mode, messages } = buildCodingAssistantMessages(request);
  const options = request.options || {};
  const response = await createCurrentQwenClient().chat({
    messages,
    temperature: options.temperature != null ? options.temperature : 0.18,
    maxTokens: options.maxTokens != null ? options.maxTokens : 8192,
    model: options.model,
  });

  return {
    mode,
    answer: response.content,
    model: response.model,
    usage: response.usage,
  };
}

async function captureCurrentScreenForLonglong() {
  const cursorPoint = screen.getCursorScreenPoint();
  const display = screen.getDisplayNearestPoint(cursorPoint);
  const displayWidth = Math.max(1, display.size.width);
  const displayHeight = Math.max(1, display.size.height);
  const thumbnailWidth = Math.min(1280, displayWidth);
  const thumbnailHeight = Math.round((thumbnailWidth / displayWidth) * displayHeight);
  const previousOpacity = companionWindow && !companionWindow.isDestroyed() ? companionWindow.getOpacity() : null;

  if (previousOpacity != null && companionWindow?.isVisible()) {
    companionWindow.setOpacity(0);
    await delay(70);
  }

  try {
    const sources = await desktopCapturer.getSources({
      types: ["screen"],
      thumbnailSize: {
        width: thumbnailWidth,
        height: thumbnailHeight,
      },
    });
    const source = sources.find((item) => String(item.display_id) === String(display.id)) || sources[0];

    if (!source || source.thumbnail.isEmpty()) {
      throw new Error("没有捕获到当前屏幕。");
    }

    return {
      dataUrl: source.thumbnail.toDataURL(),
      capturedAt: Date.now(),
      display: {
        id: display.id,
        width: displayWidth,
        height: displayHeight,
        scaleFactor: display.scaleFactor,
      },
    };
  } finally {
    if (previousOpacity != null && companionWindow && !companionWindow.isDestroyed()) {
      companionWindow.setOpacity(previousOpacity);
      companionWindow.moveTop();
    }
  }
}

function buildLonglongChatMessages(request = {}, screenContext = null, screenError = "", screenCapture = null) {
  const message = String(request.message || request.question || "").trim().slice(0, 8000);
  const history = normalizeLonglongChatHistory(getLonglongRecentChatHistory(12));
  const memories = Array.isArray(request.memories) ? request.memories : getLonglongRelevantMemories(message, 8);

  if (!message) {
    throw new Error("请先告诉龙龙你想聊什么。");
  }

  const system = [
    "你是 MindStudy 的桌宠 AI 助手龙龙。",
    "你必须自然自称“龙龙”，像一直陪在用户身边的学习搭子一样说话，亲和、简洁、有行动建议。",
    "你可以参考随消息提供的龙龙记忆库，但不要虚构记忆库里没有的信息；如果记忆可能过时，要轻轻确认。",
    "如果用户的问题和屏幕内容相关，请直接观察随消息提供的屏幕截图图像回答；看不清或无法判断时要坦诚说明。",
    "不要声称你读取了用户没有提供的文件、后台窗口或隐私内容。",
    "请使用中文 Markdown 排版，标题和列表要清晰，回答不要过长。",
  ].join(" ");
  const memoryText = memories.length
    ? [
        "龙龙记忆库里和这次对话可能相关的信息：",
        ...memories.map((entry, index) => `${index + 1}. ${entry.text}`),
      ].join("\n")
    : "龙龙记忆库暂时没有和这次对话直接相关的信息。";
  const screenText = screenContext?.captured
    ? "这次已附上当前屏幕截图。请把截图当作主要视觉上下文，直接识别界面、图片、公式、代码结构或可见文字。"
    : screenError
      ? `这次没有成功截图，原因：${screenError}。请基于用户文字继续帮助，并说明龙龙暂时看不到屏幕细节。`
      : "这次没有读取屏幕内容，请基于用户文字回答。";
  const userText = [
    memoryText,
    "",
    screenText,
    "",
    `用户对龙龙说：${message}`,
  ].join("\n");
  const userContent = screenCapture?.dataUrl
    ? [
        { type: "text", text: userText },
        { type: "image_url", image_url: { url: screenCapture.dataUrl } },
      ]
    : userText;

  return [
    { role: "system", content: system },
    ...history,
    { role: "user", content: userContent },
  ];
}

async function askLonglongCompanion(request = {}) {
  const options = request.options || {};
  const includeScreen = request.includeScreen !== false;
  const message = String(request.message || request.question || "").trim().slice(0, 8000);
  const source = ["main", "pet"].includes(request.source) ? request.source : "system";
  const client = createCurrentQwenClient();
  let screenCapture = null;
  let screenContext = null;
  let screenError = "";

  if (!message) {
    throw new Error("请先告诉龙龙你想聊什么。");
  }

  const remembered = rememberLonglongUserMessage(message, source);
  const relevantMemories = getLonglongRelevantMemories(message, 8);

  if (includeScreen) {
    try {
      screenCapture = await captureCurrentScreenForLonglong();
      screenContext = {
        captured: true,
        capturedAt: screenCapture.capturedAt,
        display: screenCapture.display,
      };
    } catch (error) {
      screenError = error.message || String(error);
    }
  }

  const response = await client.chat({
    messages: buildLonglongChatMessages({ ...request, message, memories: relevantMemories }, screenContext, screenError, screenCapture),
    multimodal: Boolean(screenCapture?.dataUrl),
    temperature: options.temperature != null ? options.temperature : 0.28,
    maxTokens: options.maxTokens != null ? options.maxTokens : 4096,
    model: options.model,
  });
  const screenResult = screenContext
    ? {
        captured: true,
        imageUsed: Boolean(screenCapture?.dataUrl),
        capturedAt: screenContext.capturedAt,
        display: screenContext.display,
        error: "",
      }
    : { captured: false, imageUsed: false, error: screenError };

  appendLonglongSharedMessage("user", message, source, {
    remembered: remembered.map((entry) => entry.id),
    includeScreen,
  });
  appendLonglongSharedMessage("assistant", response.content, source, {
    model: response.model,
    screen: screenResult,
  });

  return {
    answer: response.content,
    model: response.model,
    usage: response.usage,
    screen: screenResult,
    remembered,
    chat: getLonglongMemorySnapshot(),
  };
}

function saveQwenApiKey(apiKey) {
  const nextApiKey = String(apiKey || "").trim();

  if (!nextApiKey) {
    throw new Error("Qwen API key cannot be empty.");
  }

  const localConfig = readQwenLocalConfig();
  writeQwenLocalConfig({
    ...localConfig,
    apiKey: nextApiKey,
    updatedAt: Date.now(),
  });

  return getQwenStatus();
}

function clearQwenApiKey() {
  const localConfig = readQwenLocalConfig();
  delete localConfig.apiKey;
  localConfig.updatedAt = Date.now();
  writeQwenLocalConfig(localConfig);
  return getQwenStatus();
}

function getBase64Payload(payload) {
  if (typeof payload === "string") {
    return payload.trim();
  }

  if (typeof payload?.base64 === "string" && payload.base64.trim()) {
    return payload.base64.trim();
  }

  if (typeof payload?.dataUrl === "string" && payload.dataUrl.includes(",")) {
    return payload.dataUrl.split(",").pop().trim();
  }

  return "";
}

function getPdfExtractionOptions(payload) {
  const options = payload && typeof payload === "object" && payload.options ? payload.options : {};

  return {
    maxPages: options.maxPages,
    pageTextLimit: options.pageTextLimit,
    totalTextLimit: options.totalTextLimit || options.maxPdfTextChars,
  };
}

function getOcrOptions(payload) {
  const options = payload && typeof payload === "object" && payload.options ? payload.options : {};

  return {
    language: options.language,
    languages: options.languages,
    textLimit: options.textLimit,
    pageNumber: options.pageNumber,
    cachePath: path.join(app.getPath("userData"), "ocr-cache"),
  };
}

function getAudioTranscriptionOptions(payload) {
  const options = payload && typeof payload === "object" && payload.options ? payload.options : {};

  return {
    dataUrl: typeof payload?.dataUrl === "string" ? payload.dataUrl : "",
    base64: getBase64Payload(payload),
    mimeType: payload?.mimeType || options.mimeType || "audio/webm",
    model: options.model,
    prompt: options.prompt,
    maxTokens: options.maxTokens,
    language: options.language,
    asrOptions: options.asrOptions,
  };
}

function addWebSearchResult(results, maxResults, title, snippet, url) {
  const nextSnippet = String(snippet || "").trim();
  const nextTitle = String(title || "").trim() || nextSnippet.slice(0, 80);
  const nextUrl = String(url || "").trim();

  if (!nextSnippet || results.length >= maxResults) return;
  if (results.some((result) => result.snippet === nextSnippet || (nextUrl && result.url === nextUrl))) return;

  results.push({
    title: nextTitle,
    snippet: nextSnippet,
    url: nextUrl,
  });
}

function collectWebSearchResults(data, maxResults) {
  const results = [];

  addWebSearchResult(results, maxResults, data?.Heading, data?.AbstractText, data?.AbstractURL);

  function visitTopics(topics) {
    for (const topic of topics || []) {
      if (results.length >= maxResults) return;

      if (Array.isArray(topic.Topics)) {
        visitTopics(topic.Topics);
        continue;
      }

      addWebSearchResult(results, maxResults, topic.Text, topic.Text, topic.FirstURL);
    }
  }

  visitTopics(data?.RelatedTopics);
  return results;
}

function decodeHtmlEntities(value = "") {
  const namedEntities = {
    amp: "&",
    lt: "<",
    gt: ">",
    quot: '"',
    apos: "'",
    nbsp: " ",
    ensp: " ",
    emsp: " ",
    middot: "·",
  };

  return String(value).replace(/&(#x[0-9a-f]+|#[0-9]+|[a-z]+);/gi, (entity, code) => {
    const normalized = code.toLowerCase();

    if (normalized.startsWith("#x")) {
      const point = Number.parseInt(normalized.slice(2), 16);
      return Number.isFinite(point) ? String.fromCodePoint(point) : entity;
    }

    if (normalized.startsWith("#")) {
      const point = Number.parseInt(normalized.slice(1), 10);
      return Number.isFinite(point) ? String.fromCodePoint(point) : entity;
    }

    return Object.prototype.hasOwnProperty.call(namedEntities, normalized) ? namedEntities[normalized] : entity;
  });
}

function stripSearchHtml(value = "") {
  return decodeHtmlEntities(
    String(value)
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim(),
  );
}

function createAbortableTimeout(timeoutMs, parentSignal) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  let cleanupParent = null;

  if (parentSignal) {
    if (parentSignal.aborted) {
      controller.abort();
    } else {
      const abortFromParent = () => controller.abort();
      parentSignal.addEventListener("abort", abortFromParent, { once: true });
      cleanupParent = () => parentSignal.removeEventListener("abort", abortFromParent);
    }
  }

  return {
    signal: controller.signal,
    cleanup() {
      clearTimeout(timeout);
      cleanupParent?.();
    },
  };
}

function throwIfAborted(signal) {
  if (signal?.aborted) {
    const error = new Error("RAG request was canceled.");
    error.name = "AbortError";
    throw error;
  }
}

function getSearchErrorMessage(error) {
  const message = error?.message || String(error || "unknown error");

  if (error?.name === "AbortError" || message.includes("aborted")) {
    return "request timed out or was aborted";
  }

  return message;
}

async function searchDuckDuckGoKnowledge(query, maxResults, timeoutMs, signal) {
  const abortable = createAbortableTimeout(timeoutMs, signal);
  const params = new URLSearchParams({
    q: query,
    format: "json",
    no_html: "1",
    skip_disambig: "1",
  });

  try {
    const response = await fetch(`https://api.duckduckgo.com/?${params.toString()}`, {
      signal: abortable.signal,
      headers: {
        Accept: "application/json",
      },
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(`Web search failed with status ${response.status}.`);
    }

    return {
      query,
      provider: "duckduckgo-instant-answer",
      results: collectWebSearchResults(data, maxResults),
    };
  } finally {
    abortable.cleanup();
  }
}

function collectBingSearchResults(html, maxResults) {
  const results = [];
  const blocks = String(html || "").match(/<li class="b_algo"[\s\S]*?(?=<li class="b_algo"|<li class="b_ans"|<\/ol>)/g) || [];

  for (const block of blocks) {
    if (results.length >= maxResults) break;

    const heading = block.match(/<h2[^>]*>[\s\S]*?<a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>[\s\S]*?<\/h2>/i);
    const paragraph = block.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
    const title = stripSearchHtml(heading?.[2] || "");
    const snippet = stripSearchHtml(paragraph?.[1] || title);
    const url = decodeHtmlEntities(heading?.[1] || "");

    addWebSearchResult(results, maxResults, title, snippet, url);
  }

  return results;
}

async function searchBingKnowledge(query, maxResults, timeoutMs, signal) {
  const abortable = createAbortableTimeout(timeoutMs, signal);
  const params = new URLSearchParams({
    q: query,
    count: String(Math.max(maxResults, 5)),
  });

  try {
    const response = await fetch(`https://www.bing.com/search?${params.toString()}`, {
      signal: abortable.signal,
      headers: {
        Accept: "text/html",
        "User-Agent": "Mozilla/5.0 MindStudy/0.1",
      },
    });
    const html = await response.text();

    if (!response.ok) {
      throw new Error(`Bing search failed with status ${response.status}.`);
    }

    return {
      query,
      provider: "bing-web",
      results: collectBingSearchResults(html, maxResults),
    };
  } finally {
    abortable.cleanup();
  }
}

async function searchWebKnowledge(request = {}) {
  const query = String(request.query || "").trim();

  if (!query) {
    throw new Error("Web search requires a non-empty query.");
  }

  if (typeof fetch !== "function") {
    throw new Error("Global fetch is not available for web search.");
  }

  const maxResults = Math.min(8, Math.max(1, Number(request.maxResults) || 5));
  const timeoutMs = Math.min(45000, Math.max(1500, Number(request.timeoutMs) || 20000));
  const errors = [];
  const providers = [
    () => searchDuckDuckGoKnowledge(query, maxResults, timeoutMs, request.signal),
    () => searchBingKnowledge(query, maxResults, timeoutMs, request.signal),
  ];

  for (const searchProvider of providers) {
    throwIfAborted(request.signal);

    try {
      const webSearch = await searchProvider();
      if (webSearch.results.length) {
        return errors.length ? { ...webSearch, fallbackErrors: errors } : webSearch;
      }
      errors.push(`${webSearch.provider}: no results`);
    } catch (error) {
      throwIfAborted(request.signal);
      errors.push(getSearchErrorMessage(error));
    }
  }

  return {
    query,
    provider: "duckduckgo-instant-answer+bing-web",
    error: errors.join("; "),
    results: [],
  };
}

function buildWebSearchDocuments(webSearch) {
  return (webSearch?.results || []).map((result, index) => ({
    id: `web-${index + 1}`,
    title: result.title || `Web result ${index + 1}`,
    text: [result.snippet, result.url ? `URL: ${result.url}` : ""].filter(Boolean).join("\n"),
    mimeType: "text/plain",
    extension: "TXT",
    sourceType: "web",
  }));
}

async function answerRagLibrary(request = {}) {
  const question = String(request.question || "").trim();
  const documents = Array.isArray(request.documents) ? request.documents : [];
  const options = request && typeof request.options === "object" ? request.options : {};
  const signal = options.signal || request.signal;

  if (!question) {
    throw new Error("RAG library question cannot be empty.");
  }

  let webSearch = null;
  if (request.includeWeb) {
    try {
      webSearch = await searchWebKnowledge({
        query: question,
        maxResults: options.webResults || 4,
        timeoutMs: options.webSearchTimeoutMs || options.webTimeoutMs || 20000,
        signal,
      });
    } catch (error) {
      throwIfAborted(signal);
      webSearch = {
        query: question,
        provider: "duckduckgo-instant-answer+bing-web",
        error: error.message || String(error),
        results: [],
      };
    }
  }

  throwIfAborted(signal);

  const allDocuments = [
    ...documents.map((documentMeta, index) => ({
      id: documentMeta.id || `knowledge-${index + 1}`,
      title: documentMeta.title || documentMeta.name || `Knowledge ${index + 1}`,
      text: documentMeta.text || documentMeta.content || "",
      mimeType: documentMeta.mimeType || "text/plain",
      extension: documentMeta.extension || "TXT",
      sourceType: documentMeta.sourceType || "knowledge",
    })),
    ...buildWebSearchDocuments(webSearch),
  ].filter((documentMeta) => String(documentMeta.text || "").trim());

  if (!allDocuments.length) {
    throw new Error("RAG library has no learned knowledge or web results to search.");
  }

  const answer = await createCurrentStudyAiService().askCourseQuestion({
    question: [
      question,
      "",
      "Answer primarily from the learned local knowledge base.",
      "Use web search results only as secondary support, and explicitly say when web search is insufficient.",
    ].join("\n"),
    documents: allDocuments,
    options: {
      chunkSize: options.chunkSize,
      maxChunks: options.maxChunks,
      maxContextChars: options.maxContextChars || 300000,
      maxTokens: options.maxTokens || 32768,
      temperature: options.temperature ?? 0.2,
      signal,
    },
  });

  return {
    ...answer,
    webSearch,
    learnedDocumentCount: documents.length,
  };
}

function getMimeType(extension) {
  const normalized = extension.toLowerCase();

  if (normalized === ".pdf") {
    return "application/pdf";
  }

  if (normalized === ".md") {
    return "text/markdown";
  }

  return "application/octet-stream";
}

async function readCourseFile(filePath) {
  const extensionWithDot = path.extname(filePath).toLowerCase();

  if (!supportedExtensions.has(extensionWithDot)) {
    throw new Error("暂不支持该文件格式。请选择 PDF 或 Markdown 文件。");
  }

  const stats = await fs.stat(filePath);

  if (stats.size > maxImportBytes) {
    throw new Error("文件过大，请选择 80MB 以内的课程资料。");
  }

  const buffer = await fs.readFile(filePath);
  const base64 = buffer.toString("base64");
  const mimeType = getMimeType(extensionWithDot);

  return {
    path: filePath,
    name: path.basename(filePath),
    extension: extensionWithDot.replace(".", "").toUpperCase(),
    mimeType,
    size: stats.size,
    updatedAt: stats.mtimeMs,
    base64,
    dataUrl: `data:${mimeType};base64,${base64}`,
  };
}

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 920,
    minWidth: 1080,
    minHeight: 760,
    backgroundColor: "#f5f7f3",
    title: "MindStudy",
    show: false,
    titleBarStyle: isWindows ? "default" : "hiddenInset",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      backgroundThrottling: false,
    },
  });

  mainWindow.loadFile(path.join(__dirname, "..", "frontend", "index.html"));
  mainWindow.webContents.once("did-finish-load", () => {
    sendStudyTimerToWindow(mainWindow);
    sendLonglongMemoryToWindow(mainWindow);
  });

  mainWindow.once("ready-to-show", () => {
    lastMainWindowBounds = mainWindow.getBounds();
    mainWindow.show();
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  mainWindow.on("move", () => {
    if (!mainWindow?.isMinimized()) lastMainWindowBounds = mainWindow.getBounds();
  });

  mainWindow.on("resize", () => {
    if (!mainWindow?.isMinimized()) lastMainWindowBounds = mainWindow.getBounds();
  });

  mainWindow.on("minimize", () => {
    showCompanionWindow();
    setTimeout(showCompanionWindow, 120);
    setTimeout(showCompanionWindow, 420);
  });

  mainWindow.on("restore", () => {
    hideCompanionWindow({ destroy: true });
  });

  mainWindow.on("hide", () => {
    if (companionShouldShow || mainWindow?.isMinimized()) {
      showCompanionWindow();
    }
  });

  mainWindow.on("show", () => {
    if (!mainWindow?.isMinimized()) hideCompanionWindow({ destroy: true });
  });

  mainWindow.on("focus", () => {
    if (!mainWindow?.isMinimized()) hideCompanionWindow({ destroy: true });
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
    companionShouldShow = false;
    if (companionWindow && !companionWindow.isDestroyed()) {
      companionWindow.close();
    }
  });

  return mainWindow;
}

function getCompanionSize(mode = companionMode) {
  return mode === "chat" ? companionChatSize : companionPetSize;
}

function getCompanionBounds() {
  if (companionCustomBounds) {
    return clampCompanionBounds(companionCustomBounds);
  }

  const display = lastMainWindowBounds
    ? screen.getDisplayMatching(lastMainWindowBounds)
    : mainWindow && !mainWindow.isMinimized()
      ? screen.getDisplayMatching(mainWindow.getBounds())
      : screen.getPrimaryDisplay();
  const { x, y, width, height } = display.workArea;
  const size = getCompanionSize();

  return {
    width: size.width,
    height: size.height,
    x: x + width - size.width - 18,
    y: y + height - size.height - 18,
  };
}

function clampCompanionBounds(bounds) {
  const size = getCompanionSize();
  const safeBounds = {
    width: Math.max(1, Math.round(Number(bounds?.width) || size.width)),
    height: Math.max(1, Math.round(Number(bounds?.height) || size.height)),
    x: Math.round(Number(bounds?.x) || 0),
    y: Math.round(Number(bounds?.y) || 0),
  };
  const display = screen.getDisplayMatching(safeBounds);
  const area = display.workArea;
  const width = size.width;
  const height = size.height;

  return {
    width,
    height,
    x: Math.min(area.x + area.width - width, Math.max(area.x, safeBounds.x)),
    y: Math.min(area.y + area.height - height, Math.max(area.y, safeBounds.y)),
  };
}

function resizeCompanionWindowForMode(nextMode) {
  companionMode = nextMode === "chat" ? "chat" : "pet";
  if (!companionWindow || companionWindow.isDestroyed()) return;

  const currentBounds = companionWindow.getBounds();
  const size = getCompanionSize();
  const nextBounds = clampCompanionBounds({
    width: size.width,
    height: size.height,
    x: currentBounds.x + currentBounds.width - size.width,
    y: currentBounds.y + currentBounds.height - size.height,
  });
  companionCustomBounds = nextBounds;
  companionLastMotionBounds = nextBounds;
  companionWindow.setFocusable(companionMode === "chat");
  companionWindow.setBounds(nextBounds, false);
  companionWindow.webContents.send("companion:mode", companionMode);
  if (companionMode === "chat") {
    companionWindow.show();
    companionWindow.focus();
  } else {
    companionWindow.blur();
    companionWindow.setAlwaysOnTop(true, "screen-saver");
  }
}

function moveCompanionWindowTo(bounds = {}) {
  if (!companionWindow || companionWindow.isDestroyed()) return;
  const currentBounds = companionWindow.getBounds();
  const nextX = Number(bounds.x);
  const nextY = Number(bounds.y);
  companionCustomBounds = clampCompanionBounds({
    width: currentBounds.width,
    height: currentBounds.height,
    x: Number.isFinite(nextX) ? nextX : currentBounds.x,
    y: Number.isFinite(nextY) ? nextY : currentBounds.y,
  });
  companionLastMotionBounds = companionCustomBounds;
  companionWindow.setBounds(companionCustomBounds, false);
}

function notifyCompanionNativeMove(bounds) {
  if (!companionWindow || companionWindow.isDestroyed() || companionMode !== "pet") return;
  if (!companionLastMotionBounds) {
    companionLastMotionBounds = bounds;
    return;
  }

  const deltaX = bounds.x - companionLastMotionBounds.x;
  const deltaY = bounds.y - companionLastMotionBounds.y;
  companionLastMotionBounds = bounds;

  if (Math.abs(deltaX) + Math.abs(deltaY) < 1) return;
  companionWindow.webContents.send("companion:drag-motion", { deltaX, deltaY });
}

function createCompanionWindow() {
  if (companionWindow && !companionWindow.isDestroyed()) return companionWindow;

  const bounds = getCompanionBounds();
  companionLastMotionBounds = bounds;
  companionWindow = new BrowserWindow({
    ...bounds,
    frame: false,
    transparent: true,
    resizable: false,
    maximizable: false,
    minimizable: false,
    fullscreenable: false,
    skipTaskbar: true,
    alwaysOnTop: true,
    focusable: companionMode === "chat",
    hasShadow: false,
    show: false,
    backgroundColor: "#00000000",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      backgroundThrottling: false,
    },
  });

  companionWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  companionWindow.loadFile(path.join(__dirname, "..", "frontend", "companion.html"));
  companionWindow.webContents.once("did-finish-load", () => {
    companionWindow?.webContents.send("companion:snapshot", companionSnapshot);
    sendStudyTimerToWindow(companionWindow);
    sendLonglongMemoryToWindow(companionWindow);
    if (companionShouldShow) {
      revealCompanionWindow();
    }
  });
  companionWindow.on("show", () => {
    if (companionShouldShow) {
      companionWindow?.setAlwaysOnTop(true, "screen-saver");
      companionWindow?.moveTop();
    }
  });
  companionWindow.on("blur", () => {
    if (companionShouldShow && companionMode !== "chat") {
      setTimeout(revealCompanionWindow, 80);
    }
  });
  companionWindow.on("move", () => {
    if (companionShouldShow) {
      const bounds = clampCompanionBounds(companionWindow.getBounds());
      companionCustomBounds = bounds;
      notifyCompanionNativeMove(bounds);
    }
  });
  companionWindow.on("closed", () => {
    companionWindow = null;
  });

  return companionWindow;
}

function revealCompanionWindow() {
  if (!companionWindow || companionWindow.isDestroyed()) return;

  const bounds = getCompanionBounds();
  companionLastMotionBounds = bounds;
  companionWindow.setBounds(bounds, false);
  companionWindow.setAlwaysOnTop(true, "screen-saver");
  companionWindow.show();
  companionWindow.moveTop();
}

function showCompanionWindow() {
  companionShouldShow = true;
  companionMode = "pet";
  const petWindow = createCompanionWindow();
  if (petWindow.webContents.isLoading()) return;
  revealCompanionWindow();
}

function hideCompanionWindow({ destroy = false } = {}) {
  companionShouldShow = false;
  if (companionWindow && !companionWindow.isDestroyed()) {
    companionCustomBounds = clampCompanionBounds(companionWindow.getBounds());
    if (destroy) {
      companionWindow.close();
    } else {
      companionWindow.hide();
    }
  }
}

function wakeMainWindow() {
  if (!mainWindow || mainWindow.isDestroyed()) {
    createMainWindow();
  }

  lastMainWindowBounds = mainWindow.getBounds();
  if (mainWindow.isMinimized()) mainWindow.restore();
  mainWindow.show();
  mainWindow.focus();
  hideCompanionWindow({ destroy: true });
}

function buildMenu() {
  const template = [
    {
      label: "MindStudy",
      submenu: [
        { role: "about" },
        { type: "separator" },
        { role: "quit", label: "退出" },
      ],
    },
    {
      label: "视图",
      submenu: [
        { role: "reload", label: "重新加载" },
        { role: "toggleDevTools", label: "开发者工具" },
        { type: "separator" },
        { role: "resetZoom", label: "实际大小" },
        { role: "zoomIn", label: "放大" },
        { role: "zoomOut", label: "缩小" },
        { type: "separator" },
        { role: "togglefullscreen", label: "全屏" },
      ],
    },
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

function configurePermissions() {
  session.defaultSession.setPermissionRequestHandler((webContents, permission, callback) => {
    callback(permission === "media");
  });

  session.defaultSession.setPermissionCheckHandler((webContents, permission) => permission === "media");
}

function parseFrontendEnv(content) {
  return Object.fromEntries(
    String(content || "")
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#"))
      .map((line) => {
        const separatorIndex = line.indexOf("=");
        if (separatorIndex < 0) return [line, ""];
        return [
          line.slice(0, separatorIndex).trim(),
          line.slice(separatorIndex + 1).trim().replace(/^["']|["']$/g, ""),
        ];
      })
      .filter(([key]) => key),
  );
}

function readFrontendEnv() {
  try {
    return parseFrontendEnv(fsSync.readFileSync(path.join(__dirname, "..", "frontend", ".env"), "utf8"));
  } catch {
    return {};
  }
}

function parseMusicFileName(fileName) {
  const baseName = path.basename(fileName, path.extname(fileName));
  const separatorIndex = baseName.lastIndexOf("-");
  if (separatorIndex <= 0 || separatorIndex >= baseName.length - 1) {
    return { title: baseName, artist: "未知歌手" };
  }
  return {
    title: baseName.slice(0, separatorIndex).trim() || baseName,
    artist: baseName.slice(separatorIndex + 1).trim() || "未知歌手",
  };
}

async function readMusicLibrary() {
  const musicDir = path.join(__dirname, "..", "frontend", "assets", "music");
  const entries = await fs.readdir(musicDir, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && entry.name.toLowerCase().endsWith(".mp3"))
    .map((entry) => {
      const meta = parseMusicFileName(entry.name);
      return {
        ...meta,
        fileName: entry.name,
        src: `./assets/music/${entry.name}`,
        moods: ["focused", "relaxed", "distracted", "tired", "anxious", "confused"],
      };
    })
    .sort((a, b) => a.title.localeCompare(b.title, "zh-CN"));
}

ipcMain.handle("app:get-info", () => ({
  name: app.getName(),
  version: app.getVersion(),
  platform: process.platform,
}));

ipcMain.handle("app:get-frontend-env", () => readFrontendEnv());

ipcMain.handle("app:get-music-library", async () => readMusicLibrary());

ipcMain.on("app:renderer-log", (event, scope, payload) => {
  const timestamp = new Date().toLocaleString("zh-CN", { hour12: false });
  console.log(`[${timestamp}] [${scope || "renderer"}]`, payload || "");
});

ipcMain.handle("study-timer:get", () => {
  return getStudyTimerSnapshot();
});

ipcMain.handle("dialog:open-course-file", async (event) => {
  const owner = BrowserWindow.fromWebContents(event.sender);
  const result = await dialog.showOpenDialog(owner, {
    title: "导入课程资料",
    properties: ["openFile", "multiSelections"],
    filters: [
      { name: "课程资料", extensions: ["pdf", "md"] },
      { name: "PDF", extensions: ["pdf"] },
      { name: "Markdown", extensions: ["md"] },
    ],
  });

  if (result.canceled || result.filePaths.length === 0) {
    return null;
  }

  return Promise.all(result.filePaths.map((filePath) => readCourseFile(filePath)));
});

ipcMain.handle("file:read-course-file", async (event, filePath) => {
  return readCourseFile(filePath);
});

ipcMain.handle("dialog:save-file", async (event, options) => {
  const owner = BrowserWindow.fromWebContents(event.sender);
  const result = await dialog.showSaveDialog(owner, {
    title: options.title || "保存文件",
    defaultPath: options.defaultPath,
    filters: options.filters || [{ name: "All Files", extensions: ["*"] }],
  });

  if (result.canceled || !result.filePath) {
    return null;
  }

  const content =
    options.encoding === "base64"
      ? Buffer.from(options.data, "base64")
      : options.data;

  await fs.writeFile(result.filePath, content, options.encoding === "base64" ? undefined : "utf8");

  return {
    path: result.filePath,
    name: path.basename(result.filePath),
  };
});

ipcMain.handle("file:save-markdown", async (event, options) => {
  const filePath = options.path;

  if (path.extname(filePath).toLowerCase() !== ".md") {
    throw new Error("只允许保存 Markdown 文件。");
  }

  await fs.writeFile(filePath, options.data || "", "utf8");

  return {
    path: filePath,
    name: path.basename(filePath),
  };
});

ipcMain.handle("b:ai:get-status", () => {
  return getQwenStatus();
});

ipcMain.handle("b:ai:save-api-key", async (event, apiKey) => {
  return saveQwenApiKey(apiKey);
});

ipcMain.handle("b:ai:clear-api-key", () => {
  return clearQwenApiKey();
});

ipcMain.handle("b:ai:ask-question", async (event, request) => {
  return createCurrentStudyAiService().askCourseQuestion(request);
});

ipcMain.handle("b:ai:ask-music-recommendation", async (event, request) => {
  return createMusicRecommendationAiService().askCourseQuestion(request);
});

ipcMain.handle("b:ai:summarize-documents", async (event, request) => {
  return createCurrentStudyAiService().summarizeDocuments(request);
});

ipcMain.handle("b:ai:ask-coding", async (event, request) => {
  return askCodingAssistant(request);
});

ipcMain.handle("companion:ask-longlong", async (event, request) => {
  return askLonglongCompanion(request);
});

ipcMain.handle("longlong-chat:get", () => {
  return getLonglongMemorySnapshot();
});

ipcMain.handle("longlong-chat:clear", () => {
  return clearLonglongChatHistory();
});

ipcMain.handle("longlong-memory:add", (event, text) => {
  const entry = upsertLonglongMemory(text, "system");
  return {
    entry,
    snapshot: getLonglongMemorySnapshot(),
  };
});

ipcMain.handle("longlong-memory:delete", (event, memoryId) => {
  return deleteLonglongMemory(memoryId);
});

ipcMain.handle("longlong-bond:get", () => {
  return getLonglongBondSnapshot();
});

ipcMain.handle("longlong-bond:add-affection", (event, request = {}) => {
  return addLonglongAffection(request.amount, String(request.reason || ""));
});

ipcMain.handle("longlong-bond:claim-study-coins", (event, request = {}) => {
  return claimLonglongStudyCoins(request);
});

ipcMain.handle("longlong-bond:buy-gift", (event, giftId) => {
  return buyLonglongGift(giftId);
});

ipcMain.handle("companion:set-mode", (event, mode) => {
  resizeCompanionWindowForMode(mode);
  return { mode: companionMode, bounds: companionWindow?.getBounds() || null };
});

ipcMain.handle("companion:get-bounds", () => {
  return companionWindow && !companionWindow.isDestroyed() ? companionWindow.getBounds() : null;
});

ipcMain.on("companion:move-to", (event, bounds) => {
  moveCompanionWindowTo(bounds);
});

ipcMain.handle("b:ai:extract-pdf-text", async (event, payload) => {
  const base64 = getBase64Payload(payload);

  if (!base64) {
    throw new Error("PDF text extraction requires base64 PDF data.");
  }

  return extractPdfTextFromBase64(base64, getPdfExtractionOptions(payload));
});

ipcMain.handle("b:ai:recognize-image-text", async (event, payload) => {
  const base64 = getBase64Payload(payload);

  if (!base64) {
    throw new Error("OCR requires base64 image data.");
  }

  return recognizeImageTextFromBase64(base64, getOcrOptions(payload));
});

ipcMain.handle("b:ai:transcribe-audio", async (event, payload) => {
  const options = getAudioTranscriptionOptions(payload);

  if (!options.base64) {
    throw new Error("Voice recognition requires base64 audio data.");
  }

  return createCurrentQwenClient().transcribeAudio(options);
});

ipcMain.handle("b:rag:ask-library", async (event, request = {}) => {
  const requestId = String(request?.requestId || "").trim();
  const controller = requestId ? new AbortController() : null;

  if (requestId) {
    ragAbortControllers.get(requestId)?.abort();
    ragAbortControllers.set(requestId, controller);
  }

  try {
    return await answerRagLibrary({
      ...request,
      signal: controller?.signal,
      options: {
        ...(request?.options || {}),
        signal: controller?.signal,
      },
    });
  } catch (error) {
    if (controller?.signal.aborted) {
      throw new Error("RAG request was canceled.");
    }
    throw error;
  } finally {
    if (requestId && ragAbortControllers.get(requestId) === controller) {
      ragAbortControllers.delete(requestId);
    }
  }
});

ipcMain.handle("b:rag:cancel-ask", async (event, requestId) => {
  const id = String(requestId || "").trim();
  const controller = id ? ragAbortControllers.get(id) : null;

  if (!controller) {
    return { canceled: false };
  }

  controller.abort();
  return { canceled: true };
});

ipcMain.handle("graph:get-status", async () => {
  const config = getNeo4jRuntimeConfig();
  try {
    const status = await createCurrentKnowledgeGraphService().getStatus();
    return {
      ...status,
      source: config.source,
    };
  } catch (error) {
    return {
      connected: false,
      uri: config.uri,
      browserUrl: config.browserUrl,
      username: config.username,
      source: config.source,
      error: error.message || String(error),
    };
  }
});

ipcMain.handle("graph:save-config", async (event, config = {}) => {
  writeNeo4jLocalConfig({
    uri: String(config.uri || "").trim(),
    browserUrl: String(config.browserUrl || "").trim(),
    username: String(config.username || "").trim(),
    password: String(config.password || "").trim(),
  });
  currentKnowledgeGraphService?.close?.().catch(() => {});
  currentKnowledgeGraphService = null;
  currentKnowledgeGraphConfigKey = "";
  return createCurrentKnowledgeGraphService().getStatus();
});

ipcMain.handle("graph:generate-from-documents", async (event, request = {}) => {
  return createCurrentKnowledgeGraphService().generateFromDocuments(request);
});

ipcMain.handle("graph:save-course-graph", async (event, request = {}) => {
  return createCurrentKnowledgeGraphService().saveCourseGraph(request);
});

ipcMain.handle("graph:get-course-graph", async (event, request = {}) => {
  return createCurrentKnowledgeGraphService().getCourseGraph(request);
});

ipcMain.handle("graph:get-node-neighborhood", async (event, request = {}) => {
  return createCurrentKnowledgeGraphService().getNodeNeighborhood(request);
});

ipcMain.handle("graph:search-nodes", async (event, request = {}) => {
  return createCurrentKnowledgeGraphService().searchNodes(request);
});

ipcMain.handle("graph:find-path", async (event, request = {}) => {
  return createCurrentKnowledgeGraphService().findPath(request);
});

ipcMain.handle("graph:clear-course-graph", async (event, request = {}) => {
  return createCurrentKnowledgeGraphService().clearCourseGraph(request);
});

ipcMain.on("companion:wake-main", () => {
  wakeMainWindow();
});

ipcMain.on("companion:hide", () => {
  hideCompanionWindow({ destroy: true });
});

ipcMain.on("companion:update-snapshot", (event, snapshot) => {
  companionSnapshot = {
    mood: String(snapshot?.mood || "陪你学习中").slice(0, 40),
    reminder: String(snapshot?.reminder || "点我回到 MindStudy").slice(0, 80),
    music: String(snapshot?.music || "白噪音 + 轻钢琴").slice(0, 40),
    studyTime: String(snapshot?.studyTime || "").slice(0, 16),
    studySeconds: Math.max(0, Math.floor(Number(snapshot?.studySeconds) || 0)),
  };

  if (companionWindow && !companionWindow.isDestroyed()) {
    companionWindow.webContents.send("companion:snapshot", companionSnapshot);
  }
});

app.whenReady().then(() => {
  configurePermissions();
  buildMenu();
  startStudyTimer();
  createMainWindow();
  createCompanionWindow();

  app.on("activate", () => {
    if (!mainWindow || mainWindow.isDestroyed()) {
      createMainWindow();
    } else {
      wakeMainWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("before-quit", () => {
  currentKnowledgeGraphService?.close?.().catch(() => {});
  if (studyTimerInterval) {
    clearInterval(studyTimerInterval);
    studyTimerInterval = null;
  }
  persistStudyTimerState();
  void terminateOcrWorkers();
});
