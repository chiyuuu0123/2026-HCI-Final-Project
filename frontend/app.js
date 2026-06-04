const STORAGE_KEY = "mindstudy.courseLibrary.v1";

const viewTitles = {
  dashboard: "学习工作台",
  reader: "资料阅读",
  map: "知识图谱",
  quiz: "自动测验",
  report: "学习报告",
  focus: "状态与音乐",
};

const nodeContent = {
  人机交互: "研究人与数字系统之间的输入、反馈、任务流程和体验质量，是本课程的中心主题。",
  可用性: "衡量系统是否易学、易用、有效率，并能让用户满意完成目标任务。",
  用户体验: "关注用户在使用产品前、中、后的整体感受，包括情绪、信任和流畅度。",
  评估方法: "用于判断交互系统是否易用、有效和令人满意。当前掌握度偏低，建议结合 SUS 量表和用户访谈一起复习。",
  "Fitts 定律": "用于描述目标大小、距离与指向操作时间之间的关系，常用于按钮和控件布局设计。",
  "SUS 量表": "一种快速评估系统可用性的问卷量表，适合在原型测试后收集主观反馈。",
  认知负荷: "表示用户理解、记忆和操作界面时承受的心理负担，过高会降低学习效率。",
  用户访谈: "通过与用户交流获取需求、痛点和真实使用感受，适合发现深层问题。",
  原型测试: "用低成本原型验证交互流程和视觉布局，帮助尽早发现设计问题。",
};

const title = document.querySelector("#view-title");
const navItems = document.querySelectorAll("[data-view]");
const panels = document.querySelectorAll("[data-view-panel]");
const readerPanels = {
  library: document.querySelector(".chapter-panel"),
  document: document.querySelector(".document-panel"),
  insight: document.querySelector(".insight-panel"),
};

const runtimeFiles = new Map();
const documentState = {
  current: null,
};
const supportedDocumentExtensions = new Set(["PDF", "MD"]);
const PDF_TEXT_LIMIT = 60000;
const PDF_PAGE_TEXT_LIMIT = 8000;
const PDF_AI_PAGE_TEXT_LIMIT = 5000;
const cameraState = {
  stream: null,
  sampleTimer: null,
  canvas: null,
  lastBrightness: 0,
};
const pdfInkState = {
  enabled: false,
  color: "#188f84",
  width: 4,
  currentStroke: null,
  pointerId: null,
};

let workspace = loadWorkspace();
let pdfJsLoadingPromise = null;
let pdfPageObserver = null;
let pdfLazyRenderObserver = null;
let pdfRenderToken = 0;
let pdfPageTextTimer = null;

function createId(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function createDefaultCourse() {
  return {
    id: createId("course"),
    name: "用户交互技术",
    description: "第 5 周资料复习中",
    documents: [],
    activeDocumentId: "",
    createdAt: Date.now(),
  };
}

function loadWorkspace() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (stored?.courses?.length) {
      return sanitizeWorkspace(stored);
    }
  } catch {
    localStorage.removeItem(STORAGE_KEY);
  }

  const course = createDefaultCourse();
  return {
    activeCourseId: course.id,
    courses: [course],
  };
}

function sanitizeWorkspace(nextWorkspace) {
  const courses = nextWorkspace.courses.map((course) => {
    const documents = (course.documents || []).filter((documentMeta) =>
      supportedDocumentExtensions.has(String(documentMeta.extension || "").toUpperCase()),
    );

    return {
      ...course,
      documents,
      activeDocumentId: documents.some((documentMeta) => documentMeta.id === course.activeDocumentId)
        ? course.activeDocumentId
        : documents[0]?.id || "",
    };
  });

  const activeCourseId = courses.some((course) => course.id === nextWorkspace.activeCourseId)
    ? nextWorkspace.activeCourseId
    : courses[0]?.id || "";

  return {
    ...nextWorkspace,
    activeCourseId,
    courses,
  };
}

function saveWorkspace() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(workspace));
}

function getActiveCourse() {
  return workspace.courses.find((course) => course.id === workspace.activeCourseId) || workspace.courses[0];
}

function getActiveDocumentMeta() {
  const course = getActiveCourse();
  return course?.documents.find((document) => document.id === course.activeDocumentId) || course?.documents[0] || null;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatBytes(bytes) {
  if (!Number.isFinite(bytes)) {
    return "未知大小";
  }

  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }

  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function getExtension(fileName) {
  return fileName.split(".").pop()?.toUpperCase() || "";
}

function getDocumentKind(extension) {
  const normalized = extension.toUpperCase();
  if (normalized === "PDF") return "pdf";
  if (normalized === "MD") return "md";
  return "unknown";
}

function getTypeLabel(extension) {
  const normalized = extension.toUpperCase();
  if (normalized === "MD") return "Markdown";
  return normalized || "FILE";
}

function base64ToUint8Array(base64) {
  const binary = window.atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

function base64ToText(base64) {
  return new TextDecoder("utf-8").decode(base64ToUint8Array(base64));
}

function bytesToDataUrl(bytes, mimeType) {
  return `data:${mimeType};base64,${uint8ArrayToBase64(bytes)}`;
}

function uint8ArrayToBase64(bytes) {
  let binary = "";
  const chunkSize = 0x8000;

  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize));
  }

  return window.btoa(binary);
}

function getMimeTypeFromName(fileName) {
  const extension = fileName.split(".").pop()?.toLowerCase();
  const mimeTypes = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    gif: "image/gif",
    webp: "image/webp",
    svg: "image/svg+xml",
  };

  return mimeTypes[extension] || "application/octet-stream";
}

async function dataUrlToArrayBuffer(dataUrl) {
  const response = await fetch(dataUrl);
  return response.arrayBuffer();
}

async function loadPdfJs() {
  if (!pdfJsLoadingPromise) {
    pdfJsLoadingPromise = import("./vendor/pdf.min.js").then((pdfjsLib) => {
      pdfjsLib.GlobalWorkerOptions.workerSrc = new URL("./vendor/pdf.worker.min.js", window.location.href).toString();
      return pdfjsLib;
    });
  }

  return pdfJsLoadingPromise;
}

function normalizeExtractedPdfText(text) {
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

  const textItems = textContent.items
    .map((item) => ({
      text: item.str?.trim() || "",
      x: Math.round(item.transform?.[4] || 0),
      y: Math.round(item.transform?.[5] || 0),
    }))
    .filter((item) => item.text)
    .sort((a, b) => {
      if (Math.abs(a.y - b.y) > 4) return b.y - a.y;
      return a.x - b.x;
    });

  textItems.forEach((item) => {
    const y = item.y;

    if (currentY !== null && Math.abs(y - currentY) > 4) {
      rows.push(currentLine.join(" ").trim());
      currentLine = [];
    }

    currentY = y;
    currentLine.push(item.text);
  });

  if (currentLine.length) rows.push(currentLine.join(" ").trim());

  return normalizeExtractedPdfText(rows.filter(Boolean).join("\n"));
}

async function extractPdfTextFromBytes(bytes) {
  const pdfjsLib = await loadPdfJs();
  const pdf = await pdfjsLib.getDocument({ data: bytes.slice() }).promise;
  const pages = [];

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const textContent = await page.getTextContent();
    const pageText = extractTextFromPdfTextContent(textContent);
    pages.push({
      pageNumber,
      text: pageText.slice(0, PDF_PAGE_TEXT_LIMIT),
    });
  }

  const fullText = normalizeExtractedPdfText(
    pages
      .filter((page) => page.text)
      .map((page) => `第 ${page.pageNumber} 页\n${page.text}`)
      .join("\n\n"),
  );

  return {
    pageCount: pdf.numPages,
    pages,
    text: fullText.slice(0, PDF_TEXT_LIMIT),
    extractedAt: Date.now(),
  };
}

function downloadInBrowser(fileName, content, mimeType) {
  const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

async function saveTextFile(defaultPath, content) {
  if (window.mindStudy?.saveFile) {
    return window.mindStudy.saveFile({
      title: "保存学习笔记",
      defaultPath,
      data: content,
      encoding: "utf8",
      filters: [{ name: "Markdown", extensions: ["md"] }],
    });
  }

  downloadInBrowser(defaultPath, content, "text/markdown;charset=utf-8");
  return { name: defaultPath };
}

async function saveBinaryFile(defaultPath, bytes, filters) {
  if (window.mindStudy?.saveFile) {
    return window.mindStudy.saveFile({
      title: "保存编辑后的文件",
      defaultPath,
      data: uint8ArrayToBase64(bytes),
      encoding: "base64",
      filters,
    });
  }

  const mimeType = defaultPath.endsWith(".pdf")
    ? "application/pdf"
    : "application/vnd.openxmlformats-officedocument.presentationml.presentation";
  downloadInBrowser(defaultPath, new Blob([bytes], { type: mimeType }), mimeType);
  return { name: defaultPath };
}

function normalizeSelectedFiles(result) {
  if (!result) return [];
  return Array.isArray(result) ? result : [result];
}

function openBrowserFilePicker() {
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.multiple = true;
    input.accept = ".pdf,.md,application/pdf,text/markdown";

    input.addEventListener("change", () => {
      const files = Array.from(input.files || []);
      if (files.length === 0) {
        resolve([]);
        return;
      }

      Promise.all(
        files.map(
          (file) =>
            new Promise((fileResolve) => {
              const reader = new FileReader();
              reader.addEventListener("load", () => {
                const dataUrl = String(reader.result);
                fileResolve({
                  name: file.name,
                  extension: getExtension(file.name),
                  mimeType: file.type || "application/octet-stream",
                  size: file.size,
                  path: "",
                  updatedAt: file.lastModified,
                  dataUrl,
                  base64: dataUrl.split(",")[1],
                });
              });
              reader.readAsDataURL(file);
            }),
        ),
      ).then(resolve);
    });

    input.click();
  });
}

function openImageFilePicker() {
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/png,image/jpeg";

    input.addEventListener("change", () => {
      const file = input.files?.[0];
      if (!file) {
        resolve(null);
        return;
      }

      const reader = new FileReader();
      reader.addEventListener("load", () => {
        const dataUrl = String(reader.result);
        resolve({
          name: file.name,
          mimeType: file.type || getMimeTypeFromName(file.name),
          size: file.size,
          dataUrl,
          base64: dataUrl.split(",")[1],
        });
      });
      reader.readAsDataURL(file);
    });

    input.click();
  });
}

async function selectCourseFiles() {
  if (window.mindStudy?.selectCourseFile) {
    return normalizeSelectedFiles(await window.mindStudy.selectCourseFile());
  }

  return openBrowserFilePicker();
}

async function readStoredFile(meta) {
  if (runtimeFiles.has(meta.id)) {
    return runtimeFiles.get(meta.id);
  }

  if (meta.path && window.mindStudy?.readCourseFile) {
    const file = await window.mindStudy.readCourseFile(meta.path);
    runtimeFiles.set(meta.id, file);
    return file;
  }

  throw new Error("该资料只有本次会话的临时内容。请重新导入一次，或使用 Electron 桌面端保存本机路径。");
}

function getReaderFullscreenButtonMarkup() {
  return `
    <button class="mini-button" id="toggle-reader-fullscreen">
      <i data-lucide="maximize-2"></i>
      <span>全屏阅读</span>
    </button>
  `;
}

function syncFullscreenButton() {
  const readerLayout = document.querySelector(".reader-layout");
  const buttons = document.querySelectorAll("#toggle-reader-fullscreen");
  if (!buttons.length) return;

  const isReaderFullscreen =
    document.fullscreenElement?.classList.contains("reader-layout") ||
    readerLayout?.classList.contains("reader-fullscreen-fallback");
  buttons.forEach((button) => {
    button.innerHTML = isReaderFullscreen
    ? `<i data-lucide="minimize-2"></i><span>退出全屏</span>`
    : `<i data-lucide="maximize-2"></i><span>全屏阅读</span>`;
  });
  window.lucide?.createIcons();
}

function exitReaderFullscreenFallback() {
  const readerLayout = document.querySelector(".reader-layout");
  readerLayout?.classList.remove("reader-fullscreen-fallback");
  document.body.classList.remove("reader-fullscreen-lock");
  syncFullscreenButton();
}

function enterReaderFullscreenFallback(readerLayout) {
  readerLayout.classList.add("reader-fullscreen-fallback");
  document.body.classList.add("reader-fullscreen-lock");
  syncFullscreenButton();
}

async function toggleReaderFullscreen() {
  const readerLayout = document.querySelector(".reader-layout");
  if (!readerLayout) return;

  if (document.fullscreenElement) {
    await document.exitFullscreen();
    syncFullscreenButton();
    return;
  }

  if (readerLayout.classList.contains("reader-fullscreen-fallback")) {
    exitReaderFullscreenFallback();
    return;
  }

  try {
    if (!readerLayout.requestFullscreen) throw new Error("Fullscreen API unavailable");
    await readerLayout.requestFullscreen();
    syncFullscreenButton();
  } catch {
    enterReaderFullscreenFallback(readerLayout);
  }
}

function getCameraUi() {
  return {
    topButton: document.querySelector("#toggle-camera"),
    topText: document.querySelector("#camera-status-text"),
    video: document.querySelector("#camera-preview"),
    placeholder: document.querySelector("#camera-placeholder"),
    startButton: document.querySelector("#start-camera"),
    stopButton: document.querySelector("#stop-camera"),
    moodTitle: document.querySelector("#camera-mood-title"),
    modeBadge: document.querySelector("#camera-mode-badge"),
    focusScore: document.querySelector("#camera-focus-score"),
    focusLabel: document.querySelector("#camera-focus-label"),
    gestureTitle: document.querySelector("#gesture-status-title"),
  };
}

function setCameraStatus(status, detail = "") {
  const ui = getCameraUi();
  const isActive = status === "active";
  const labels = {
    idle: "摄像头未开启",
    pending: "请求摄像头中",
    active: "摄像头识别中",
    error: "摄像头不可用",
  };

  if (ui.topText) ui.topText.textContent = labels[status] || labels.idle;
  ui.topButton?.classList.toggle("active", isActive);
  if (ui.startButton) ui.startButton.disabled = isActive || status === "pending";
  if (ui.stopButton) ui.stopButton.disabled = !isActive;
  if (ui.placeholder) {
    ui.placeholder.classList.toggle("hidden", isActive);
    ui.placeholder.querySelector("span").textContent = detail || labels[status] || labels.idle;
  }
  if (ui.moodTitle) {
    ui.moodTitle.textContent = isActive ? "当前状态：摄像头识别中" : `当前状态：${detail || labels[status] || labels.idle}`;
  }
  if (ui.modeBadge) ui.modeBadge.textContent = isActive ? "实时识别" : status === "pending" ? "请求中" : "待开启";
  if (ui.gestureTitle) ui.gestureTitle.textContent = isActive ? "等待手势" : "等待摄像头";
}

