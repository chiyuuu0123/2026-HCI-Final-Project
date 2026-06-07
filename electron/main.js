const { app, BrowserWindow, desktopCapturer, dialog, ipcMain, Menu, screen, session, shell } = require("electron");
const fs = require("node:fs/promises");
const fsSync = require("node:fs");
const path = require("node:path");
const {
  DEFAULT_BASE_URL,
  DEFAULT_MODEL,
  DeepSeekClient,
  createStudyAiService,
  extractPdfTextFromBase64,
  recognizeImageTextFromBase64,
  terminateOcrWorkers,
} = require("../b_deepseek_module");

const isWindows = process.platform === "win32";
const maxImportBytes = 80 * 1024 * 1024;
const supportedExtensions = new Set([".pdf", ".md"]);
const companionPetSize = { width: 248, height: 312 };
const companionChatSize = { width: 440, height: 568 };
let mainWindow = null;
let companionWindow = null;
let companionSnapshot = null;
let companionShouldShow = false;
let companionMode = "pet";
let lastMainWindowBounds = null;
let companionCustomBounds = null;
let studyTimerState = null;
let studyTimerInterval = null;
let studyTimerLastSaveAt = 0;

function getDeepSeekConfigPath() {
  return path.join(app.getPath("userData"), "deepseek-config.json");
}

function readDeepSeekLocalConfig() {
  try {
    return JSON.parse(fsSync.readFileSync(getDeepSeekConfigPath(), "utf8"));
  } catch {
    return {};
  }
}

