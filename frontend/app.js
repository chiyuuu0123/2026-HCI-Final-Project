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
      return stored;
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
  if (normalized === "PPTX") return "pptx";
  if (normalized === "PPT") return "ppt";
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

function uint8ArrayToBase64(bytes) {
  let binary = "";
  const chunkSize = 0x8000;

  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize));
  }

  return window.btoa(binary);
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
    input.accept = ".pdf,.ppt,.pptx,.md,application/pdf,text/markdown,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation";

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
      : "当前课程还没有资料，请先导入 PDF、PPTX 或 Markdown。";
  }

  updateImportedFileCard(activeMeta, activeMeta ? ["已加入课程资料库", activeMeta.path ? "已保存本机路径" : "临时导入"] : []);
}

function renderDocumentLibrary() {
  const activeCourse = getActiveCourse();
  const activeDocId = activeCourse.activeDocumentId;
  const doc = documentState.current;
  const isActivePptx = doc?.kind === "pptx";

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
          : `<div class="library-empty">还没有资料。点击右上角或此处上传 PDF、PPTX、PPT、MD。</div>`
      }
    </div>
    ${
      isActivePptx
        ? `
          <div class="slide-list-heading">当前 PPTX 页面</div>
          <div class="slide-list">
            ${doc.slides
              .map(
                (slide, index) => `
                  <button class="chapter ${index === doc.activeSlideIndex ? "active" : ""}" data-slide-index="${index}">
                    ${index + 1}. ${escapeHtml(slide.title || `Slide ${index + 1}`)}
                  </button>
                `,
              )
              .join("")}
          </div>
        `
        : ""
    }
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
    <p class="summary-text">支持 PDF 阅读批注、PPTX 文字解析编辑、Markdown 阅读编辑。旧版 PPT 会提示转为 PPTX。</p>
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

function buildDocumentMarkdown() {
  const doc = documentState.current;
  if (!doc) return "# MindStudy 学习笔记\n\n当前没有导入资料。\n";

  const notes = document.querySelector("#document-notes")?.value || doc.meta.notes || "";
  const slideSummary =
    doc.kind === "pptx"
      ? doc.slides
          .map((slide, index) => `## 第 ${index + 1} 页：${slide.title}\n\n${slide.editedText || slide.text}`)
          .join("\n\n")
      : "";

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
    "",
    slideSummary,
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

  if (doc.kind === "pptx") {
    doc.meta.editedSlides = doc.slides.map((slide) => slide.editedText || slide.text);
  }

  saveWorkspace();
}

function renderPdfReader(doc) {
  renderDocumentLibrary();
  readerPanels.document.innerHTML = `
    <div class="doc-toolbar">
      <span>${escapeHtml(doc.meta.name)} · ${escapeHtml(formatBytes(doc.meta.size))}</span>
      <div>
        <button class="mini-button" id="save-notes-top">
          <i data-lucide="save"></i>
          <span>保存笔记</span>
        </button>
      </div>
    </div>
    <iframe class="pdf-frame" title="${escapeHtml(doc.meta.name)}" src="${doc.blobUrl}"></iframe>
  `;
  readerPanels.insight.innerHTML = `
    <div class="panel-heading">
      <div>
        <span class="tag muted">PDF 批注</span>
        <h3>阅读与编辑</h3>
      </div>
    </div>
    <p class="summary-text">已载入 PDF 阅读器。右侧批注会保存在当前课程资料库中，并可导出 Markdown 或 PDF 副本。</p>
    <textarea id="document-notes" class="document-editor" placeholder="在这里写 PDF 批注、复习重点或待提问的问题...">${escapeHtml(doc.meta.notes || "")}</textarea>
    <button class="primary-action full" id="save-document-notes">
      <i data-lucide="save"></i>
      <span>保存学习笔记</span>
    </button>
    <button class="ghost-action full" id="export-annotated-pdf">
      <i data-lucide="file-output"></i>
      <span>导出批注 PDF</span>
    </button>
    <p class="small-hint">说明：MindStudy 保存本机路径，重启后无需重新上传；如果原文件被移动，需要重新导入。</p>
  `;
  window.lucide?.createIcons();
}

function renderMarkdownReader(doc) {
  renderDocumentLibrary();
  readerPanels.document.innerHTML = `
    <div class="doc-toolbar">
      <span>${escapeHtml(doc.meta.name)} · Markdown 阅读</span>
      <div>
        <button class="mini-button" id="save-markdown-original">
          <i data-lucide="save"></i>
          <span>保存原文件</span>
        </button>
      </div>
    </div>
    <div class="markdown-preview">
      ${renderMarkdownPreview(doc.editedText || doc.text)}
    </div>
  `;
  readerPanels.insight.innerHTML = `
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
}

function renderUnsupportedPowerPoint(doc) {
  renderDocumentLibrary();
  readerPanels.document.innerHTML = `
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
}