function updateCameraMetrics(brightness) {
  const ui = getCameraUi();
  const normalized = Math.max(0, Math.min(100, Math.round((brightness / 255) * 100)));
  let score = 74;
  let label = "光线良好";
  let title = "当前状态：专注识别中";

  if (normalized < 22) {
    score = 56;
    label = "画面偏暗";
    title = "当前状态：光线偏暗";
  } else if (normalized > 82) {
    score = 66;
    label = "光线偏强";
    title = "当前状态：光线偏强";
  } else if (normalized > 55) {
    score = 82;
    label = "识别稳定";
  }

  if (ui.focusScore) ui.focusScore.textContent = String(score);
  if (ui.focusLabel) ui.focusLabel.textContent = label;
  if (ui.moodTitle) ui.moodTitle.textContent = title;
  if (ui.gestureTitle) ui.gestureTitle.textContent = "摄像头已开启，等待手势";
}

function sampleCameraFrame() {
  const ui = getCameraUi();
  const video = ui.video;
  if (!video || !cameraState.stream || video.readyState < 2) return;

  const canvas = cameraState.canvas || document.createElement("canvas");
  cameraState.canvas = canvas;
  canvas.width = 96;
  canvas.height = 54;
  const context = canvas.getContext("2d");
  context.drawImage(video, 0, 0, canvas.width, canvas.height);
  const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
  let total = 0;

  for (let index = 0; index < pixels.length; index += 4) {
    total += (pixels[index] + pixels[index + 1] + pixels[index + 2]) / 3;
  }

  const brightness = total / (pixels.length / 4);
  cameraState.lastBrightness = brightness;
  updateCameraMetrics(brightness);
}

async function startCamera() {
  if (cameraState.stream) return;

  const ui = getCameraUi();
  if (!navigator.mediaDevices?.getUserMedia) {
    setCameraStatus("error", "当前环境不支持摄像头");
    return;
  }

  try {
    setCameraStatus("pending");
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        facingMode: "user",
      },
    });

    cameraState.stream = stream;
    if (ui.video) {
      ui.video.srcObject = stream;
      await ui.video.play();
    }

    setCameraStatus("active");
    window.clearInterval(cameraState.sampleTimer);
    cameraState.sampleTimer = window.setInterval(sampleCameraFrame, 900);
    sampleCameraFrame();
  } catch (error) {
    stopCamera();
    setCameraStatus("error", error.name === "NotAllowedError" ? "摄像头权限被拒绝" : "无法打开摄像头");
  }
}

function stopCamera() {
  const ui = getCameraUi();

  window.clearInterval(cameraState.sampleTimer);
  cameraState.sampleTimer = null;
  cameraState.stream?.getTracks().forEach((track) => track.stop());
  cameraState.stream = null;

  if (ui.video) {
    ui.video.pause();
    ui.video.srcObject = null;
  }

  if (ui.focusScore) ui.focusScore.textContent = "--";
  if (ui.focusLabel) ui.focusLabel.textContent = "等待识别";
  setCameraStatus("idle");
}

function toggleCamera() {
  if (cameraState.stream) {
    stopCamera();
    return;
  }

  showView("focus");
  startCamera();
}

function getPdfTargetPage(doc) {
  const pageCount = Math.max(1, doc.pageCount || doc.meta.pageCount || 1);
  const input = document.querySelector("#pdf-target-page");
  const rawValue = Number(input?.value || doc.activePdfPage || 1);
  const pageNumber = Math.min(pageCount, Math.max(1, Number.isFinite(rawValue) ? rawValue : 1));
  doc.activePdfPage = pageNumber;
  doc.meta.activePdfPage = pageNumber;
  return pageNumber;
}

function updatePdfBytes(doc, bytes, pageCount, options = {}) {
  if (doc.blobUrl) URL.revokeObjectURL(doc.blobUrl);

  doc.bytes = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  doc.file = {
    ...doc.file,
    base64: uint8ArrayToBase64(doc.bytes),
    dataUrl: bytesToDataUrl(doc.bytes, "application/pdf"),
    size: doc.bytes.byteLength,
  };
  doc.blobUrl = URL.createObjectURL(new Blob([doc.bytes], { type: "application/pdf" }));
  doc.pageCount = pageCount;
  doc.meta.pageCount = pageCount;
  doc.meta.size = doc.bytes.byteLength;
  doc.meta.pdfEdited = true;
  doc.meta.pdfTextStale = !options.keepTextExtraction;
  doc.pdfjsDocument = null;
  if (!options.keepTextExtraction) {
    doc.pdfText = null;
    doc.meta.extractedText = "";
    doc.meta.extractedPages = [];
    doc.meta.extractedPageCount = 0;
    doc.meta.aiSourcesByPage = {};
    doc.meta.aiOutputsByPage = {};
    doc.meta.aiSource = "";
    doc.meta.aiOutput = "";
  }
  doc.activePdfPage = Math.min(doc.activePdfPage || 1, pageCount);
  runtimeFiles.set(doc.meta.id, doc.file);
  saveWorkspace();
}

async function applyPdfTextExtraction(doc, shouldRender = true) {
  if (!doc || doc.kind !== "pdf") return;

  try {
    setParseStatus("提取文字中", "working");
    const extracted = await extractPdfTextFromBytes(doc.bytes);
    const textPages = extracted.pages.filter((page) => page.text);
    const storedPages = [];
    let storedTextLength = 0;

    for (const page of textPages) {
      const text = page.text.slice(0, 1600);
      if (storedTextLength + text.length > PDF_TEXT_LIMIT) break;
      storedPages.push({
        pageNumber: page.pageNumber,
        text,
      });
      storedTextLength += text.length;
    }

    doc.pdfText = extracted;
    doc.pageCount = extracted.pageCount || doc.pageCount;
    doc.meta.pageCount = doc.pageCount;
    doc.meta.extractedText = extracted.text;
    doc.meta.extractedPages = storedPages;
    doc.meta.extractedPageCount = textPages.length;
    doc.meta.extractedAt = extracted.extractedAt;
    doc.meta.pdfExtractError = "";
    doc.meta.pdfTextStale = false;
    doc.meta.aiSourcesByPage = {};
    doc.meta.aiOutputsByPage = {};
    doc.meta.aiSource = getCurrentReadingText(doc);
    doc.meta.aiOutput = analyzeReadingText(doc.meta.aiSource);
    saveWorkspace();
    setParseStatus(textPages.length ? "文字已提取" : "未提取到文字", textPages.length ? "ready" : "working");
  } catch (error) {
    doc.meta.pdfExtractError = "PDF 文字提取失败，可能是扫描版或加密文档。可以手动复制文字到 AI 阅读窗口。";
    doc.meta.pdfTextStale = false;
    saveWorkspace();
    setParseStatus("文字提取失败", "working");
  }

  if (shouldRender) {
    renderPdfReader(doc);
  } else if (documentState.current?.meta?.id === doc.meta.id) {
    updatePdfAiReadingPanel(doc);
    syncPdfPageControls(doc);
  }
}

function hydrateStoredPdfText(doc) {
  if (!doc || doc.kind !== "pdf" || !doc.meta.extractedText || doc.meta.pdfTextStale) return false;

  doc.pdfText = {
    pageCount: doc.meta.pageCount || doc.pageCount || 1,
    pages: doc.meta.extractedPages || [],
    text: doc.meta.extractedText,
    extractedAt: doc.meta.extractedAt || Date.now(),
  };

  const pageKey = getPdfPageKey(doc);
  const currentPageText = getPdfPageText(doc, Number(pageKey)).slice(0, 5000);

  if (currentPageText && !doc.meta.aiSourcesByPage?.[pageKey]) {
    doc.meta.aiSourcesByPage = doc.meta.aiSourcesByPage || {};
    doc.meta.aiOutputsByPage = doc.meta.aiOutputsByPage || {};
    doc.meta.aiSourcesByPage[pageKey] = currentPageText;
    doc.meta.aiOutputsByPage[pageKey] = analyzeReadingText(currentPageText);
    doc.meta.aiSource = currentPageText;
    doc.meta.aiOutput = analyzeReadingText(doc.meta.aiSource);
    saveWorkspace();
  }

  return true;
}

function upsertPdfExtractedPage(doc, pageNumber, text) {
  const nextPage = {
    pageNumber,
    text: text.slice(0, PDF_PAGE_TEXT_LIMIT),
  };
  const pages = Array.isArray(doc.meta.extractedPages) ? [...doc.meta.extractedPages] : [];
  const index = pages.findIndex((page) => Number(page.pageNumber) === Number(pageNumber));

  if (index >= 0) {
    pages[index] = nextPage;
  } else {
    pages.push(nextPage);
  }

  pages.sort((a, b) => Number(a.pageNumber) - Number(b.pageNumber));
  doc.meta.extractedPages = pages;
  doc.meta.extractedPageCount = pages.filter((page) => page.text).length;
  doc.meta.extractedText = normalizeExtractedPdfText(
    pages
      .filter((page) => page.text)
      .map((page) => `第 ${page.pageNumber} 页\n${page.text}`)
      .join("\n\n"),
  ).slice(0, PDF_TEXT_LIMIT);
  doc.meta.extractedAt = Date.now();
  doc.meta.pdfExtractError = "";
  doc.meta.pdfTextStale = false;
  doc.pdfText = {
    pageCount: doc.pageCount || doc.meta.pageCount || 1,
    pages,
    text: doc.meta.extractedText,
    extractedAt: doc.meta.extractedAt,
  };
}

async function getPdfRuntimeDocument(doc) {
  if (doc.pdfjsDocument) return doc.pdfjsDocument;

  const pdfjsLib = await loadPdfJs();
  doc.pdfjsDocument = await pdfjsLib.getDocument({ data: doc.bytes.slice() }).promise;
  doc.pageCount = doc.pdfjsDocument.numPages || doc.pageCount || doc.meta.pageCount || 1;
  doc.meta.pageCount = doc.pageCount;
  return doc.pdfjsDocument;
}

async function extractCurrentPdfPageText(doc, options = {}) {
  if (!doc || doc.kind !== "pdf") return "";

  const pageNumber = Math.min(doc.pageCount || doc.meta.pageCount || 1, Math.max(1, Number(options.pageNumber || doc.activePdfPage || 1)));
  const pageKey = String(pageNumber);
  const hasCachedPage = Boolean(getPdfPageText(doc, pageNumber));

  if (hasCachedPage && !options.force) {
    updatePdfAiReadingPanel(doc);
    return getPdfPageText(doc, pageNumber);
  }

  try {
    setParseStatus("提取当前页文字", "working");
    const pdf = await getPdfRuntimeDocument(doc);
    const page = await pdf.getPage(pageNumber);
    const textContent = await page.getTextContent();
    const pageText = extractTextFromPdfTextContent(textContent);

    upsertPdfExtractedPage(doc, pageNumber, pageText);
    doc.meta.aiSourcesByPage = doc.meta.aiSourcesByPage || {};
    doc.meta.aiOutputsByPage = doc.meta.aiOutputsByPage || {};

    if (!Object.hasOwn(doc.meta.aiSourcesByPage, pageKey) || options.force) {
      doc.meta.aiSourcesByPage[pageKey] = pageText.slice(0, PDF_AI_PAGE_TEXT_LIMIT);
      doc.meta.aiOutputsByPage[pageKey] = analyzeReadingText(doc.meta.aiSourcesByPage[pageKey]);
    }

    doc.meta.aiSource = doc.meta.aiSourcesByPage[pageKey] || "";
    doc.meta.aiOutput = doc.meta.aiOutputsByPage[pageKey] || "";
    saveWorkspace();

    if (documentState.current?.meta?.id === doc.meta.id && getActivePdfPageNumber(doc) === pageNumber) {
      updatePdfAiReadingPanel(doc);
    }

    setParseStatus(pageText ? "当前页文字已提取" : "当前页无可选文字", pageText ? "ready" : "working");
    return pageText;
  } catch (error) {
    doc.meta.pdfExtractError = "当前页文字提取失败，可能是扫描版或加密文档。";
    saveWorkspace();
    updatePdfAiReadingPanel(doc);
    setParseStatus("当前页文字提取失败", "working");
    return "";
  }
}

function schedulePdfPageTextExtraction(doc, pageNumber = getActivePdfPageNumber(doc), delay = 180) {
  window.clearTimeout(pdfPageTextTimer);
  pdfPageTextTimer = window.setTimeout(() => {
    if (documentState.current?.meta?.id === doc?.meta?.id) {
      extractCurrentPdfPageText(doc, { pageNumber });
    }
  }, delay);
}

function getActivePdfPageNumber(doc) {
  const pageCount = Math.max(1, doc?.pageCount || doc?.meta?.pageCount || 1);
  const pageNumber = Math.min(pageCount, Math.max(1, Number(doc?.activePdfPage || doc?.meta?.activePdfPage || 1)));
  if (doc) {
    doc.activePdfPage = pageNumber;
    doc.meta.activePdfPage = pageNumber;
  }
  return pageNumber;
}

function getPdfPageText(doc, pageNumber = getActivePdfPageNumber(doc)) {
  const pages = doc?.pdfText?.pages?.length ? doc.pdfText.pages : doc?.meta?.extractedPages || [];
  const page = pages.find((item) => Number(item.pageNumber) === Number(pageNumber));
  return page?.text || "";
}

function getPdfPageKey(doc) {
  return String(getActivePdfPageNumber(doc));
}

function getPdfAiSource(doc) {
  const pageKey = getPdfPageKey(doc);
  const pageSource = doc.meta.aiSourcesByPage?.[pageKey];

  if (Object.hasOwn(doc.meta.aiSourcesByPage || {}, pageKey)) return pageSource;

  return getPdfPageText(doc, Number(pageKey)) || "";
}

function getPdfAiOutput(doc, sourceText) {
  const pageKey = getPdfPageKey(doc);
  if (Object.hasOwn(doc.meta.aiOutputsByPage || {}, pageKey)) {
    return doc.meta.aiOutputsByPage[pageKey];
  }

  return analyzeReadingText(sourceText);
}

function rememberCurrentAiReading() {
  const doc = documentState.current;
  const sourceInput = document.querySelector("#ai-reading-source");
  const output = document.querySelector("#ai-reading-output");
  if (!doc || !sourceInput) return;

  if (doc.kind === "pdf") {
    const pageKey = getPdfPageKey(doc);
    doc.meta.aiSourcesByPage = doc.meta.aiSourcesByPage || {};
    doc.meta.aiSourcesByPage[pageKey] = sourceInput.value;
    doc.meta.aiSource = sourceInput.value;
    if (output?.textContent) {
      doc.meta.aiOutputsByPage = doc.meta.aiOutputsByPage || {};
      doc.meta.aiOutputsByPage[pageKey] = output.textContent;
      doc.meta.aiOutput = output.textContent;
    }
    saveWorkspace();
  }
}