function writeDeepSeekLocalConfig(config) {
  const configPath = getDeepSeekConfigPath();
  fsSync.mkdirSync(path.dirname(configPath), { recursive: true });
  fsSync.writeFileSync(configPath, JSON.stringify(config, null, 2), "utf8");
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

function getDeepSeekRuntimeConfig() {
  const localConfig = readDeepSeekLocalConfig();
  const envApiKey = process.env.DEEPSEEK_API_KEY || "";
  const localApiKey = typeof localConfig.apiKey === "string" ? localConfig.apiKey : "";

  return {
    apiKey: envApiKey || localApiKey,
    baseUrl: process.env.DEEPSEEK_BASE_URL || localConfig.baseUrl || DEFAULT_BASE_URL,
    model: process.env.DEEPSEEK_MODEL || localConfig.model || DEFAULT_MODEL,
    source: envApiKey ? "environment" : localApiKey ? "app-settings" : "missing",
  };
}

function getDeepSeekStatus() {
  const config = getDeepSeekRuntimeConfig();

  return {
    configured: Boolean(config.apiKey),
    baseUrl: config.baseUrl,
    model: config.model,
    source: config.source,
  };
}

function createCurrentStudyAiService() {
  const config = getDeepSeekRuntimeConfig();

  return createStudyAiService({
    clientOptions: {
      apiKey: config.apiKey,
      baseUrl: config.baseUrl,
      model: config.model,
    },
  });
}

function createCurrentDeepSeekClient() {
  const config = getDeepSeekRuntimeConfig();

  return new DeepSeekClient({
    apiKey: config.apiKey,
    baseUrl: config.baseUrl,
    model: config.model,
  });
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
  const response = await createCurrentDeepSeekClient().chat({
    messages,
    temperature: options.temperature != null ? options.temperature : 0.18,
    maxTokens: options.maxTokens != null ? options.maxTokens : 2200,
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

async function extractScreenTextForLonglong(screenCapture) {
  const base64 = getBase64Payload(screenCapture);

  if (!base64) {
    throw new Error("屏幕截图没有可识别的图像数据。");
  }

  return recognizeImageTextFromBase64(base64, {
    languages: ["eng", "chi_sim"],
    textLimit: 8000,
    cachePath: path.join(app.getPath("userData"), "ocr-cache"),
  });
}

function normalizeLonglongChatHistory(history = []) {
  return (Array.isArray(history) ? history : [])
    .filter((message) => message && ["user", "assistant"].includes(message.role))
    .slice(-8)
    .map((message) => ({
      role: message.role,
      content: String(message.content || "").slice(0, 2000),
    }))
    .filter((message) => message.content.trim());
}

function buildLonglongChatMessages(request = {}, screenContext = null, screenError = "") {
  const message = String(request.message || request.question || "").trim().slice(0, 8000);
  const history = normalizeLonglongChatHistory(request.history);

  if (!message) {
    throw new Error("请先告诉龙龙你想聊什么。");
  }

  const system = [
    "你是 MindStudy 的桌宠 AI 助手龙龙。",
    "你必须自然自称“龙龙”，像一直陪在用户身边的学习搭子一样说话，亲和、简洁、有行动建议。",
    "如果用户的问题和屏幕内容相关，请优先根据本机 OCR 提取出的屏幕文字回答；看不清或无法判断时要坦诚说明。",
    "不要声称你读取了用户没有提供的文件、后台窗口或隐私内容。",
    "请使用中文 Markdown 排版，标题和列表要清晰，回答不要过长。",
  ].join(" ");
  const extractedText = String(screenContext?.text || "").trim();
  const screenText = extractedText
    ? [
        "当前屏幕截图已经在本机通过 OCR 转成文字。请只根据下面能识别到的屏幕文字和用户问题回答。",
        "如果 OCR 文本明显残缺、错字较多或缺少关键信息，请提醒用户截图文字不完整。",
        "",
        "屏幕 OCR 文字：",
        extractedText,
      ].join("\n")
    : screenContext?.captured
      ? `这次已捕获屏幕，但 OCR 没有提取到可靠文字${screenContext.ocrError ? `，原因：${screenContext.ocrError}` : ""}。请基于用户文字继续帮助，并说明龙龙暂时看不清屏幕细节。`
      : screenError
        ? `这次没有成功读取屏幕，原因：${screenError}。请基于用户文字继续帮助，并说明龙龙暂时看不到屏幕细节。`
        : "这次没有读取屏幕内容，请基于用户文字回答。";
  const userText = [
    screenText,
    "",
    `用户对龙龙说：${message}`,
  ].join("\n");

  return [
    { role: "system", content: system },
    ...history,
    { role: "user", content: userText },
  ];
}

async function askLonglongCompanion(request = {}) {
  const options = request.options || {};
  const includeScreen = request.includeScreen !== false;
  const client = createCurrentDeepSeekClient();
  let screenCapture = null;
  let screenContext = null;
  let screenError = "";

  if (includeScreen) {
    try {
      screenCapture = await captureCurrentScreenForLonglong();
      try {
        const ocr = await extractScreenTextForLonglong(screenCapture);
        screenContext = {
          captured: true,
          capturedAt: screenCapture.capturedAt,
          display: screenCapture.display,
          text: String(ocr.text || "").slice(0, 8000),
          confidence: ocr.confidence,
          language: ocr.language,
          warning: ocr.warning,
        };
      } catch (error) {
        screenContext = {
          captured: true,
          capturedAt: screenCapture.capturedAt,
          display: screenCapture.display,
          text: "",
          ocrError: error.message || String(error),
        };
      }
    } catch (error) {
      screenError = error.message || String(error);
    }
  }

  const response = await client.chat({
    messages: buildLonglongChatMessages(request, screenContext, screenError),
    temperature: options.temperature != null ? options.temperature : 0.28,
    maxTokens: options.maxTokens != null ? options.maxTokens : 1200,
    model: options.model,
  });

  return {
    answer: response.content,
    model: response.model,
    usage: response.usage,
    screen: screenContext
      ? {
          captured: true,
          ocrUsed: true,
          textExtracted: Boolean(screenContext.text),
          textLength: String(screenContext.text || "").length,
          confidence: screenContext.confidence,
          language: screenContext.language,
          capturedAt: screenContext.capturedAt,
          display: screenContext.display,
          error: screenContext.ocrError || screenContext.warning || "",
        }
      : { captured: false, ocrUsed: false, textExtracted: false, error: screenError },
  };
}

function saveDeepSeekApiKey(apiKey) {
  const nextApiKey = String(apiKey || "").trim();

  if (!nextApiKey) {
    throw new Error("DeepSeek API key cannot be empty.");
  }

  const localConfig = readDeepSeekLocalConfig();
  writeDeepSeekLocalConfig({
    ...localConfig,
    apiKey: nextApiKey,
    updatedAt: Date.now(),
  });

  return getDeepSeekStatus();
}

function clearDeepSeekApiKey() {
  const localConfig = readDeepSeekLocalConfig();
  delete localConfig.apiKey;
  localConfig.updatedAt = Date.now();
  writeDeepSeekLocalConfig(localConfig);
  return getDeepSeekStatus();
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

function collectWebSearchResults(data, maxResults) {
  const results = [];

  function addResult(title, snippet, url) {
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

  addResult(data?.Heading, data?.AbstractText, data?.AbstractURL);

  function visitTopics(topics) {
    for (const topic of topics || []) {
      if (results.length >= maxResults) return;

      if (Array.isArray(topic.Topics)) {
        visitTopics(topic.Topics);
        continue;
      }

      addResult(topic.Text, topic.Text, topic.FirstURL);
    }
  }

  visitTopics(data?.RelatedTopics);
  return results;
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
  const timeoutMs = Math.min(15000, Math.max(1500, Number(request.timeoutMs) || 8000));
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  const params = new URLSearchParams({
    q: query,
    format: "json",
    no_html: "1",
    skip_disambig: "1",
  });

  try {
    const response = await fetch(`https://api.duckduckgo.com/?${params.toString()}`, {
      signal: controller.signal,
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
    clearTimeout(timeout);
  }
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

  if (!question) {
    throw new Error("RAG library question cannot be empty.");
  }

  let webSearch = null;
  if (request.includeWeb) {
    try {
      webSearch = await searchWebKnowledge({
        query: question,
        maxResults: options.webResults || 4,
      });
    } catch (error) {
      webSearch = {
        query: question,
        provider: "duckduckgo-instant-answer",
        error: error.message || String(error),
        results: [],
      };
    }
  }

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
      maxContextChars: options.maxContextChars,
      maxTokens: options.maxTokens || 1100,
      temperature: options.temperature ?? 0.2,
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
  companionWindow.setBounds(companionCustomBounds, false);
}

function createCompanionWindow() {
  if (companionWindow && !companionWindow.isDestroyed()) return companionWindow;

  const bounds = getCompanionBounds();
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
      companionCustomBounds = clampCompanionBounds(companionWindow.getBounds());
    }
  });
  companionWindow.on("closed", () => {
    companionWindow = null;
  });

  return companionWindow;
}

function revealCompanionWindow() {
  if (!companionWindow || companionWindow.isDestroyed()) return;

  companionWindow.setBounds(getCompanionBounds(), false);
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

ipcMain.handle("app:get-info", () => ({
  name: app.getName(),
  version: app.getVersion(),
  platform: process.platform,
}));

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
  return getDeepSeekStatus();
});

ipcMain.handle("b:ai:save-api-key", async (event, apiKey) => {
  return saveDeepSeekApiKey(apiKey);
});

ipcMain.handle("b:ai:clear-api-key", () => {
  return clearDeepSeekApiKey();
});

ipcMain.handle("b:ai:ask-question", async (event, request) => {
  return createCurrentStudyAiService().askCourseQuestion(request);
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

ipcMain.handle("b:rag:ask-library", async (event, request) => {
  const question = String(request?.question || "").trim();
  const documents = Array.isArray(request?.documents) ? request.documents : [];
  return answerRagLibrary(request);
  const textChunks = documents.filter((documentMeta) => String(documentMeta.text || "").trim()).length;

  return {
    mode: "placeholder",
    answer:
      `龙龙已收到你的问题：${question || "未输入问题"}\n\n` +
      `RAG 向量库接口已预留。本次请求传入 ${documents.length} 份资料，其中 ${textChunks} 份已有可检索文本。` +
      "后续接入向量化和召回逻辑后，龙龙会优先用当前课程资料库回答。",
    sources: documents.slice(0, 4).map((documentMeta) => ({
      id: documentMeta.id,
      name: documentMeta.name,
      extension: documentMeta.extension,
    })),
  };
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
  if (studyTimerInterval) {
    clearInterval(studyTimerInterval);
    studyTimerInterval = null;
  }
  persistStudyTimerState();
  void terminateOcrWorkers();
});
