const { app, BrowserWindow, dialog, ipcMain, Menu, session, shell } = require("electron");
const fs = require("node:fs/promises");
const fsSync = require("node:fs");
const path = require("node:path");
const {
  DEFAULT_BASE_URL,
  DEFAULT_MODEL,
  createStudyAiService,
  extractPdfTextFromBase64,
} = require("../b_deepseek_module");

const isWindows = process.platform === "win32";
const maxImportBytes = 80 * 1024 * 1024;
const supportedExtensions = new Set([".pdf", ".md"]);

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
  const mainWindow = new BrowserWindow({
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
    },
  });

  mainWindow.loadFile(path.join(__dirname, "..", "frontend", "index.html"));

  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  return mainWindow;
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

ipcMain.handle("b:ai:extract-pdf-text", async (event, payload) => {
  const base64 = getBase64Payload(payload);

  if (!base64) {
    throw new Error("PDF text extraction requires base64 PDF data.");
  }

  return extractPdfTextFromBase64(base64, getPdfExtractionOptions(payload));
});

app.whenReady().then(() => {
  configurePermissions();
  buildMenu();
  createMainWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