function getPdfInkStrokes(doc) {
  doc.meta.inkStrokes = Array.isArray(doc.meta.inkStrokes) ? doc.meta.inkStrokes : [];
  return doc.meta.inkStrokes;
}

function getCanvasPoint(event, canvas) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width)),
    y: Math.min(1, Math.max(0, (event.clientY - rect.top) / rect.height)),
  };
}

function drawPdfInkStroke(context, canvas, stroke) {
  if (!stroke.points?.length) return;

  context.save();
  context.lineCap = "round";
  context.lineJoin = "round";
  context.strokeStyle = stroke.color || pdfInkState.color;
  context.lineWidth = Math.max(2, (stroke.widthRatio || 0.006) * canvas.width);
  context.beginPath();
  stroke.points.forEach((point, index) => {
    const x = point.x * canvas.width;
    const y = point.y * canvas.height;
    if (index === 0) {
      context.moveTo(x, y);
    } else {
      context.lineTo(x, y);
    }
  });

  if (stroke.points.length === 1) {
    const point = stroke.points[0];
    const radius = context.lineWidth / 2;
    context.moveTo(point.x * canvas.width + radius, point.y * canvas.height);
    context.arc(point.x * canvas.width, point.y * canvas.height, radius, 0, Math.PI * 2);
  }

  context.stroke();
  context.restore();
}

function drawPdfInkLayer(pageShell, doc) {
  const canvas = pageShell.querySelector(".pdf-ink-layer");
  if (!canvas || !doc) return;

  const context = canvas.getContext("2d");
  context.clearRect(0, 0, canvas.width, canvas.height);
  getPdfInkStrokes(doc)
    .filter((stroke) => Number(stroke.pageNumber) === Number(pageShell.dataset.pageNumber))
    .forEach((stroke) => drawPdfInkStroke(context, canvas, stroke));
}

function redrawPdfInkPage(pageNumber) {
  const doc = documentState.current;
  const pageShell = document.querySelector(`.pdf-rendered-page[data-page-number="${pageNumber}"]`);
  if (!doc || !pageShell) return;
  drawPdfInkLayer(pageShell, doc);
}

function redrawAllPdfInkLayers(doc = documentState.current) {
  if (!doc || doc.kind !== "pdf") return;
  document.querySelectorAll(".pdf-rendered-page").forEach((pageShell) => drawPdfInkLayer(pageShell, doc));
}

function syncPdfInkUi(doc = documentState.current) {
  const viewer = document.querySelector("#pdf-viewer");
  viewer?.classList.toggle("ink-active", pdfInkState.enabled);
  document.querySelectorAll("#toggle-pdf-ink").forEach((button) => {
    button.classList.toggle("active", pdfInkState.enabled);
    button.setAttribute("aria-pressed", String(pdfInkState.enabled));
  });

  const colorInput = document.querySelector("#pdf-ink-color");
  const widthInput = document.querySelector("#pdf-ink-width");
  const widthValue = document.querySelector("#pdf-ink-width-value");
  const strokeCount = getPdfInkStrokes(doc || { meta: {} }).length;
  const countLabel = document.querySelector("#pdf-ink-count");

  if (colorInput) colorInput.value = pdfInkState.color;
  if (widthInput) widthInput.value = String(pdfInkState.width);
  if (widthValue) widthValue.textContent = `${pdfInkState.width}px`;
  if (countLabel) countLabel.textContent = strokeCount ? `${strokeCount} 笔待写入` : "暂无画笔批注";
}

function beginPdfInkStroke(event) {
  const doc = documentState.current;
  const canvas = event.target.closest(".pdf-ink-layer");
  if (!doc || doc.kind !== "pdf" || !canvas || !pdfInkState.enabled) return;

  event.preventDefault();
  const pageShell = canvas.closest(".pdf-rendered-page");
  const point = getCanvasPoint(event, canvas);
  pdfInkState.currentStroke = {
    id: createId("ink"),
    pageNumber: Number(pageShell.dataset.pageNumber),
    color: pdfInkState.color,
    widthRatio: pdfInkState.width / Math.max(1, canvas.getBoundingClientRect().width),
    points: [point],
    createdAt: Date.now(),
  };
  pdfInkState.pointerId = event.pointerId;
  canvas.setPointerCapture?.(event.pointerId);
  getPdfInkStrokes(doc).push(pdfInkState.currentStroke);
  setActivePdfPage(doc, pdfInkState.currentStroke.pageNumber, false);
  redrawPdfInkPage(pdfInkState.currentStroke.pageNumber);
}

function updatePdfInkStroke(event) {
  const doc = documentState.current;
  const stroke = pdfInkState.currentStroke;
  if (!doc || !stroke || event.pointerId !== pdfInkState.pointerId) return;

  const canvas = event.target.closest(".pdf-ink-layer");
  if (!canvas) return;

  event.preventDefault();
  const point = getCanvasPoint(event, canvas);
  const lastPoint = stroke.points[stroke.points.length - 1];
  const distance = Math.hypot(point.x - lastPoint.x, point.y - lastPoint.y);
  if (distance < 0.002) return;

  stroke.points.push(point);
  redrawPdfInkPage(stroke.pageNumber);
}

function finishPdfInkStroke(event) {
  const doc = documentState.current;
  const stroke = pdfInkState.currentStroke;
  if (!doc || !stroke || event.pointerId !== pdfInkState.pointerId) return;

  pdfInkState.currentStroke = null;
  pdfInkState.pointerId = null;
  doc.meta.pdfEdited = true;
  saveWorkspace();
  syncPdfInkUi(doc);
  setParseStatus("画笔批注已记录", "ready");
}

function undoPdfInkStroke() {
  const doc = documentState.current;
  if (!doc || doc.kind !== "pdf") return;

  const activePage = getActivePdfPageNumber(doc);
  const strokes = getPdfInkStrokes(doc);
  const index = strokes.map((stroke, strokeIndex) => ({ stroke, strokeIndex })).reverse().find(
    ({ stroke }) => Number(stroke.pageNumber) === activePage,
  )?.strokeIndex;

  if (index === undefined) {
    setParseStatus("当前页暂无画笔", "working");
    return;
  }

  strokes.splice(index, 1);
  saveWorkspace();
  redrawPdfInkPage(activePage);
  syncPdfInkUi(doc);
  setParseStatus("已撤销一笔", "ready");
}

function clearCurrentPdfInkPage() {
  const doc = documentState.current;
  if (!doc || doc.kind !== "pdf") return;

  const activePage = getActivePdfPageNumber(doc);
  doc.meta.inkStrokes = getPdfInkStrokes(doc).filter((stroke) => Number(stroke.pageNumber) !== activePage);
  saveWorkspace();
  redrawPdfInkPage(activePage);
  syncPdfInkUi(doc);
  setParseStatus("已清空当前页画笔", "ready");
}

function parseInkColor(color) {
  const hex = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color || "");
  if (!hex) return { r: 0.09, g: 0.56, b: 0.52 };
  return {
    r: parseInt(hex[1], 16) / 255,
    g: parseInt(hex[2], 16) / 255,
    b: parseInt(hex[3], 16) / 255,
  };
}

function drawInkStrokeOnPdfPage(page, stroke, rgb) {
  const { width, height } = page.getSize();
  const color = parseInkColor(stroke.color);
  const thickness = Math.max(0.8, (stroke.widthRatio || 0.006) * width);
  const points = stroke.points || [];
  if (!points.length) return;

  if (points.length === 1) {
    const point = points[0];
    page.drawCircle({
      x: point.x * width,
      y: height - point.y * height,
      size: thickness / 2,
      color: rgb(color.r, color.g, color.b),
    });
    return;
  }

  for (let index = 1; index < points.length; index += 1) {
    const previous = points[index - 1];
    const current = points[index];
    page.drawLine({
      start: { x: previous.x * width, y: height - previous.y * height },
      end: { x: current.x * width, y: height - current.y * height },
      thickness,
      color: rgb(color.r, color.g, color.b),
      opacity: 0.92,
    });
  }
}

function drawInkStrokesOnPdf(pdfDoc, strokes, rgb) {
  const pages = pdfDoc.getPages();
  strokes.forEach((stroke) => {
    const page = pages[Number(stroke.pageNumber) - 1];
    if (page) drawInkStrokeOnPdfPage(page, stroke, rgb);
  });
}

async function applyPdfInkToCurrentPdf() {
  const doc = documentState.current;
  if (!doc || doc.kind !== "pdf") return;

  const strokes = getPdfInkStrokes(doc);
  if (!strokes.length) {
    setParseStatus("暂无画笔批注", "working");
    return;
  }

  if (!window.PDFLib) throw new Error("PDF 编辑库未加载，请重新运行 npm install。");

  rememberCurrentNotes();
  setParseStatus("写入画笔中", "working");
  const { PDFDocument, rgb } = window.PDFLib;
  const pdfDoc = await PDFDocument.load(doc.bytes);
  drawInkStrokesOnPdf(pdfDoc, strokes, rgb);
  const editedBytes = await pdfDoc.save();
  updatePdfBytes(doc, editedBytes, pdfDoc.getPageCount(), { keepTextExtraction: true });
  doc.meta.inkStrokes = [];
  doc.meta.pdfTextStale = false;
  saveWorkspace();
  setParseStatus("画笔已写入 PDF", "ready");
  renderPdfReader(doc);
}

function setActivePdfPage(doc, pageNumber, shouldRender = true) {
  if (!doc || doc.kind !== "pdf") return;

  rememberCurrentAiReading();
  rememberCurrentNotes();
  const pageCount = Math.max(1, doc.pageCount || doc.meta.pageCount || 1);
  const nextPage = Math.min(pageCount, Math.max(1, Number(pageNumber) || 1));
  doc.activePdfPage = nextPage;
  doc.meta.activePdfPage = nextPage;
  saveWorkspace();

  if (shouldRender) {
    syncPdfPageControls(doc);
    updatePdfAiReadingPanel(doc);
    schedulePdfPageTextExtraction(doc, nextPage);
    scrollPdfViewerToPage(nextPage);
  }
}

function syncPdfActivePageFromViewer(doc, pageNumber) {
  if (!doc || documentState.current?.meta?.id !== doc.meta.id) return;
  if (pdfInkState.currentStroke) return;

  const pageCount = Math.max(1, doc.pageCount || doc.meta.pageCount || 1);
  const nextPage = Math.min(pageCount, Math.max(1, Number(pageNumber) || 1));
  if (nextPage === doc.activePdfPage) return;

  rememberCurrentAiReading();
  rememberCurrentNotes();
  doc.activePdfPage = nextPage;
  doc.meta.activePdfPage = nextPage;
  saveWorkspace();
  syncPdfPageControls(doc);
  updatePdfAiReadingPanel(doc);
  schedulePdfPageTextExtraction(doc, nextPage);
}

function syncPdfPageControls(doc) {
  const pageCount = Math.max(1, doc.pageCount || doc.meta.pageCount || 1);
  const activePage = getActivePdfPageNumber(doc);
  const input = document.querySelector("#pdf-target-page");
  const previousButton = document.querySelector("[data-pdf-page-step='-1']");
  const nextButton = document.querySelector("[data-pdf-page-step='1']");

  if (input) {
    input.max = String(pageCount);
    input.value = String(activePage);
  }

  if (previousButton) previousButton.disabled = activePage <= 1;
  if (nextButton) nextButton.disabled = activePage >= pageCount;

  document.querySelectorAll(".pdf-rendered-page").forEach((page) => {
    const isActive = Number(page.dataset.pageNumber) === activePage;
    page.classList.toggle("active", isActive);
    page.toggleAttribute("aria-current", isActive);
  });
}

function scrollPdfViewerToPage(pageNumber) {
  const page = document.querySelector(`.pdf-rendered-page[data-page-number="${pageNumber}"]`);
  if (!page) return;
  page.scrollIntoView({ block: "start", behavior: "smooth" });
}

function showPdfNativeFallback(doc, viewer, message = "PDF 页面渲染失败，已切换到内置预览。") {
  pdfLazyRenderObserver?.disconnect();
  pdfPageObserver?.disconnect();
  pdfLazyRenderObserver = null;
  pdfPageObserver = null;
  viewer.innerHTML = `
    <div class="pdf-native-fallback">
      <p>${escapeHtml(message)}</p>
      <iframe class="pdf-native-frame" title="${escapeHtml(doc.meta.name)}" src="${doc.blobUrl}#page=${getActivePdfPageNumber(doc)}"></iframe>
    </div>
  `;
  setParseStatus("已切换 PDF 预览", "ready");
}

function updatePdfAiReadingPanel(doc) {
  if (!doc || doc.kind !== "pdf") return;

  const sourceInput = document.querySelector("#ai-reading-source");
  const output = document.querySelector("#ai-reading-output");
  const status = document.querySelector("#ai-reading-status");
  if (!sourceInput || !output) return;

  const sourceText = getCurrentReadingText(doc);
  sourceInput.value = sourceText;
  sourceInput.placeholder = `这里会跟随当前第 ${getActivePdfPageNumber(doc)} 页显示 PDF 提取文字。如果该页是扫描图片，可以手动粘贴文字。`;
  output.textContent = getPdfAiOutput(doc, sourceText);

  if (status) {
    const extractStatus = getPdfExtractionStatus(doc);
    status.textContent = extractStatus.text;
    status.className = `ai-reading-status ${extractStatus.tone}`;
  }
}

