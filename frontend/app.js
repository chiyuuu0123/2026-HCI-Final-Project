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
const cameraState = {
  stream: null,
  sampleTimer: null,
  canvas: null,
  lastBrightness: 0,
};

let workspace = loadWorkspace();

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
  const button = document.querySelector("#toggle-reader-fullscreen");
  if (!button) return;

  const isReaderFullscreen = document.fullscreenElement?.classList.contains("reader-layout");
  button.innerHTML = isReaderFullscreen
    ? `<i data-lucide="minimize-2"></i><span>退出全屏</span>`
    : `<i data-lucide="maximize-2"></i><span>全屏阅读</span>`;
  window.lucide?.createIcons();
}

async function toggleReaderFullscreen() {
  const readerLayout = document.querySelector(".reader-layout");
  if (!readerLayout) return;

  if (document.fullscreenElement) {
    await document.exitFullscreen();
    return;
  }

  await readerLayout.requestFullscreen();
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
  return pageNumber;
}

function updatePdfBytes(doc, bytes, pageCount) {
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
  doc.activePdfPage = Math.min(doc.activePdfPage || 1, pageCount);
  runtimeFiles.set(doc.meta.id, doc.file);
  saveWorkspace();
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
    return "请先输入或粘贴当前阅读内容。Markdown 会自动带入正文；PDF 可以复制当前页文字到这里。";
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
  const sourceText = doc.meta.aiSource || getCurrentReadingText(doc);
  const output = doc.meta.aiOutput || analyzeReadingText(sourceText);
  const placeholder =
    doc.kind === "pdf"
      ? "PDF 页面文字无法稳定自动抓取。可以复制当前页的英文段落或重点内容粘贴到这里，AI 阅读窗口会帮你解析和翻译。"
      : "这里会自动带入当前 Markdown 正文，也可以手动修改需要解析或翻译的段落。";

  return `
    <section class="ai-reading-card">
      <div class="panel-heading compact-heading">
        <div>
          <span class="tag muted">AI 阅读窗口</span>
          <h3>解析与翻译</h3>
        </div>
      </div>
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
  doc.meta.aiSource = source;
  doc.meta.aiOutput = result;
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
  doc.activePdfPage = Math.min(doc.activePdfPage || 1, pageCount);
  renderDocumentLibrary();
  readerPanels.document.innerHTML = `
    <div class="doc-toolbar">
      <span>${escapeHtml(doc.meta.name)} · ${escapeHtml(formatBytes(doc.meta.size))} · ${pageCount} 页</span>
      <div class="toolbar-actions">
        <button class="mini-button" id="save-notes-top">
          <i data-lucide="save"></i>
          <span>保存笔记</span>
        </button>
        ${getReaderFullscreenButtonMarkup()}
      </div>
    </div>
    <iframe class="pdf-frame" title="${escapeHtml(doc.meta.name)}" src="${doc.blobUrl}"></iframe>
  `;
  readerPanels.insight.innerHTML = `
    ${renderAiReadingWindow(doc)}
    <div class="panel-heading">
      <div>
        <span class="tag muted">PDF 批注</span>
        <h3>阅读与编辑</h3>
      </div>
    </div>
    <p class="summary-text">已载入 PDF 阅读器。这里可以写批注，也可以对当前 PDF 副本插入图片、添加空白页或删除指定页面。</p>
    <div class="pdf-toolbox">
      <label class="pdf-page-control">
        <span>目标页</span>
        <input id="pdf-target-page" type="number" min="1" max="${pageCount}" value="${doc.activePdfPage}" />
        <small>/ ${pageCount}</small>
      </label>
      <button class="ghost-action full" id="insert-pdf-image">
        <i data-lucide="image-plus"></i>
        <span>插入图片到目标页</span>
      </button>
      <button class="ghost-action full" id="add-pdf-page">
        <i data-lucide="file-plus-2"></i>
        <span>在目标页后加空白页</span>
      </button>
      <button class="danger-action full" id="delete-pdf-page">
        <i data-lucide="trash-2"></i>
        <span>删除目标页</span>
      </button>
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
  syncFullscreenButton();
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

  if (window.PDFLib) {
    try {
      const pdfDoc = await window.PDFLib.PDFDocument.load(bytes);
      pageCount = pdfDoc.getPageCount();
    } catch {
      pageCount = meta.pageCount || 1;
    }
  }

  documentState.current = {
    kind: "pdf",
    meta,
    file,
    bytes,
    blobUrl,
    pageCount,
    activePdfPage: 1,
  };

  meta.pageCount = pageCount;
  updateImportedFileCard(meta, ["PDF 阅读器", `${pageCount} 页`, "支持高级编辑", meta.path ? "已保存路径" : "临时导入"]);
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
  setParseStatus("已编辑", "ready");
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
  setParseStatus("已编辑", "ready");
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
  updatePdfBytes(doc, editedBytes, pdfDoc.getPageCount());
  setParseStatus("已插入图片", "ready");
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
});

document.addEventListener("input", (event) => {
  if (event.target.matches("#document-notes, #markdown-editor, #slide-editor")) {
    window.clearTimeout(event.target.dataset.saveTimer);
    event.target.dataset.saveTimer = window.setTimeout(rememberCurrentNotes, 250);
  }

  if (event.target.matches("#ai-reading-source")) {
    const doc = documentState.current;
    if (doc) {
      doc.meta.aiSource = event.target.value;
      window.clearTimeout(event.target.dataset.saveTimer);
      event.target.dataset.saveTimer = window.setTimeout(saveWorkspace, 250);
    }
  }

  if (event.target.matches("#pdf-target-page")) {
    const doc = documentState.current;
    if (doc?.kind === "pdf") {
      doc.activePdfPage = getPdfTargetPage(doc);
    }
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
  if (actionButton.id === "ai-analyze-reading") updateAiReadingOutput("analyze");
  if (actionButton.id === "ai-translate-reading") updateAiReadingOutput("translate");
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
