const { contextBridge, ipcRenderer, webFrame } = require("electron");

contextBridge.exposeInMainWorld("mindStudy", {
  getAppInfo: () => ipcRenderer.invoke("app:get-info"),
  wakeMainWindow: () => ipcRenderer.send("companion:wake-main"),
  updateCompanionSnapshot: (snapshot) => ipcRenderer.send("companion:update-snapshot", snapshot),
  hideCompanion: () => ipcRenderer.send("companion:hide"),
  onCompanionSnapshot: (callback) => {
    const listener = (event, snapshot) => callback(snapshot);
    ipcRenderer.on("companion:snapshot", listener);
    return () => ipcRenderer.removeListener("companion:snapshot", listener);
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
    summarizeDocuments: (request) => ipcRenderer.invoke("b:ai:summarize-documents", request),
    extractPdfText: (payload) => ipcRenderer.invoke("b:ai:extract-pdf-text", payload),
  },
  rag: {
    askLibrary: (request) => ipcRenderer.invoke("b:rag:ask-library", request),
  },
});