function renderPdfInsightPanel(doc) {
  const pageCount = Math.max(1, doc.pageCount || doc.meta.pageCount || 1);

  readerPanels.insight.innerHTML = `
    ${renderAiReadingWindow(doc)}
    <div class="panel-heading">
      <div>
        <span class="tag muted">PDF 批注</span>
        <h3>阅读与编辑</h3>
      </div>
    </div>
    <p class="summary-text">已载入 PDF 阅读器。滚动到不同页面时，AI 阅读窗口会自动切换到当前页文字。</p>
    <div class="pdf-toolbox">
      <div class="pdf-page-jump">
        <button class="mini-button" data-pdf-page-step="-1" ${doc.activePdfPage <= 1 ? "disabled" : ""} title="上一页">
          <i data-lucide="chevron-left"></i>
        </button>
        <label class="pdf-page-control">
          <span>当前页</span>
          <input id="pdf-target-page" type="number" min="1" max="${pageCount}" value="${doc.activePdfPage}" />
          <small>/ ${pageCount}</small>
        </label>
        <button class="mini-button" data-pdf-page-step="1" ${doc.activePdfPage >= pageCount ? "disabled" : ""} title="下一页">
          <i data-lucide="chevron-right"></i>
        </button>
      </div>
      <button class="ghost-action full" id="insert-pdf-image">
        <i data-lucide="image-plus"></i>
        <span>插入图片到当前页</span>
      </button>
      <button class="ghost-action full" id="add-pdf-page">
        <i data-lucide="file-plus-2"></i>
        <span>在当前页后加空白页</span>
      </button>
      <button class="danger-action full" id="delete-pdf-page">
        <i data-lucide="trash-2"></i>
        <span>删除当前页</span>
      </button>
      <div class="pdf-ink-tools">
        <button class="ghost-action compact ${pdfInkState.enabled ? "active" : ""}" id="toggle-pdf-ink" aria-pressed="${pdfInkState.enabled}">
          <i data-lucide="brush"></i>
          <span>画笔</span>
        </button>
        <button class="ghost-action compact" id="undo-pdf-ink">
          <i data-lucide="undo-2"></i>
          <span>撤销</span>
        </button>
        <button class="ghost-action compact" id="clear-pdf-ink-page">
          <i data-lucide="eraser"></i>
          <span>清空本页</span>
        </button>
        <button class="primary-action compact" id="apply-pdf-ink">
          <i data-lucide="check"></i>
          <span>写入 PDF</span>
        </button>
        <label class="pdf-ink-color">
          <span>颜色</span>
          <input id="pdf-ink-color" type="color" value="${escapeHtml(pdfInkState.color)}" />
        </label>
        <label class="pdf-ink-width">
          <span>粗细 <b id="pdf-ink-width-value">${pdfInkState.width}px</b></span>
          <input id="pdf-ink-width" type="range" min="2" max="12" value="${pdfInkState.width}" />
        </label>
        <small id="pdf-ink-count" class="pdf-ink-count">${getPdfInkStrokes(doc).length ? `${getPdfInkStrokes(doc).length} 笔待写入` : "暂无画笔批注"}</small>
      </div>
    </div>
    <textarea id="document-notes" class="document-editor" placeholder="在这里写 PDF 批注、复习重点或待提问的问题...">${escapeHtml(doc.meta.notes || "")}</textarea>
    <button class="primary-action full" id="save-document-notes">
      <i data-lucide="save"></i>
      <span>保存学习笔记</span>
    </button>
    <button class="ghost-action full" id="export-annotated-pdf">
      <i data-lucide="file-output"></i>
      <span>导出当前 PDF 副本</span>
    </button>
    <p class="small-hint">说明：PDF 编辑会作用在当前副本上，导出后得到新 PDF；不会直接破坏原文件。</p>
  `;
  window.lucide?.createIcons();
  syncPdfPageControls(doc);
  syncPdfInkUi(doc);
}

async function renderPdfPageShell(pdf, pageShell, doc, viewer, renderToken) {
  if (pageShell.dataset.rendered === "true") return true;
  if (pageShell.dataset.rendering === "true") return false;

  pageShell.dataset.rendering = "true";

  try {
    const pageNumber = Number(pageShell.dataset.pageNumber);
    const page = await pdf.getPage(pageNumber);
    if (renderToken !== pdfRenderToken || documentState.current?.meta?.id !== doc.meta.id) return;

    const baseViewport = page.getViewport({ scale: 1 });
    const availableWidth = Math.max(320, viewer.clientWidth - 72);
    const scale = Math.min(1.45, Math.max(0.72, availableWidth / baseViewport.width));
    const viewport = page.getViewport({ scale });
    const stack = pageShell.querySelector(".pdf-canvas-stack");
    const placeholder = pageShell.querySelector(".pdf-page-placeholder");
    const canvas = pageShell.querySelector(".pdf-page-canvas");
    const inkCanvas = pageShell.querySelector(".pdf-ink-layer");
    const context = canvas.getContext("2d");
    const pixelRatio = window.devicePixelRatio || 1;

    stack.style.width = `${viewport.width}px`;
    stack.style.minHeight = `${viewport.height}px`;
    stack.style.height = `${viewport.height}px`;
    canvas.hidden = false;
    canvas.removeAttribute("hidden");
    canvas.style.display = "block";
    canvas.width = Math.floor(viewport.width * pixelRatio);
    canvas.height = Math.floor(viewport.height * pixelRatio);
    canvas.style.width = `${viewport.width}px`;
    canvas.style.height = `${viewport.height}px`;
    inkCanvas.width = canvas.width;
    inkCanvas.height = canvas.height;
    inkCanvas.style.width = canvas.style.width;
    inkCanvas.style.height = canvas.style.height;
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    await page.render({ canvasContext: context, viewport }).promise;
    if (renderToken !== pdfRenderToken || documentState.current?.meta?.id !== doc.meta.id) return;

    placeholder?.remove();
    drawPdfInkLayer(pageShell, doc);
    pageShell.classList.add("ready");
    pageShell.dataset.rendered = "true";
    return true;
  } catch {
    pageShell.dataset.rendered = "error";
    const placeholder = pageShell.querySelector(".pdf-page-placeholder");
    if (placeholder) placeholder.textContent = "该页渲染失败";
    return false;
  } finally {
    pageShell.dataset.rendering = "false";
  }
}

async function renderPdfPages(doc) {
  const viewer = document.querySelector("#pdf-viewer");
  if (!viewer || !doc?.bytes) return;

  const renderToken = (pdfRenderToken += 1);
  pdfPageObserver?.disconnect();
  pdfLazyRenderObserver?.disconnect();
  pdfPageObserver = null;
  pdfLazyRenderObserver = null;
  viewer.innerHTML = `<div class="pdf-render-state">正在准备 PDF 页面...</div>`;

  try {
    const pdf = await getPdfRuntimeDocument(doc);
    if (renderToken !== pdfRenderToken) return;

    const firstPage = await pdf.getPage(1);
    const firstViewport = firstPage.getViewport({ scale: 1 });
    const availableWidth = Math.max(320, viewer.clientWidth - 72);
    const shellScale = Math.min(1.45, Math.max(0.72, availableWidth / firstViewport.width));
    const shellWidth = Math.floor(firstViewport.width * shellScale);
    const shellHeight = Math.floor(firstViewport.height * shellScale);

    doc.pageCount = pdf.numPages;
    doc.meta.pageCount = pdf.numPages;
    doc.activePdfPage = Math.min(doc.activePdfPage || doc.meta.activePdfPage || 1, pdf.numPages);
    doc.meta.activePdfPage = doc.activePdfPage;
    const pdfTitle = document.querySelector(".pdf-doc-title");
    if (pdfTitle) pdfTitle.textContent = `${doc.meta.name} · ${formatBytes(doc.meta.size)} · ${pdf.numPages} 页`;
    viewer.innerHTML = "";

    const pageShells = [];
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      const pageShell = document.createElement("section");
      pageShell.className = "pdf-rendered-page";
      pageShell.dataset.pageNumber = String(pageNumber);
      pageShell.dataset.rendered = "false";
      pageShell.innerHTML = `
        <div class="pdf-canvas-stack" style="width:${shellWidth}px; min-height:${shellHeight}px; height:${shellHeight}px">
          <div class="pdf-page-placeholder">第 ${pageNumber} 页</div>
          <canvas class="pdf-page-canvas" aria-label="PDF 第 ${pageNumber} 页" hidden></canvas>
          <canvas class="pdf-ink-layer" aria-label="第 ${pageNumber} 页画笔批注"></canvas>
        </div>
        <div class="pdf-page-caption">第 ${pageNumber} 页</div>
      `;
      viewer.append(pageShell);
      pageShells.push(pageShell);
    }

    syncPdfPageControls(doc);
    syncPdfInkUi(doc);
    updatePdfAiReadingPanel(doc);

    pdfLazyRenderObserver = new IntersectionObserver(
      (entries) => {
        entries
          .filter((entry) => entry.isIntersecting)
          .forEach((entry) => renderPdfPageShell(pdf, entry.target, doc, viewer, renderToken));
      },
      {
        root: viewer,
        rootMargin: "900px 0px",
        threshold: 0.01,
      },
    );

    pdfPageObserver = new IntersectionObserver(
      (entries) => {
        const visiblePage = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visiblePage) {
          syncPdfActivePageFromViewer(doc, Number(visiblePage.target.dataset.pageNumber));
        }
      },
      {
        root: viewer,
        threshold: [0.25, 0.5, 0.75],
      },
    );

    pageShells.forEach((pageShell) => {
      pdfLazyRenderObserver.observe(pageShell);
      pdfPageObserver.observe(pageShell);
    });

    const firstPageRendered = await renderPdfPageShell(
      pdf,
      pageShells[Math.max(0, doc.activePdfPage - 1)],
      doc,
      viewer,
      renderToken,
    );
    if (!firstPageRendered && renderToken === pdfRenderToken) {
      showPdfNativeFallback(doc, viewer);
      return;
    }
    scrollPdfViewerToPage(doc.activePdfPage);
    schedulePdfPageTextExtraction(doc, doc.activePdfPage, 300);
  } catch (error) {
    showPdfNativeFallback(doc, viewer, "PDF.js 加载失败，已切换到内置 PDF 预览。");
  }
}

function getPdfExtractionStatus(doc) {
  const activePage = getActivePdfPageNumber(doc);
  const activePageText = getPdfPageText(doc, activePage);

  if (doc.meta.pdfTextStale && doc.meta.extractedText) {
    return {
      tone: "warning",
      text: "PDF 内容已更新，建议重新提取文字后再解析当前页。",
    };
  }

  if (activePageText) {
    return {
      tone: "ready",
      text: `当前第 ${activePage} 页已提取文字，可直接解析或翻译。`,
    };
  }

  if (doc.meta.extractedText) {
    return {
      tone: "warning",
      text: `整份 PDF 已提取文字，但第 ${activePage} 页没有可选择文字。`,
    };
  }

  if (doc.meta.pdfExtractError) {
    return {
      tone: "warning",
      text: doc.meta.pdfExtractError,
    };
  }

  return {
    tone: "working",
    text: "正在等待 PDF 文字提取",
  };
}

function showView(viewName) {
  navItems.forEach((item) => {
    item.classList.toggle("active", item.dataset.view === viewName);
  });

  panels.forEach((panel) => {
    panel.classList.toggle("active", panel.dataset.viewPanel === viewName);
  });

  title.textContent = viewTitles[viewName] || "MindStudy";

  if (viewName === "reader") {
    renderDocumentLibrary();
    const meta = getActiveDocumentMeta();
    if (meta && (!documentState.current || documentState.current.meta.id !== meta.id)) {
      loadDocumentById(meta.id);
    }
  }
}

function setParseStatus(text, tone = "ready") {
  const status = document.querySelector("#parse-status");
  if (!status) return;

  status.textContent = text;
  status.style.background = tone === "working" ? "var(--yellow-soft)" : "var(--teal-soft)";
  status.style.color = tone === "working" ? "var(--yellow)" : "var(--teal)";
}

function updateImportedFileCard(meta, detailLines = []) {
  const fileTitle = document.querySelector(".upload-panel h3");
  const fileMeta = document.querySelector(".file-meta");

  if (!meta) {
    fileTitle.textContent = "尚未导入资料";
    fileMeta.innerHTML = `
      <strong>0 个</strong>
      <span>当前课程暂无资料</span>
      <span>点击右上角导入</span>
    `;
    return;
  }

  fileTitle.textContent = meta.name;
  fileMeta.innerHTML = `
    <strong>${escapeHtml(getTypeLabel(meta.extension))}</strong>
    <span>${escapeHtml(formatBytes(meta.size))}</span>
    ${detailLines.map((line) => `<span>${escapeHtml(line)}</span>`).join("")}
  `;
}

function renderCourseSwitcher() {
  const switchers = document.querySelectorAll(".course-switcher, .top-course-switcher");
  const activeCourse = getActiveCourse();

  const switcherMarkup = `
    <span>当前课程</span>
    <strong>${escapeHtml(activeCourse.name)}</strong>
    <small>${escapeHtml(activeCourse.description || `${activeCourse.documents.length} 个资料`)}</small>
    <select class="course-select" aria-label="切换课程">
      ${workspace.courses
        .map(
          (course) => `
            <option value="${course.id}" ${course.id === activeCourse.id ? "selected" : ""}>
              ${escapeHtml(course.name)}
            </option>
          `,
        )
        .join("")}
    </select>
    <div class="course-actions">
      <button class="course-button" data-course-action="create">新建</button>
      <button class="course-button" data-course-action="rename">编辑</button>
    </div>
  `;

  switchers.forEach((switcher) => {
    switcher.innerHTML = switcherMarkup;
  });
}

function updateDashboardForCourse() {
  const activeCourse = getActiveCourse();
  const activeMeta = getActiveDocumentMeta();
  const courseText = document.querySelector(".hero-copy p");

  if (courseText) {
    courseText.textContent = activeCourse.documents.length
      ? `当前课程已有 ${activeCourse.documents.length} 份资料，建议从资料阅读页切换文件复习。`
      : "当前课程还没有资料，请先导入 PDF 或 Markdown。";
  }

  updateImportedFileCard(activeMeta, activeMeta ? ["已加入课程资料库", activeMeta.path ? "已保存本机路径" : "临时导入"] : []);
}

function renderDocumentLibrary() {
  const activeCourse = getActiveCourse();
  const activeDocId = activeCourse.activeDocumentId;

  readerPanels.library.innerHTML = `
    <div class="panel-heading library-heading">
      <div>
        <span class="tag muted">课程资料库</span>
        <h3>${escapeHtml(activeCourse.name)}</h3>
      </div>
      <button class="icon-button" id="library-import" title="上传资料">
        <i data-lucide="plus"></i>
      </button>
    </div>
    <p class="library-subtitle">${escapeHtml(activeCourse.description || "每门课程拥有独立资料库")}</p>
    <div class="document-list">
      ${
        activeCourse.documents.length
          ? activeCourse.documents
              .map(
                (documentMeta) => `
                  <article class="document-item ${documentMeta.id === activeDocId ? "active" : ""}">
                    <button class="document-open" data-document-id="${documentMeta.id}">
                      <span class="document-type">${escapeHtml(getTypeLabel(documentMeta.extension))}</span>
                      <strong>${escapeHtml(documentMeta.name)}</strong>
                      <small>${documentMeta.path ? "本机路径已保存" : "临时资料"} · ${escapeHtml(formatBytes(documentMeta.size))}</small>
                    </button>
                    <button class="document-delete" data-delete-document-id="${documentMeta.id}" title="从课程资料库移除">
                      <i data-lucide="trash-2"></i>
                    </button>
                  </article>
                `,
              )
              .join("")
          : `<div class="library-empty">还没有资料。点击右上角或此处上传 PDF、MD。</div>`
      }
    </div>
  `;

  window.lucide?.createIcons();
}

