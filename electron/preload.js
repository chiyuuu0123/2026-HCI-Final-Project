const { contextBridge, ipcRenderer, webFrame } = require("electron");

contextBridge.exposeInMainWorld("mindStudy", {
  getAppInfo: () => ipcRenderer.invoke("app:get-info"),
  wakeMainWindow: () => ipcRenderer.send("companion:wake-main"),
  setCompanionMode: (mode) => ipcRenderer.invoke("companion:set-mode", mode),
  getCompanionBounds: () => ipcRenderer.invoke("companion:get-bounds"),
  moveCompanionTo: (bounds) => ipcRenderer.send("companion:move-to", bounds),
  askLonglongCompanion: (request) => ipcRenderer.invoke("companion:ask-longlong", request),
  updateCompanionSnapshot: (snapshot) => ipcRenderer.send("companion:update-snapshot", snapshot),
  hideCompanion: () => ipcRenderer.send("companion:hide"),
  getStudyTimer: () => ipcRenderer.invoke("study-timer:get"),
  onStudyTimerUpdate: (callback) => {
    const listener = (event, snapshot) => callback(snapshot);
    ipcRenderer.on("study-timer:update", listener);
    return () => ipcRenderer.removeListener("study-timer:update", listener);
  },
  onCompanionSnapshot: (callback) => {
    const listener = (event, snapshot) => callback(snapshot);
    ipcRenderer.on("companion:snapshot", listener);
    return () => ipcRenderer.removeListener("companion:snapshot", listener);
  },
  onCompanionMode: (callback) => {
    const listener = (event, mode) => callback(mode);
    ipcRenderer.on("companion:mode", listener);
    return () => ipcRenderer.removeListener("companion:mode", listener);
  },
  onCompanionDragMotion: (callback) => {
    const listener = (event, motion) => callback(motion);
    ipcRenderer.on("companion:drag-motion", listener);
    return () => ipcRenderer.removeListener("companion:drag-motion", listener);
  },
  getZoomFactor: () => webFrame.getZoomFactor(),
  setZoomFactor: (factor) => {
    const numericFactor = Number(factor);
    if (!Number.isFinite(numericFactor)) return webFrame.getZoomFactor();

    const nextFactor = Math.min(1.4, Math.max(0.75, numericFactor));
    webFrame.setZoomFactor(nextFactor);
    return webFrame.getZoomFactor();
  },
  selectCourseFile: () => ipcRenderer.invoke("dialog:open-course-file"),
  readCourseFile: (filePath) => ipcRenderer.invoke("file:read-course-file", filePath),
  saveFile: (options) => ipcRenderer.invoke("dialog:save-file", options),
  saveMarkdown: (options) => ipcRenderer.invoke("file:save-markdown", options),
  ai: {
    getStatus: () => ipcRenderer.invoke("b:ai:get-status"),
    saveApiKey: (apiKey) => ipcRenderer.invoke("b:ai:save-api-key", apiKey),
    clearApiKey: () => ipcRenderer.invoke("b:ai:clear-api-key"),
    askQuestion: (request) => ipcRenderer.invoke("b:ai:ask-question", request),
    askCoding: (request) => ipcRenderer.invoke("b:ai:ask-coding", request),
    summarizeDocuments: (request) => ipcRenderer.invoke("b:ai:summarize-documents", request),
    extractPdfText: (payload) => ipcRenderer.invoke("b:ai:extract-pdf-text", payload),
    recognizeImageText: (payload) => ipcRenderer.invoke("b:ai:recognize-image-text", payload),
  },
  rag: {
    askLibrary: (request) => ipcRenderer.invoke("b:rag:ask-library", request),
  },
});