function renderPptxReader() {
  const doc = documentState.current;
  const activeSlide = doc.slides[doc.activeSlideIndex];
  const slideLines = (activeSlide.editedText || activeSlide.text)
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean);

  renderDocumentLibrary();
  readerPanels.document.innerHTML = `
    <div class="doc-toolbar">
      <span>第 ${doc.activeSlideIndex + 1} / ${doc.slides.length} 页 · ${escapeHtml(doc.meta.name)}</span>
      <div>
        <button class="icon-button" title="上一页" data-slide-move="-1"><i data-lucide="chevron-left"></i></button>
        <button class="icon-button" title="下一页" data-slide-move="1"><i data-lucide="chevron-right"></i></button>
      </div>
    </div>
    <div class="slide-canvas pptx-canvas">
      <span class="slide-kicker">PowerPoint Slide ${doc.activeSlideIndex + 1}</span>
      <h2>${escapeHtml(slideLines[0] || activeSlide.title || "未命名页面")}</h2>
      <div class="pptx-line-list">
        ${slideLines
          .slice(1)
          .map((line) => `<p>${escapeHtml(line)}</p>`)
          .join("")}
      </div>
      <div class="highlight-strip">
        <span>右侧可以编辑当前页文字，并导出新的 PPTX 副本。</span>
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
  const slideFiles = Object.keys(zip.files)
    .filter((fileName) => /^ppt\/slides\/slide\d+\.xml$/.test(fileName))
    .sort((first, second) => Number(first.match(/\d+/)[0]) - Number(second.match(/\d+/)[0]));

  const slides = [];

  for (const [index, slideFile] of slideFiles.entries()) {
    const xml = await zip.file(slideFile).async("string");
    const text = extractSlideText(xml);
    const title = text.split(/\n+/).find(Boolean) || slideFile.replace("ppt/slides/", "").replace(".xml", "");

    slides.push({
      fileName: slideFile,
      originalXml: xml,
      title,
      text: text || "该页没有提取到文字内容。",
      editedText: meta.editedSlides?.[index] || text || "该页没有提取到文字内容。",
    });
  }

  documentState.current = {
    kind: "pptx",
    meta,
    file,
    arrayBuffer,
    slides,
    activeSlideIndex: 0,
  };

  meta.slideCount = slides.length;
  updateImportedFileCard(meta, [`${slides.length} 页幻灯片`, "已提取文字", meta.path ? "已保存路径" : "临时导入"]);
  renderPptxReader();
}

async function loadPdfDocument(file, meta) {
  const bytes = base64ToUint8Array(file.base64);
  const blob = new Blob([bytes], { type: "application/pdf" });
  const blobUrl = URL.createObjectURL(blob);

  documentState.current = {
    kind: "pdf",
    meta,
    file,
    bytes,
    blobUrl,
  };

  updateImportedFileCard(meta, ["PDF 阅读器", "支持批注笔记", meta.path ? "已保存路径" : "临时导入"]);
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
    } else if (kind === "pptx") {
      await loadPptxDocument(file, meta);
    } else if (kind === "ppt") {
      await loadUnsupportedPpt(file, meta);
    } else if (kind === "md") {
      await loadMarkdownDocument(file, meta);
    } else {
      throw new Error("暂不支持该文件格式。");
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
    editedSlides: null,
    addedAt: Date.now(),
    updatedAt: file.updatedAt || Date.now(),
  };
}

async function handleCourseImport() {
  try {
    const files = await selectCourseFiles();
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
  const documentButton = event.target.closest("[data-document-id]");
  const slideButton = event.target.closest("[data-slide-index]");
  const slideMoveButton = event.target.closest("[data-slide-move]");
  const actionButton = event.target.closest("button");

  if (modalCloseButton || modalBackdrop) {
    closeModal();
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
  if (actionButton.id === "simulate-upload" || actionButton.id === "library-import") handleCourseImport();
  if (actionButton.id === "save-document-notes" || actionButton.id === "save-notes-top") saveDocumentNotes();
  if (actionButton.id === "export-annotated-pdf") exportAnnotatedPdf();
  if (actionButton.id === "apply-slide-edit") applySlideEdit();
  if (actionButton.id === "export-edited-pptx") exportEditedPptx();
  if (actionButton.id === "apply-markdown-edit") applyMarkdownEdit();
  if (actionButton.id === "save-markdown-original") saveMarkdownOriginal();
  if (actionButton.id === "save-markdown-copy") saveMarkdownCopy();
});

window.addEventListener("DOMContentLoaded", () => {
  renderAllCourseViews();

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