function showReaderEmpty() {
  renderDocumentLibrary();
  readerPanels.document.innerHTML = `
    <div class="empty-document">
      <strong>选择或上传课程资料</strong>
      <span>每门课程都有独立资料库。已导入资料会保存本机路径，重启后可以继续打开。</span>
    </div>
  `;
  readerPanels.insight.innerHTML = `
    <div class="panel-heading">
      <div>
        <span class="tag muted">资料说明</span>
        <h3>支持格式</h3>
      </div>
    </div>
    <p class="summary-text">当前资料库仅支持 PDF 阅读批注和 Markdown 阅读编辑。</p>
    <button class="primary-action full" id="library-import">
      <i data-lucide="upload-cloud"></i>
      <span>上传课程资料</span>
    </button>
  `;
  window.lucide?.createIcons();
}

function showReaderError(message) {
  renderDocumentLibrary();
  readerPanels.document.innerHTML = `<div class="empty-document">${escapeHtml(message)}</div>`;
  readerPanels.insight.innerHTML = `
    <div class="panel-heading">
      <div>
        <span class="tag muted">建议</span>
        <h3>检查文件</h3>
      </div>
    </div>
    <p class="summary-text">如果文件被移动或删除，请重新导入一次。MindStudy 保存的是本机路径，不会复制原文件。</p>
  `;
}

function renderMarkdownPreview(markdown) {
  const lines = markdown.split(/\r?\n/);
  return lines
    .map((line) => {
      const trimmed = line.trim();
      if (!trimmed) return "";
      if (trimmed.startsWith("### ")) return `<h4>${escapeHtml(trimmed.slice(4))}</h4>`;
      if (trimmed.startsWith("## ")) return `<h3>${escapeHtml(trimmed.slice(3))}</h3>`;
      if (trimmed.startsWith("# ")) return `<h2>${escapeHtml(trimmed.slice(2))}</h2>`;
      if (trimmed.startsWith("- ")) return `<p class="markdown-bullet">• ${escapeHtml(trimmed.slice(2))}</p>`;
      return `<p>${escapeHtml(trimmed)}</p>`;
    })
    .join("");
}

function stripMarkdown(markdown) {
  return markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^[-*+]\s+/gm, "")
    .replace(/\*\*|__/g, "")
    .trim();
}

function getCurrentReadingText(doc) {
  if (!doc) return "";

  if (doc.kind === "md") {
    return stripMarkdown(doc.editedText || doc.text || "").slice(0, 5000);
  }

  if (doc.kind === "pdf") {
    return getPdfAiSource(doc).slice(0, 5000);
  }

  return doc.meta.aiSource || "";
}

function getEnglishRatio(text) {
  const letters = (text.match(/[a-z]/gi) || []).length;
  const chinese = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
  return letters / Math.max(1, letters + chinese);
}

function translateEnglishToChinese(text) {
  if (!text.trim()) return "请先粘贴或输入需要翻译的英文内容。";

  const phraseMap = [
    ["human-computer interaction", "人机交互"],
    ["user experience", "用户体验"],
    ["user interface", "用户界面"],
    ["usability testing", "可用性测试"],
    ["cognitive load", "认知负荷"],
    ["information architecture", "信息架构"],
    ["interaction design", "交互设计"],
    ["mental model", "心理模型"],
    ["task analysis", "任务分析"],
    ["accessibility", "无障碍性"],
    ["efficiency", "效率"],
    ["effectiveness", "有效性"],
    ["satisfaction", "满意度"],
    ["prototype", "原型"],
    ["feedback", "反馈"],
    ["affordance", "可供性"],
    ["learnability", "易学性"],
    ["consistency", "一致性"],
  ];
  const wordMap = {
    user: "用户",
    users: "用户",
    system: "系统",
    design: "设计",
    interface: "界面",
    task: "任务",
    tasks: "任务",
    goal: "目标",
    goals: "目标",
    error: "错误",
    errors: "错误",
    test: "测试",
    testing: "测试",
    data: "数据",
    method: "方法",
    methods: "方法",
    model: "模型",
    process: "过程",
    performance: "表现",
    time: "时间",
    cost: "成本",
    context: "情境",
    behavior: "行为",
    study: "研究",
    analysis: "分析",
    evaluate: "评估",
    evaluation: "评估",
    measure: "衡量",
    important: "重要",
    interaction: "交互",
    computer: "计算机",
    visual: "视觉",
    content: "内容",
    page: "页面",
    information: "信息",
  };

  const translated = text
    .split(/\n+/)
    .map((line) => {
      let nextLine = line.trim();
      if (!nextLine) return "";

      phraseMap.forEach(([english, chinese]) => {
        nextLine = nextLine.replace(new RegExp(english, "gi"), chinese);
      });

      nextLine = nextLine.replace(/\b[a-z][a-z-]*\b/gi, (word) => {
        const normalized = word.toLowerCase();
        return wordMap[normalized] || word;
      });

      return nextLine;
    })
    .filter(Boolean)
    .join("\n");

  return translated || "没有检测到可翻译的英文内容。";
}

function analyzeReadingText(text) {
  const cleaned = stripMarkdown(text || "");
  if (!cleaned) {
    return "请先输入或粘贴当前阅读内容。Markdown 会自动带入正文；PDF 会自动提取可选择的文字。";
  }

  const sentences = cleaned
    .split(/(?<=[。！？.!?])\s+|\n+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
  const keywords = Array.from(
    new Set(
      cleaned
        .match(/[A-Za-z][A-Za-z-]{3,}|[\u4e00-\u9fa5]{2,}/g)
        ?.map((word) => word.toLowerCase())
        .filter((word) => !["this", "that", "with", "from", "have", "will", "into"].includes(word)) || [],
    ),
  ).slice(0, 8);
  const englishHint = getEnglishRatio(cleaned) > 0.35 ? "检测到英文内容，建议点击“英文转中文”获得中文版本。" : "当前内容以中文为主，可以直接整理成笔记。";

  return [
    `阅读要点：${sentences.slice(0, 3).join(" ") || cleaned.slice(0, 180)}`,
    `关键词：${keywords.join("、") || "暂无明显关键词"}`,
    englishHint,
  ].join("\n\n");
}

function renderAiReadingWindow(doc) {
  const sourceText = doc.kind === "pdf" ? getCurrentReadingText(doc) : doc.meta.aiSource || getCurrentReadingText(doc);
  const output = doc.kind === "pdf" ? getPdfAiOutput(doc, sourceText) : doc.meta.aiOutput || analyzeReadingText(sourceText);
  const placeholder =
    doc.kind === "pdf"
      ? `这里会跟随当前第 ${getActivePdfPageNumber(doc)} 页显示 PDF 提取文字。如果该页是扫描图片，可以手动粘贴文字。`
      : "这里会自动带入当前 Markdown 正文，也可以手动修改需要解析或翻译的段落。";
  const extractStatus =
    doc.kind === "pdf" ? getPdfExtractionStatus(doc) : null;

  return `
    <section class="ai-reading-card">
      <div class="panel-heading compact-heading">
        <div>
          <span class="tag muted">AI 阅读窗口</span>
          <h3>解析与翻译</h3>
        </div>
      </div>
      ${
        extractStatus
          ? `<p id="ai-reading-status" class="ai-reading-status ${escapeHtml(extractStatus.tone)}">${escapeHtml(extractStatus.text)}</p>`
          : ""
      }
      <textarea id="ai-reading-source" class="ai-reading-source" placeholder="${escapeHtml(placeholder)}">${escapeHtml(sourceText)}</textarea>
      <div class="ai-reading-actions">
        <button class="primary-action compact" id="ai-analyze-reading">
          <i data-lucide="sparkles"></i>
          <span>解析当前内容</span>
        </button>
        <button class="ghost-action compact" id="ai-translate-reading">
          <i data-lucide="languages"></i>
          <span>英文转中文</span>
        </button>
        ${
          doc.kind === "pdf"
            ? `<button class="ghost-action compact wide" id="extract-pdf-text"><i data-lucide="scan-text"></i><span>重新提取当前页文字</span></button>`
            : ""
        }
      </div>
      <div class="ai-reading-output" id="ai-reading-output">${escapeHtml(output)}</div>
    </section>
  `;
}

function updateAiReadingOutput(mode) {
  const doc = documentState.current;
  const sourceInput = document.querySelector("#ai-reading-source");
  const output = document.querySelector("#ai-reading-output");
  if (!doc || !sourceInput || !output) return;

  const source = sourceInput.value.trim();
  const result = mode === "translate" ? translateEnglishToChinese(source) : analyzeReadingText(source);
  if (doc.kind === "pdf") {
    const pageKey = getPdfPageKey(doc);
    doc.meta.aiSourcesByPage = doc.meta.aiSourcesByPage || {};
    doc.meta.aiOutputsByPage = doc.meta.aiOutputsByPage || {};
    doc.meta.aiSourcesByPage[pageKey] = source;
    doc.meta.aiOutputsByPage[pageKey] = result;
    doc.meta.aiSource = source;
    doc.meta.aiOutput = result;
  } else {
    doc.meta.aiSource = source;
    doc.meta.aiOutput = result;
  }
  output.textContent = result;
  saveWorkspace();
}

function buildDocumentMarkdown() {
  const doc = documentState.current;
  if (!doc) return "# MindStudy 学习笔记\n\n当前没有导入资料。\n";

  const notes = document.querySelector("#document-notes")?.value || doc.meta.notes || "";

  return [
    `# ${doc.meta.name}`,
    "",
    `- 文件类型：${doc.meta.extension}`,
    `- 文件大小：${formatBytes(doc.meta.size)}`,
    doc.meta.path ? `- 本机路径：${doc.meta.path}` : "",
    "",
    "## 学习批注",
    "",
    notes || "暂无批注。",
  ]
    .filter(Boolean)
    .join("\n");
}

function rememberCurrentNotes() {
  const doc = documentState.current;
  if (!doc) return;

  const notesInput = document.querySelector("#document-notes");
  if (notesInput) {
    doc.meta.notes = notesInput.value;
  }

  if (doc.kind === "md") {
    const markdownEditor = document.querySelector("#markdown-editor");
    if (markdownEditor) {
      doc.meta.editedText = markdownEditor.value;
      doc.editedText = markdownEditor.value;
    }
  }

  saveWorkspace();
}

function renderPdfReader(doc) {
  const pageCount = Math.max(1, doc.pageCount || doc.meta.pageCount || 1);
  doc.activePdfPage = Math.min(doc.activePdfPage || doc.meta.activePdfPage || 1, pageCount);
  doc.meta.activePdfPage = doc.activePdfPage;
  renderDocumentLibrary();
  readerPanels.document.innerHTML = `
    <div class="doc-toolbar">
      <span class="pdf-doc-title">${escapeHtml(doc.meta.name)} · ${escapeHtml(formatBytes(doc.meta.size))} · ${pageCount} 页</span>
      <div class="toolbar-actions">
        <button class="mini-button" id="save-notes-top">
          <i data-lucide="save"></i>
          <span>保存笔记</span>
        </button>
        ${getReaderFullscreenButtonMarkup()}
      </div>
    </div>
    <div id="pdf-viewer" class="pdf-viewer" aria-label="${escapeHtml(doc.meta.name)}"></div>
  `;
  renderPdfInsightPanel(doc);
  window.lucide?.createIcons();
  syncFullscreenButton();
  renderPdfPages(doc);
}

function renderMarkdownReader(doc) {
  renderDocumentLibrary();
  readerPanels.document.innerHTML = `
    <div class="doc-toolbar">
      <span>${escapeHtml(doc.meta.name)} · Markdown 阅读</span>
      <div class="toolbar-actions">
        <button class="mini-button" id="save-markdown-original">
          <i data-lucide="save"></i>
          <span>保存原文件</span>
        </button>
        ${getReaderFullscreenButtonMarkup()}
      </div>
    </div>
    <div class="markdown-preview">
      ${renderMarkdownPreview(doc.editedText || doc.text)}
    </div>
  `;
  readerPanels.insight.innerHTML = `
    ${renderAiReadingWindow(doc)}
    <div class="panel-heading">
      <div>
        <span class="tag muted">Markdown 编辑</span>
        <h3>当前文件</h3>
      </div>
    </div>
    <textarea id="markdown-editor" class="document-editor" placeholder="编辑 Markdown 内容...">${escapeHtml(doc.editedText || doc.text)}</textarea>
    <button class="primary-action full" id="apply-markdown-edit">
      <i data-lucide="check"></i>
      <span>应用预览</span>
    </button>
    <button class="ghost-action full" id="save-markdown-original">
      <i data-lucide="save"></i>
      <span>保存到原 MD</span>
    </button>
    <button class="ghost-action full" id="save-markdown-copy">
      <i data-lucide="file-output"></i>
      <span>另存为副本</span>
    </button>
  `;
  window.lucide?.createIcons();
  syncFullscreenButton();
}

function renderUnsupportedPowerPoint(doc) {
  renderDocumentLibrary();
  readerPanels.document.innerHTML = `
    <div class="doc-toolbar">
      <span>${escapeHtml(doc.meta.name)} · 旧版 PPT</span>
      <div class="toolbar-actions">
        ${getReaderFullscreenButtonMarkup()}
      </div>
    </div>
    <div class="empty-document">
      <strong>暂不支持直接读取旧版 .ppt</strong>
      <span>请在 PowerPoint 中另存为 .pptx 后重新导入。新版 PPTX 可以读取每页文字并导出编辑后的副本。</span>
    </div>
  `;
  readerPanels.insight.innerHTML = `
    <div class="panel-heading">
      <div>
        <span class="tag muted">学习笔记</span>
        <h3>仍可记录批注</h3>
      </div>
    </div>
    <textarea id="document-notes" class="document-editor" placeholder="记录这份 PPT 的学习重点...">${escapeHtml(doc.meta.notes || "")}</textarea>
    <button class="primary-action full" id="save-document-notes">
      <i data-lucide="save"></i>
      <span>保存学习笔记</span>
    </button>
  `;
  window.lucide?.createIcons();
  syncFullscreenButton();
}

function getFirstXmlNode(parent, names) {
  for (const name of names) {
    const node = parent.getElementsByTagName(name)[0];
    if (node) return node;
  }

  return null;
}

function getLocalName(node) {
  return node?.localName || node?.tagName?.split(":").pop() || "";
}

function readXmlNumber(node, attribute, fallback = 0) {
  const value = Number(node?.getAttribute(attribute));
  return Number.isFinite(value) ? value : fallback;
}

function extractNodeText(node) {
  const textNodes = Array.from(node.getElementsByTagName("a:t"));
  const fallbackNodes = textNodes.length > 0 ? textNodes : Array.from(node.getElementsByTagName("t"));
  return fallbackNodes
    .map((textNode) => textNode.textContent.trim())
    .filter(Boolean)
    .join("\n");
}

function getSlideFrame(node, slideSize, fallbackIndex = 0) {
  const transform = getFirstXmlNode(node, ["a:xfrm"]);
  const offset = transform ? getFirstXmlNode(transform, ["a:off"]) : null;
  const extent = transform ? getFirstXmlNode(transform, ["a:ext"]) : null;

  if (!offset || !extent) {
    return {
      x: 7,
      y: 7 + (fallbackIndex % 5) * 15,
      width: 86,
      height: 12,
    };
  }

  return {
    x: (readXmlNumber(offset, "x") / slideSize.width) * 100,
    y: (readXmlNumber(offset, "y") / slideSize.height) * 100,
    width: Math.max(3, (readXmlNumber(extent, "cx") / slideSize.width) * 100),
    height: Math.max(3, (readXmlNumber(extent, "cy") / slideSize.height) * 100),
  };
}

function getSchemeColor(scheme) {
  const schemeColors = {
    accent1: "#188f84",
    accent2: "#df695d",
    accent3: "#d6a62d",
    accent4: "#5267d6",
    accent5: "#8f79d6",
    accent6: "#6aa66a",
    bg1: "#ffffff",
    bg2: "#f7f9f6",
    dk1: "#202623",
    dk2: "#18322d",
    lt1: "#ffffff",
    lt2: "#f7f9f6",
    tx1: "#202623",
    tx2: "#65716b",
  };

  return schemeColors[scheme] || "";
}

function extractColorFromFill(fillNode, fallback = "") {
  const colorNode = fillNode ? getFirstXmlNode(fillNode, ["a:srgbClr"]) : null;
  const colorValue = colorNode?.getAttribute("val");

  if (colorValue && /^[0-9a-f]{6}$/i.test(colorValue)) {
    return `#${colorValue}`;
  }

  const schemeNode = fillNode ? getFirstXmlNode(fillNode, ["a:schemeClr"]) : null;
  return getSchemeColor(schemeNode?.getAttribute("val")) || fallback;
}

function extractShapeFill(shapeNode, hasText) {
  const shapeProperties = getFirstXmlNode(shapeNode, ["p:spPr", "spPr"]) || shapeNode;

  if (getFirstXmlNode(shapeProperties, ["a:noFill"])) {
    return { color: "transparent", hasFill: false };
  }

  const solidFill = getFirstXmlNode(shapeProperties, ["a:solidFill"]);
  const color = extractColorFromFill(solidFill);

  if (color) {
    return { color, hasFill: true };
  }

  return hasText
    ? { color: "transparent", hasFill: false }
    : { color: "#f7f9f6", hasFill: true };
}

function extractSlideBackground(slideDocument) {
  const backgroundNode = getFirstXmlNode(slideDocument, ["p:bg", "bg"]);
  const solidFill = backgroundNode ? getFirstXmlNode(backgroundNode, ["a:solidFill"]) : null;
  return extractColorFromFill(solidFill, "#ffffff");
}

function extractTextStyle(shapeNode, frame, role) {
  const runProperties = getFirstXmlNode(shapeNode, ["a:rPr"]) || getFirstXmlNode(shapeNode, ["a:defRPr"]);
  const sizeValue = readXmlNumber(runProperties, "sz", role === "title" ? 3200 : 1800);
  const pointSize = Math.max(10, Math.min(44, sizeValue / 100));
  const solidFill = runProperties ? getFirstXmlNode(runProperties, ["a:solidFill"]) : null;
  const color = extractColorFromFill(solidFill, "");
  const paragraphProperties = getFirstXmlNode(shapeNode, ["a:pPr"]);
  const alignment = paragraphProperties?.getAttribute("algn");
  const cssAlignments = {
    ctr: "center",
    r: "right",
    l: "left",
    just: "justify",
  };

  return {
    bold: runProperties?.getAttribute("b") === "1" || role === "title",
    color,
    align: cssAlignments[alignment] || "left",
    fontSize: `${Math.max(1.25, Math.min(5.6, pointSize / 7)).toFixed(2)}cqw`,
    titleLike: role === "title" || frame.height > 13 || pointSize >= 26,
  };
}

function getShapeRole(shapeNode) {
  const placeholder = getFirstXmlNode(shapeNode, ["p:ph", "ph"]);
  const type = placeholder?.getAttribute("type");
  if (["title", "ctrTitle", "subTitle"].includes(type)) return "title";
  return "body";
}

function normalizePptxTarget(baseFile, target) {
  if (!target) return "";
  const cleanTarget = target.replace(/^\/+/, "");
  if (cleanTarget.startsWith("ppt/")) return cleanTarget;

  const parts = baseFile.split("/").slice(0, -1);
  cleanTarget.split("/").forEach((part) => {
    if (!part || part === ".") return;
    if (part === "..") {
      parts.pop();
      return;
    }
    parts.push(part);
  });

  return parts.join("/");
}

function getSlideRelsPath(slideFile) {
  const fileName = slideFile.split("/").pop();
  return slideFile.replace(fileName, `_rels/${fileName}.rels`);
}

async function extractPptxRels(zip, slideFile) {
  const relsPath = getSlideRelsPath(slideFile);
  const relsFile = zip.file(relsPath);
  if (!relsFile) return new Map();

  const relsXml = await relsFile.async("string");
  const relsDocument = new DOMParser().parseFromString(relsXml, "application/xml");
  return new Map(
    Array.from(relsDocument.getElementsByTagName("Relationship")).map((relationship) => [
      relationship.getAttribute("Id"),
      relationship.getAttribute("Target"),
    ]),
  );
}

async function extractPptxSlideSize(zip) {
  const presentationFile = zip.file("ppt/presentation.xml");
  if (!presentationFile) {
    return { width: 9144000, height: 5143500 };
  }

  const presentationXml = await presentationFile.async("string");
  const presentationDocument = new DOMParser().parseFromString(presentationXml, "application/xml");
  const sizeNode = getFirstXmlNode(presentationDocument, ["p:sldSz", "sldSz"]);

  return {
    width: readXmlNumber(sizeNode, "cx", 9144000),
    height: readXmlNumber(sizeNode, "cy", 5143500),
  };
}

async function extractPptxVisuals(zip, slideFile, xml, slideSize) {
  const slideDocument = new DOMParser().parseFromString(xml, "application/xml");
  const relationships = await extractPptxRels(zip, slideFile);
  const visuals = [];
  const shapeTree = getFirstXmlNode(slideDocument, ["p:spTree", "spTree"]);
  const drawableNodes = shapeTree
    ? Array.from(shapeTree.childNodes || []).filter((node) => node.nodeType === 1 && ["sp", "pic"].includes(getLocalName(node)))
    : [
        ...Array.from(slideDocument.getElementsByTagName("p:sp")),
        ...Array.from(slideDocument.getElementsByTagName("p:pic")),
      ];

  for (const [index, node] of drawableNodes.entries()) {
    if (getLocalName(node) === "sp") {
      const text = extractNodeText(node);
      const frame = getSlideFrame(node, slideSize, index);
      const role = getShapeRole(node);
      const fill = extractShapeFill(node, Boolean(text));
      const textStyle = extractTextStyle(node, frame, role);

      if (!text && !fill.hasFill) continue;

      visuals.push({
        type: "shape",
        text,
        role,
        fill: fill.color,
        hasFill: fill.hasFill,
        textStyle,
        ...frame,
      });
      continue;
    }

    if (getLocalName(node) === "pic") {
      const frame = getSlideFrame(node, slideSize, index);
      const blip = getFirstXmlNode(node, ["a:blip"]);
      const relationshipId = blip?.getAttribute("r:embed") || blip?.getAttribute("embed");
      const target = relationships.get(relationshipId);
      const mediaPath = normalizePptxTarget(slideFile, target);
      const mediaFile = mediaPath ? zip.file(mediaPath) : null;

      if (!mediaFile) continue;

      const base64 = await mediaFile.async("base64");
      visuals.push({
        type: "image",
        src: `data:${getMimeTypeFromName(mediaPath)};base64,${base64}`,
        alt: mediaPath.split("/").pop() || "PPTX 图片",
        ...frame,
      });
    }
  }

  return {
    background: extractSlideBackground(slideDocument),
    visuals,
  };
}

function renderPptxVisualElement(element, index) {
  const style = `left:${element.x.toFixed(3)}%;top:${element.y.toFixed(3)}%;width:${element.width.toFixed(3)}%;height:${element.height.toFixed(3)}%;`;

  if (element.type === "image") {
    return `<img class="pptx-image" src="${element.src}" alt="${escapeHtml(element.alt)}" style="${style}" />`;
  }

  const fill = /^#[0-9a-f]{6}$/i.test(element.fill) ? element.fill : "#f7f9f6";
  const isTransparent = !element.hasFill || fill === "transparent";
  const isDark = ["#188f84", "#df695d", "#5267d6", "#202623", "#8f79d6"].includes(fill.toLowerCase());
  const textColor = element.textStyle?.color || (isDark ? "#fff" : "var(--ink)");
  const shapeClasses = [
    "pptx-shape",
    element.role === "title" || element.textStyle?.titleLike ? "title" : "",
    isTransparent ? "text-box" : "filled",
    element.text ? "" : "empty",
  ]
    .filter(Boolean)
    .join(" ");
  const textStyle = [
    style,
    `background:${isTransparent ? "transparent" : fill};`,
    `color:${textColor};`,
    `text-align:${element.textStyle?.align || "left"};`,
    `--pptx-font-size:${element.textStyle?.fontSize || "2.2cqw"};`,
    element.textStyle?.bold ? "font-weight:800;" : "font-weight:600;",
  ].join("");

  return `
    <div class="${shapeClasses}" style="${textStyle}">
      ${element.text ? escapeHtml(element.text) : `<span>形状 ${index + 1}</span>`}
    </div>
  `;
}

function renderGeneratedSlide(slide, slideLines) {
  const title = slideLines[0] || slide.title || "未命名页面";
  const bodyLines = slideLines.slice(1);

  return `
    <div class="pptx-stage-shell">
      <div class="pptx-visual-stage generated" style="aspect-ratio:${slide.size.width} / ${slide.size.height};">
        <div class="generated-slide-content">
          <span class="slide-kicker">PowerPoint Slide</span>
          <h2>${escapeHtml(title)}</h2>
          <div class="generated-bullets">
            ${bodyLines.map((line) => `<p>${escapeHtml(line)}</p>`).join("") || "<p>该页没有提取到文字内容。</p>"}
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderPowerPointStage(renderedSlide) {
  return `
    <div class="pptx-stage-shell powerpoint-exact">
      <div class="pptx-visual-stage powerpoint-render" style="aspect-ratio:${renderedSlide.width} / ${renderedSlide.height};">
        <img class="pptx-rendered-slide" src="${renderedSlide.dataUrl}" alt="${escapeHtml(renderedSlide.name)}" />
      </div>
    </div>
  `;
}

function renderPptxVisualStage(slide, slideLines, renderedSlide) {
  if (renderedSlide) {
    return renderPowerPointStage(renderedSlide);
  }

  const hasVisuals = slide.visuals?.length > 0;

  if (!hasVisuals) {
    return renderGeneratedSlide(slide, slideLines);
  }

  return `
    <div class="pptx-stage-shell">
      <div class="pptx-visual-stage" style="aspect-ratio:${slide.size.width} / ${slide.size.height};background:${slide.background || "#fff"};">
        ${slide.visuals.map((element, index) => renderPptxVisualElement(element, index)).join("")}
      </div>
    </div>
  `;
}

function renderPptxReader() {
  const doc = documentState.current;
  const activeSlide = doc.slides[doc.activeSlideIndex];
  const renderedSlide = doc.powerPointPreview?.slides?.[doc.activeSlideIndex];
  const slideLines = (activeSlide.editedText || activeSlide.text)
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);

  renderDocumentLibrary();
  readerPanels.document.innerHTML = `
    <div class="doc-toolbar">
      <span>第 ${doc.activeSlideIndex + 1} / ${doc.slides.length} 页 · ${escapeHtml(doc.meta.name)}</span>
      <div class="toolbar-actions">
        <button class="icon-button" title="上一页" data-slide-move="-1"><i data-lucide="chevron-left"></i></button>
        <button class="icon-button" title="下一页" data-slide-move="1"><i data-lucide="chevron-right"></i></button>
        ${getReaderFullscreenButtonMarkup()}
      </div>
    </div>
    <div class="slide-canvas pptx-canvas">
      ${renderPptxVisualStage(activeSlide, slideLines, renderedSlide)}
      <div class="highlight-strip">
        <span>${renderedSlide ? "当前页面由本机 PowerPoint 原样渲染，显示效果按 PowerPoint 为准。" : "未能调用 PowerPoint 原样渲染，已切换到内置 PPTX 预览。"}右侧可编辑当前页文字并导出新的 PPTX 副本。</span>
      </div>
    </div>
  `;
  readerPanels.insight.innerHTML = `
    <div class="panel-heading">
      <div>
        <span class="tag muted">PPTX 编辑</span>
        <h3>当前页文字</h3>
      </div>
    </div>
    <textarea id="slide-editor" class="document-editor" placeholder="编辑当前页文字...">${escapeHtml(activeSlide.editedText || activeSlide.text)}</textarea>
    <button class="primary-action full" id="apply-slide-edit">
      <i data-lucide="check"></i>
      <span>应用到当前页</span>
    </button>
    <button class="ghost-action full" id="export-edited-pptx">
      <i data-lucide="file-output"></i>
      <span>导出编辑 PPTX</span>
    </button>
    <button class="ghost-action full" id="save-document-notes">
      <i data-lucide="save"></i>
      <span>保存学习笔记</span>
    </button>
    <textarea id="document-notes" class="document-editor compact" placeholder="整份 PPTX 的学习批注...">${escapeHtml(doc.meta.notes || "")}</textarea>
  `;
  window.lucide?.createIcons();
  syncFullscreenButton();
}

function extractSlideText(xml) {
  const parser = new DOMParser();
  const documentXml = parser.parseFromString(xml, "application/xml");
  const textNodes = Array.from(documentXml.getElementsByTagName("a:t"));
  const fallbackNodes = textNodes.length > 0 ? textNodes : Array.from(documentXml.getElementsByTagName("t"));
  return fallbackNodes
    .map((node) => node.textContent.trim())
    .filter(Boolean)
    .join("\n");
}

function replaceSlideText(xml, text) {
  const parser = new DOMParser();
  const documentXml = parser.parseFromString(xml, "application/xml");
  const textNodes = Array.from(documentXml.getElementsByTagName("a:t"));
  const fallbackNodes = textNodes.length > 0 ? textNodes : Array.from(documentXml.getElementsByTagName("t"));
  const cleanedText = text.trim() || " ";

  if (fallbackNodes.length === 0) return xml;

  fallbackNodes.forEach((node, index) => {
    node.textContent = index === 0 ? cleanedText : "";
  });

  return new XMLSerializer().serializeToString(documentXml);
}

async function loadPptxDocument(file, meta) {
  if (!window.JSZip) throw new Error("PPTX 解析库未加载，请重新运行 npm install。");

  const arrayBuffer = await dataUrlToArrayBuffer(file.dataUrl);
  const zip = await window.JSZip.loadAsync(arrayBuffer);
  const slideSize = await extractPptxSlideSize(zip);
  let powerPointPreview = null;
  let powerPointPreviewError = "";

  if (meta.path && window.mindStudy?.renderPptxSlides) {
    try {
      setParseStatus("PowerPoint 渲染中", "working");
      powerPointPreview = await window.mindStudy.renderPptxSlides(meta.path);
    } catch (error) {
      powerPointPreviewError = error.message || "PowerPoint 原样预览不可用。";
    }
  }

  const slideFiles = Object.keys(zip.files)
    .filter((fileName) => /^ppt\/slides\/slide\d+\.xml$/.test(fileName))
    .sort((first, second) => Number(first.match(/\d+/)[0]) - Number(second.match(/\d+/)[0]));

  const slides = [];

  for (const [index, slideFile] of slideFiles.entries()) {
    const xml = await zip.file(slideFile).async("string");
    const text = extractSlideText(xml);
    const title = text.split(/\n+/).find(Boolean) || slideFile.replace("ppt/slides/", "").replace(".xml", "");
    const visualModel = await extractPptxVisuals(zip, slideFile, xml, slideSize);

    slides.push({
      fileName: slideFile,
      originalXml: xml,
      title,
      text: text || "该页没有提取到文字内容。",
      editedText: meta.editedSlides?.[index] || text || "该页没有提取到文字内容。",
      visuals: visualModel.visuals,
      background: visualModel.background,
      size: slideSize,
    });
  }

  documentState.current = {
    kind: "pptx",
    meta,
    file,
    arrayBuffer,
    slides,
    powerPointPreview,
    powerPointPreviewError,
    activeSlideIndex: 0,
  };

  meta.slideCount = slides.length;
  updateImportedFileCard(meta, [
    `${slides.length} 页幻灯片`,
    powerPointPreview ? "PowerPoint 原样预览" : "内置预览",
    meta.path ? "已保存路径" : "临时导入",
  ]);
  renderPptxReader();
}

async function loadPdfDocument(file, meta) {
  const bytes = base64ToUint8Array(file.base64);
  const blob = new Blob([bytes], { type: "application/pdf" });
  const blobUrl = URL.createObjectURL(blob);
  let pageCount = meta.pageCount || 1;

  documentState.current = {
    kind: "pdf",
    meta,
    file,
    bytes,
    blobUrl,
    pageCount,
    activePdfPage: Math.min(pageCount, Math.max(1, Number(meta.activePdfPage || 1))),
  };

  meta.pageCount = pageCount;
  updateImportedFileCard(meta, ["PDF 阅读器", `${pageCount} 页`, "自动提取文字", meta.path ? "已保存路径" : "临时导入"]);
  hydrateStoredPdfText(documentState.current);
  renderPdfReader(documentState.current);
}

async function loadMarkdownDocument(file, meta) {
  const text = base64ToText(file.base64);

  documentState.current = {
    kind: "md",
    meta,
    file,
    text,
    editedText: meta.editedText || text,
  };

  updateImportedFileCard(meta, ["Markdown 阅读器", "支持编辑保存", meta.path ? "已保存路径" : "临时导入"]);
  renderMarkdownReader(documentState.current);
}

async function loadUnsupportedPpt(file, meta) {
  documentState.current = {
    kind: "ppt",
    meta,
    file,
  };

  updateImportedFileCard(meta, ["旧版 PPT", "建议转为 PPTX", meta.path ? "已保存路径" : "临时导入"]);
  renderUnsupportedPowerPoint(documentState.current);
}

async function loadDocumentById(documentId) {
  const course = getActiveCourse();
  const meta = course.documents.find((documentMeta) => documentMeta.id === documentId);
  if (!meta) return;

  try {
    rememberCurrentNotes();
    setParseStatus("读取中", "working");
    course.activeDocumentId = meta.id;
    saveWorkspace();
    renderCourseSwitcher();
    renderDocumentLibrary();

    const file = await readStoredFile(meta);
    const kind = getDocumentKind(meta.extension);

    if (kind === "pdf") {
      await loadPdfDocument(file, meta);
    } else if (kind === "md") {
      await loadMarkdownDocument(file, meta);
    } else {
      throw new Error("暂不支持该文件格式。当前只支持 PDF 和 Markdown。");
    }

    setParseStatus("已解析", "ready");
    saveWorkspace();
  } catch (error) {
    setParseStatus("读取失败", "working");
    showReaderError(error.message || "文件读取失败。");
  }
}

function createDocumentMeta(file) {
  return {
    id: createId("doc"),
    name: file.name,
    extension: file.extension || getExtension(file.name),
    mimeType: file.mimeType || "",
    size: file.size || 0,
    path: file.path || "",
    notes: "",
    editedText: "",
    addedAt: Date.now(),
    updatedAt: file.updatedAt || Date.now(),
  };
}

async function handleCourseImport() {
  try {
    const files = (await selectCourseFiles()).filter((file) =>
      supportedDocumentExtensions.has(String(file.extension || getExtension(file.name)).toUpperCase()),
    );
    if (!files.length) return;

    const course = getActiveCourse();
    setParseStatus("解析中", "working");

    const newMetas = files.map((file) => {
      const existing = file.path ? course.documents.find((documentMeta) => documentMeta.path === file.path) : null;
      const meta = existing || createDocumentMeta(file);

      if (!existing) course.documents.unshift(meta);

      meta.name = file.name;
      meta.extension = file.extension || getExtension(file.name);
      meta.mimeType = file.mimeType || "";
      meta.size = file.size || 0;
      meta.path = file.path || meta.path || "";
      meta.updatedAt = file.updatedAt || Date.now();
      runtimeFiles.set(meta.id, file);
      return meta;
    });

    course.activeDocumentId = newMetas[0].id;
    saveWorkspace();
    renderCourseSwitcher();
    await loadDocumentById(newMetas[0].id);
    showView("reader");
  } catch (error) {
    setParseStatus("解析失败", "working");
    showView("reader");
    showReaderError(error.message || "文件读取失败。");
  }
}

async function saveDocumentNotes() {
  const doc = documentState.current;
  if (!doc) return;

  rememberCurrentNotes();
  const baseName = doc.meta.name.replace(/\.[^.]+$/, "");
  await saveTextFile(`${baseName}-MindStudy-notes.md`, buildDocumentMarkdown());
}

async function exportAnnotatedPdf() {
  const doc = documentState.current;
  if (!doc || doc.kind !== "pdf") return;

  if (!window.PDFLib) throw new Error("PDF 编辑库未加载，请重新运行 npm install。");

  rememberCurrentNotes();

  const { PDFDocument, StandardFonts, rgb } = window.PDFLib;
  const pdfDoc = await PDFDocument.load(doc.bytes);
  const pages = pdfDoc.getPages();
  const firstPage = pages[0];
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const { width } = firstPage.getSize();
  const safeNote = doc.meta.notes
    ? `MindStudy annotated copy. Note length: ${doc.meta.notes.length} chars.`
    : "MindStudy annotated copy.";

  firstPage.drawText(safeNote, {
    x: 36,
    y: 28,
    size: 10,
    font,
    color: rgb(0.09, 0.32, 0.29),
    maxWidth: width - 72,
  });
  drawInkStrokesOnPdf(pdfDoc, getPdfInkStrokes(doc), rgb);

  const editedBytes = await pdfDoc.save();
  const baseName = doc.meta.name.replace(/\.pdf$/i, "");
  await saveBinaryFile(`${baseName}-MindStudy-annotated.pdf`, editedBytes, [
    { name: "PDF", extensions: ["pdf"] },
  ]);

  if (doc.meta.notes) {
    await saveTextFile(`${baseName}-MindStudy-notes.md`, buildDocumentMarkdown());
  }
}

async function addPdfPage() {
  const doc = documentState.current;
  if (!doc || doc.kind !== "pdf") return;

  if (!window.PDFLib) throw new Error("PDF 编辑库未加载，请重新运行 npm install。");

  rememberCurrentNotes();
  setParseStatus("编辑中", "working");

  const { PDFDocument } = window.PDFLib;
  const pdfDoc = await PDFDocument.load(doc.bytes);
  const targetIndex = getPdfTargetPage(doc) - 1;
  const basePage = pdfDoc.getPage(targetIndex);
  const { width, height } = basePage.getSize();

  if (typeof pdfDoc.insertPage === "function") {
    pdfDoc.insertPage(targetIndex + 1, [width, height]);
  } else {
    pdfDoc.addPage([width, height]);
  }

  const editedBytes = await pdfDoc.save();
  updatePdfBytes(doc, editedBytes, pdfDoc.getPageCount());
  doc.activePdfPage = Math.min(targetIndex + 2, doc.pageCount);
  renderPdfReader(doc);
}

function openDeletePdfPageDialog() {
  const doc = documentState.current;
  if (!doc || doc.kind !== "pdf") return;

  const pageNumber = getPdfTargetPage(doc);
  closeModal();

  document.body.insertAdjacentHTML(
    "beforeend",
    `
      <div class="modal-backdrop" data-modal="delete-pdf-page">
        <section class="confirm-modal" role="dialog" aria-modal="true" aria-labelledby="delete-pdf-page-title">
          <div class="modal-heading">
            <div>
              <span class="tag muted">PDF 编辑</span>
              <h2 id="delete-pdf-page-title">删除第 ${pageNumber} 页？</h2>
            </div>
            <button class="icon-button light" data-modal-action="close" title="关闭">
              <i data-lucide="x"></i>
            </button>
          </div>
          <p>这只会删除当前 PDF 副本中的页面，不会删除电脑上的原始文件。导出后可得到新的 PDF。</p>
          <div class="modal-actions">
            <button type="button" class="ghost-action compact" data-modal-action="close">取消</button>
            <button type="button" class="danger-action compact" data-confirm-delete-pdf-page="${pageNumber}">删除页面</button>
          </div>
        </section>
      </div>
    `,
  );

  window.lucide?.createIcons();
}

async function deletePdfPage() {
  const doc = documentState.current;
  if (!doc || doc.kind !== "pdf") return;

  if (!window.PDFLib) throw new Error("PDF 编辑库未加载，请重新运行 npm install。");

  rememberCurrentNotes();
  setParseStatus("编辑中", "working");

  const { PDFDocument } = window.PDFLib;
  const pdfDoc = await PDFDocument.load(doc.bytes);
  const pageCount = pdfDoc.getPageCount();

  if (pageCount <= 1) {
    closeModal();
    setParseStatus("至少保留 1 页", "working");
    return;
  }

  const targetIndex = getPdfTargetPage(doc) - 1;
  pdfDoc.removePage(targetIndex);
  const editedBytes = await pdfDoc.save();
  updatePdfBytes(doc, editedBytes, pdfDoc.getPageCount());
  doc.activePdfPage = Math.min(targetIndex + 1, doc.pageCount);
  closeModal();
  renderPdfReader(doc);
}

async function insertImageIntoPdf() {
  const doc = documentState.current;
  if (!doc || doc.kind !== "pdf") return;

  if (!window.PDFLib) throw new Error("PDF 编辑库未加载，请重新运行 npm install。");

  const imageFile = await openImageFilePicker();
  if (!imageFile) return;

  const isPng = imageFile.mimeType === "image/png" || /\.png$/i.test(imageFile.name);
  const isJpeg = imageFile.mimeType === "image/jpeg" || /\.jpe?g$/i.test(imageFile.name);

  if (!isPng && !isJpeg) {
    setParseStatus("仅支持 PNG/JPG", "working");
    return;
  }

  rememberCurrentNotes();
  setParseStatus("插入图片中", "working");

  const { PDFDocument } = window.PDFLib;
  const pdfDoc = await PDFDocument.load(doc.bytes);
  const imageBytes = base64ToUint8Array(imageFile.base64);
  const embeddedImage = isPng ? await pdfDoc.embedPng(imageBytes) : await pdfDoc.embedJpg(imageBytes);
  const page = pdfDoc.getPage(getPdfTargetPage(doc) - 1);
  const { width, height } = page.getSize();
  const maxWidth = width * 0.56;
  const maxHeight = height * 0.44;
  const scale = Math.min(maxWidth / embeddedImage.width, maxHeight / embeddedImage.height, 1);
  const imageWidth = embeddedImage.width * scale;
  const imageHeight = embeddedImage.height * scale;

  page.drawImage(embeddedImage, {
    x: (width - imageWidth) / 2,
    y: (height - imageHeight) / 2,
    width: imageWidth,
    height: imageHeight,
  });

  const editedBytes = await pdfDoc.save();
  updatePdfBytes(doc, editedBytes, pdfDoc.getPageCount(), { keepTextExtraction: true });
  renderPdfReader(doc);
}

function applySlideEdit() {
  const doc = documentState.current;
  const editor = document.querySelector("#slide-editor");
  if (!doc || doc.kind !== "pptx" || !editor) return;

  doc.slides[doc.activeSlideIndex].editedText = editor.value;
  rememberCurrentNotes();
  renderPptxReader();
}

async function exportEditedPptx() {
  const doc = documentState.current;
  if (!doc || doc.kind !== "pptx") return;

  applySlideEdit();

  const zip = await window.JSZip.loadAsync(doc.arrayBuffer.slice(0));

  for (const slide of doc.slides) {
    zip.file(slide.fileName, replaceSlideText(slide.originalXml, slide.editedText));
  }

  const editedBytes = await zip.generateAsync({ type: "uint8array" });
  const baseName = doc.meta.name.replace(/\.pptx$/i, "");
  await saveBinaryFile(`${baseName}-MindStudy-edited.pptx`, editedBytes, [
    { name: "PowerPoint", extensions: ["pptx"] },
  ]);
}

function moveSlide(direction) {
  const doc = documentState.current;
  if (!doc || doc.kind !== "pptx") return;

  rememberCurrentNotes();
  doc.activeSlideIndex = Math.min(doc.slides.length - 1, Math.max(0, doc.activeSlideIndex + direction));
  renderPptxReader();
}

function applyMarkdownEdit() {
  const doc = documentState.current;
  const editor = document.querySelector("#markdown-editor");
  if (!doc || doc.kind !== "md" || !editor) return;

  doc.editedText = editor.value;
  doc.meta.editedText = editor.value;
  saveWorkspace();
  renderMarkdownReader(doc);
}

async function saveMarkdownOriginal() {
  const doc = documentState.current;
  const editor = document.querySelector("#markdown-editor");
  if (!doc || doc.kind !== "md") return;

  const content = editor?.value ?? doc.editedText;
  doc.editedText = content;
  doc.meta.editedText = content;
  saveWorkspace();

  if (doc.meta.path && window.mindStudy?.saveMarkdown) {
    await window.mindStudy.saveMarkdown({ path: doc.meta.path, data: content });
    return;
  }

  await saveTextFile(doc.meta.name, content);
}

async function saveMarkdownCopy() {
  const doc = documentState.current;
  const editor = document.querySelector("#markdown-editor");
  if (!doc || doc.kind !== "md") return;

  const content = editor?.value ?? doc.editedText;
  doc.editedText = content;
  doc.meta.editedText = content;
  saveWorkspace();
  const baseName = doc.meta.name.replace(/\.md$/i, "");
  await saveTextFile(`${baseName}-MindStudy-edited.md`, content);
}

function closeModal() {
  document.querySelector(".modal-backdrop")?.remove();
}

function openCourseDialog(mode) {
  closeModal();

  const isEdit = mode === "edit";
  const course = getActiveCourse();
  const titleText = isEdit ? "编辑课程" : "新建课程";
  const name = isEdit ? course.name : "新课程";
  const description = isEdit ? course.description || "" : "课程资料复习中";

  document.body.insertAdjacentHTML(
    "beforeend",
    `
      <div class="modal-backdrop" data-modal="course">
        <section class="course-modal" role="dialog" aria-modal="true" aria-labelledby="course-modal-title">
          <div class="modal-heading">
            <div>
              <span class="tag muted">课程资料库</span>
              <h2 id="course-modal-title">${titleText}</h2>
            </div>
            <button class="icon-button light" data-modal-action="close" title="关闭">
              <i data-lucide="x"></i>
            </button>
          </div>
          <form class="course-form" id="course-form" data-course-mode="${mode}">
            <label>
              <span>课程名称</span>
              <input id="course-name-input" name="courseName" type="text" value="${escapeHtml(name)}" maxlength="32" required />
            </label>
            <label>
              <span>课程说明</span>
              <textarea id="course-description-input" name="courseDescription" rows="3" maxlength="80">${escapeHtml(description)}</textarea>
            </label>
            <div class="modal-actions">
              <button type="button" class="ghost-action compact" data-modal-action="close">取消</button>
              <button type="submit" class="primary-action compact">${isEdit ? "保存课程" : "创建课程"}</button>
            </div>
          </form>
        </section>
      </div>
    `,
  );

  window.lucide?.createIcons();
  document.querySelector("#course-name-input")?.focus();
}

function submitCourseForm(event) {
  event.preventDefault();

  const form = event.target;
  const nameInput = form.elements.courseName;
  const descriptionInput = form.elements.courseDescription;
  const name = nameInput.value.trim();
  const description = descriptionInput.value.trim();

  if (!name) {
    nameInput.focus();
    return;
  }

  if (form.dataset.courseMode === "edit") {
    const course = getActiveCourse();
    course.name = name;
    course.description = description;
    saveWorkspace();
    closeModal();
    renderAllCourseViews();
    return;
  }

  const course = {
    id: createId("course"),
    name,
    description,
    documents: [],
    activeDocumentId: "",
    createdAt: Date.now(),
  };

  workspace.courses.unshift(course);
  workspace.activeCourseId = course.id;
  documentState.current = null;
  saveWorkspace();
  closeModal();
  renderAllCourseViews();
  showView("reader");
}

function createCourse() {
  openCourseDialog("create");
}

function renameCourse() {
  const course = getActiveCourse();
  if (!course) return;
  openCourseDialog("edit");
}

function openDeleteDocumentDialog(documentId) {
  closeModal();

  const course = getActiveCourse();
  const meta = course.documents.find((documentMeta) => documentMeta.id === documentId);
  if (!meta) return;

  document.body.insertAdjacentHTML(
    "beforeend",
    `
      <div class="modal-backdrop" data-modal="delete-document">
        <section class="confirm-modal" role="dialog" aria-modal="true" aria-labelledby="delete-document-title">
          <div class="modal-heading">
            <div>
              <span class="tag muted">移除资料</span>
              <h2 id="delete-document-title">从当前课程移除？</h2>
            </div>
            <button class="icon-button light" data-modal-action="close" title="关闭">
              <i data-lucide="x"></i>
            </button>
          </div>
          <p>“${escapeHtml(meta.name)}” 会从 ${escapeHtml(course.name)} 的资料库中移除，本地原文件不会被删除。</p>
          <div class="modal-actions">
            <button type="button" class="ghost-action compact" data-modal-action="close">取消</button>
            <button type="button" class="danger-action compact" data-confirm-delete-document="${meta.id}">移除资料</button>
          </div>
        </section>
      </div>
    `,
  );

  window.lucide?.createIcons();
}

function removeDocument(documentId) {
  const course = getActiveCourse();
  const removedDocument = course.documents.find((documentMeta) => documentMeta.id === documentId);
  if (!removedDocument) return;

  const wasActive = course.activeDocumentId === documentId;
  course.documents = course.documents.filter((documentMeta) => documentMeta.id !== documentId);
  runtimeFiles.delete(documentId);

  if (wasActive) {
    course.activeDocumentId = course.documents[0]?.id || "";
    documentState.current = null;
  }

  saveWorkspace();
  closeModal();
  renderAllCourseViews();

  if (wasActive && course.activeDocumentId) {
    loadDocumentById(course.activeDocumentId);
    return;
  }

  if (!course.documents.length) {
    setParseStatus("待导入", "working");
    showReaderEmpty();
    return;
  }

  renderDocumentLibrary();
}

function switchCourse(courseId) {
  rememberCurrentNotes();
  workspace.activeCourseId = courseId;
  const course = getActiveCourse();
  course.activeDocumentId = course.activeDocumentId || course.documents[0]?.id || "";
  documentState.current = null;
  saveWorkspace();
  renderAllCourseViews();
  if (course.activeDocumentId) {
    loadDocumentById(course.activeDocumentId);
  } else {
    showReaderEmpty();
  }
}

function renderAllCourseViews() {
  renderCourseSwitcher();
  renderDocumentLibrary();
  updateDashboardForCourse();
}

navItems.forEach((item) => {
  item.addEventListener("click", () => showView(item.dataset.view));
});

document.querySelectorAll("[data-view-jump]").forEach((item) => {
  item.addEventListener("click", () => showView(item.dataset.viewJump));
});

document.querySelectorAll(".prompt-chip").forEach((chip) => {
  chip.addEventListener("click", () => {
    const chatList = document.querySelector("#chat-list");
    const userBubble = document.createElement("div");
    const aiBubble = document.createElement("div");
    userBubble.className = "chat-bubble user";
    aiBubble.className = "chat-bubble ai";
    userBubble.textContent = chip.dataset.prompt;
    aiBubble.textContent = "已根据当前课程资料整理好回答，并自动标记可加入笔记的重点句。";
    chatList.append(userBubble, aiBubble);
    chatList.scrollTop = chatList.scrollHeight;
  });
});

document.querySelectorAll(".node").forEach((node) => {
  node.addEventListener("click", () => {
    const nodeName = node.dataset.node;
    const nodeTitle = document.querySelector("#node-title");
    const nodeDesc = document.querySelector("#node-desc");
    const mastery = document.querySelector(".mastery-bar span");

    if (!nodeTitle || !nodeDesc || !mastery) {
      showView("map");
      return;
    }

    nodeTitle.textContent = nodeName;
    nodeDesc.textContent = nodeContent[nodeName] || "该知识点已加入当前课程结构，可继续生成解释、例题和复习题。";
    mastery.style.width = node.classList.contains("weak") ? "46%" : "78%";
    showView("map");
  });
});

document.querySelectorAll(".answer-option").forEach((option) => {
  option.addEventListener("click", () => {
    document.querySelectorAll(".answer-option").forEach((item) => item.classList.remove("selected"));
    option.classList.add("selected");
    const feedback = document.querySelector("#answer-feedback");
    const isCorrect = option.textContent.includes("用户主观评分");
    feedback.textContent = isCorrect
      ? "回答正确。满意度更偏向用户主观评价，常通过问卷、评分和访谈反馈获得。"
      : "这个选项更接近效率或性能指标。满意度通常来自用户主观评分和反馈。";
    feedback.style.background = isCorrect ? "var(--teal-soft)" : "var(--coral-soft)";
    feedback.style.color = isCorrect ? "var(--teal)" : "var(--coral)";
  });
});

document.addEventListener("change", (event) => {
  if (event.target.matches(".course-select")) {
    switchCourse(event.target.value);
  }

  if (event.target.matches("#pdf-target-page")) {
    const doc = documentState.current;
    if (doc?.kind === "pdf") {
      setActivePdfPage(doc, Number(event.target.value));
    }
  }

  if (event.target.matches("#pdf-ink-color")) {
    pdfInkState.color = event.target.value || pdfInkState.color;
    syncPdfInkUi();
  }
});

document.addEventListener("input", (event) => {
  if (event.target.matches("#document-notes, #markdown-editor, #slide-editor")) {
    window.clearTimeout(event.target.dataset.saveTimer);
    event.target.dataset.saveTimer = window.setTimeout(rememberCurrentNotes, 250);
  }

  if (event.target.matches("#ai-reading-source")) {
    const doc = documentState.current;
    if (doc) {
      if (doc.kind === "pdf") {
        const pageKey = getPdfPageKey(doc);
        doc.meta.aiSourcesByPage = doc.meta.aiSourcesByPage || {};
        doc.meta.aiSourcesByPage[pageKey] = event.target.value;
        doc.meta.aiSource = event.target.value;
      } else {
        doc.meta.aiSource = event.target.value;
      }
      window.clearTimeout(event.target.dataset.saveTimer);
      event.target.dataset.saveTimer = window.setTimeout(saveWorkspace, 250);
    }
  }

  if (event.target.matches("#pdf-ink-width")) {
    pdfInkState.width = Number(event.target.value) || pdfInkState.width;
    syncPdfInkUi();
  }
});

document.addEventListener("pointerdown", beginPdfInkStroke);
document.addEventListener("pointermove", updatePdfInkStroke);
document.addEventListener("pointerup", finishPdfInkStroke);
document.addEventListener("pointercancel", finishPdfInkStroke);

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    exitReaderFullscreenFallback();
  }
});

document.addEventListener("submit", (event) => {
  if (event.target.matches("#course-form")) {
    submitCourseForm(event);
  }
});

document.addEventListener("click", (event) => {
  const modalCloseButton = event.target.closest("[data-modal-action='close']");
  const modalBackdrop = event.target.matches(".modal-backdrop");
  const deleteDocumentButton = event.target.closest("[data-delete-document-id]");
  const confirmDeleteDocumentButton = event.target.closest("[data-confirm-delete-document]");
  const confirmDeletePdfPageButton = event.target.closest("[data-confirm-delete-pdf-page]");
  const documentButton = event.target.closest("[data-document-id]");
  const slideButton = event.target.closest("[data-slide-index]");
  const slideMoveButton = event.target.closest("[data-slide-move]");
  const pdfPageStepButton = event.target.closest("[data-pdf-page-step]");
  const actionButton = event.target.closest("button");

  if (modalCloseButton || modalBackdrop) {
    closeModal();
    return;
  }

  if (confirmDeletePdfPageButton) {
    deletePdfPage();
    return;
  }

  if (confirmDeleteDocumentButton) {
    removeDocument(confirmDeleteDocumentButton.dataset.confirmDeleteDocument);
    return;
  }

  if (deleteDocumentButton) {
    openDeleteDocumentDialog(deleteDocumentButton.dataset.deleteDocumentId);
    return;
  }

  if (documentButton) {
    loadDocumentById(documentButton.dataset.documentId);
    return;
  }

  if (slideButton) {
    const doc = documentState.current;
    if (doc?.kind === "pptx") {
      rememberCurrentNotes();
      doc.activeSlideIndex = Number(slideButton.dataset.slideIndex);
      renderPptxReader();
    }
    return;
  }

  if (slideMoveButton) {
    moveSlide(Number(slideMoveButton.dataset.slideMove));
    return;
  }

  if (pdfPageStepButton) {
    const doc = documentState.current;
    if (doc?.kind === "pdf") {
      setActivePdfPage(doc, (doc.activePdfPage || 1) + Number(pdfPageStepButton.dataset.pdfPageStep || 0));
    }
    return;
  }

  if (!actionButton) return;

  if (actionButton.dataset.courseAction === "create") createCourse();
  if (actionButton.dataset.courseAction === "rename") renameCourse();
  if (actionButton.id === "toggle-reader-fullscreen") toggleReaderFullscreen();
  if (actionButton.id === "toggle-camera") toggleCamera();
  if (actionButton.id === "start-camera") startCamera();
  if (actionButton.id === "stop-camera") stopCamera();
  if (actionButton.id === "simulate-upload" || actionButton.id === "library-import") handleCourseImport();
  if (actionButton.id === "save-document-notes" || actionButton.id === "save-notes-top") saveDocumentNotes();
  if (actionButton.id === "export-annotated-pdf") exportAnnotatedPdf();
  if (actionButton.id === "insert-pdf-image") insertImageIntoPdf();
  if (actionButton.id === "add-pdf-page") addPdfPage();
  if (actionButton.id === "delete-pdf-page") openDeletePdfPageDialog();
  if (actionButton.id === "toggle-pdf-ink") {
    pdfInkState.enabled = !pdfInkState.enabled;
    syncPdfInkUi();
  }
  if (actionButton.id === "undo-pdf-ink") undoPdfInkStroke();
  if (actionButton.id === "clear-pdf-ink-page") clearCurrentPdfInkPage();
  if (actionButton.id === "apply-pdf-ink") applyPdfInkToCurrentPdf();
  if (actionButton.id === "ai-analyze-reading") updateAiReadingOutput("analyze");
  if (actionButton.id === "ai-translate-reading") updateAiReadingOutput("translate");
  if (actionButton.id === "extract-pdf-text") {
    const doc = documentState.current;
    if (doc?.kind === "pdf") extractCurrentPdfPageText(doc, { force: true });
  }
  if (actionButton.id === "apply-slide-edit") applySlideEdit();
  if (actionButton.id === "export-edited-pptx") exportEditedPptx();
  if (actionButton.id === "apply-markdown-edit") applyMarkdownEdit();
  if (actionButton.id === "save-markdown-original") saveMarkdownOriginal();
  if (actionButton.id === "save-markdown-copy") saveMarkdownCopy();
});

window.addEventListener("DOMContentLoaded", () => {
  renderAllCourseViews();
  setCameraStatus("idle");

  if (getActiveDocumentMeta()) {
    renderDocumentLibrary();
  } else {
    showReaderEmpty();
  }

  window.lucide?.createIcons();

  window.mindStudy?.getAppInfo?.().then((info) => {
    document.body.dataset.platform = info.platform;
  });
});

document.addEventListener("fullscreenchange", syncFullscreenButton);
window.addEventListener("beforeunload", stopCamera);
